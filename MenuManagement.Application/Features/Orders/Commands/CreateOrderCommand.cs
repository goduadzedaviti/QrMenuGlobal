using AutoMapper;
using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Application.Features.Orders.DTOs;
using MenuManagement.Domain;
using MenuManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MenuManagement.Application.Features.Orders.Commands
{
    public class CreateOrderCommand : IRequest<OperationResult<KitchenOrderDto>>
    {
        public Guid ObjectId { get; set; }
        public string CustomerName { get; set; } = "Guest";
        public string TableLabel { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public List<CreateOrderItemModel> Items { get; set; } = new();
    }

    public class CreateOrderItemModel
    {
        public Guid MenuItemId { get; set; }
        public int Quantity { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, OperationResult<KitchenOrderDto>>
    {
        private readonly IMenuManagementDbContext _context;
        private readonly IMapper _mapper;
        private readonly IKitchenRealtimeNotifier _notifier;

        public CreateOrderCommandHandler(
            IMenuManagementDbContext context,
            IMapper mapper,
            IKitchenRealtimeNotifier notifier)
        {
            _context = context;
            _mapper = mapper;
            _notifier = notifier;
        }

        public async Task<OperationResult<KitchenOrderDto>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            if (request.Items.Count == 0)
            {
                return OperationResult<KitchenOrderDto>.Failure("At least one order item is required.");
            }

            var objectExists = await _context.Objects
                .AnyAsync(x => x.Id == request.ObjectId && x.IsActive, cancellationToken);

            if (!objectExists)
            {
                return OperationResult<KitchenOrderDto>.Failure("Restaurant was not found.");
            }

            var requestedIds = request.Items.Select(x => x.MenuItemId).Distinct().ToList();
            var menuItems = await _context.MenuItems
                .Include(x => x.Menu)
                .Where(x => requestedIds.Contains(x.Id) && x.IsAvailable && x.Menu.ObjectId == request.ObjectId)
                .ToListAsync(cancellationToken);

            if (menuItems.Count != requestedIds.Count)
            {
                return OperationResult<KitchenOrderDto>.Failure("One or more selected menu items are unavailable.");
            }

            var order = new OrderEntity
            {
                ObjectId = request.ObjectId,
                CustomerName = string.IsNullOrWhiteSpace(request.CustomerName) ? "Guest" : request.CustomerName.Trim(),
                TableLabel = request.TableLabel.Trim(),
                Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
                Status = "Created",
                OrderNumber = $"QR-{DateTime.UtcNow:HHmmss}"
            };

            foreach (var requestItem in request.Items)
            {
                var menuItem = menuItems.First(x => x.Id == requestItem.MenuItemId);
                order.Items.Add(new OrderItemEntity
                {
                    MenuItemId = menuItem.Id,
                    NameSnapshot = menuItem.Name,
                    PriceSnapshot = menuItem.Price,
                    Quantity = requestItem.Quantity,
                    Notes = string.IsNullOrWhiteSpace(requestItem.Notes) ? null : requestItem.Notes.Trim()
                });
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync(cancellationToken);

            var createdOrder = await _context.Orders
                .AsNoTracking()
                .Include(x => x.Items)
                .FirstAsync(x => x.Id == order.Id, cancellationToken);

            var result = _mapper.Map<KitchenOrderDto>(createdOrder);
            await _notifier.NotifyOrderCreatedAsync(request.ObjectId, result, cancellationToken);
            return OperationResult<KitchenOrderDto>.Success(result);
        }
    }
}
