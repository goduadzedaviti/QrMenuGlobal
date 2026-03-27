using AutoMapper;
using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Application.Features.Orders.DTOs;
using MenuManagement.Domain;
using MenuManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MenuManagement.Application.Features.Orders.Commands
{
    public class UpdateOrderStatusCommand : IRequest<OperationResult<KitchenOrderDto>>
    {
        public Guid ObjectId { get; set; }
        public Guid OrderId { get; set; }
        public string Action { get; set; } = string.Empty;
    }

    public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, OperationResult<KitchenOrderDto>>
    {
        private readonly IMenuManagementDbContext _context;
        private readonly IMapper _mapper;
        private readonly IKitchenRealtimeNotifier _notifier;

        public UpdateOrderStatusCommandHandler(
            IMenuManagementDbContext context,
            IMapper mapper,
            IKitchenRealtimeNotifier notifier)
        {
            _context = context;
            _mapper = mapper;
            _notifier = notifier;
        }

        public async Task<OperationResult<KitchenOrderDto>> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
        {
            var order = await _context.Orders
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.Id == request.OrderId && x.ObjectId == request.ObjectId, cancellationToken);

            if (order == null)
            {
                return OperationResult<KitchenOrderDto>.Failure("Order not found.");
            }

            var action = request.Action.Trim().ToLowerInvariant();
            switch (action)
            {
                case "accept" when order.Status == "Created":
                    order.Status = "Accepted";
                    order.AcceptedAt = DateTime.UtcNow;
                    break;
                case "reject" when order.Status == "Created":
                    order.Status = "Rejected";
                    order.RejectedAt = DateTime.UtcNow;
                    break;
                case "ready" when order.Status == "Accepted" || order.Status == "Created":
                    if (order.Status == "Created")
                    {
                        order.AcceptedAt = DateTime.UtcNow;
                    }
                    order.Status = "Ready";
                    order.ReadyAt = DateTime.UtcNow;

                    var completed = new CompletedOrderEntity
                    {
                        Id = order.Id,
                        ObjectId = order.ObjectId,
                        OrderNumber = order.OrderNumber,
                        CustomerName = order.CustomerName,
                        TableLabel = order.TableLabel,
                        Notes = order.Notes,
                        Status = order.Status,
                        CreatedAt = order.CreatedAt,
                        AcceptedAt = order.AcceptedAt,
                        RejectedAt = order.RejectedAt,
                        ReadyAt = order.ReadyAt
                    };

                    foreach(var item in order.Items)
                    {
                        completed.Items.Add(new CompletedOrderItemEntity
                        {
                            Id = item.Id,
                            OrderId = item.OrderId,
                            MenuItemId = item.MenuItemId,
                            NameSnapshot = item.NameSnapshot,
                            PriceSnapshot = item.PriceSnapshot,
                            Quantity = item.Quantity,
                            Notes = item.Notes,
                            CreatedAt = item.CreatedAt
                        });
                    }

                    _context.CompletedOrders.Add(completed);
                    _context.Orders.Remove(order);
                    break;
                default:
                    return OperationResult<KitchenOrderDto>.Failure("Invalid order transition.");
            }

            await _context.SaveChangesAsync(cancellationToken);

            var dto = _mapper.Map<KitchenOrderDto>(order);
            await _notifier.NotifyOrderUpdatedAsync(request.ObjectId, dto, cancellationToken);
            return OperationResult<KitchenOrderDto>.Success(dto);
        }
    }
}
