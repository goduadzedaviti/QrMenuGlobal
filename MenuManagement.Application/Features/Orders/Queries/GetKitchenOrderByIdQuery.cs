using AutoMapper;
using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Application.Features.Orders.DTOs;
using MenuManagement.Domain;
using Microsoft.EntityFrameworkCore;

namespace MenuManagement.Application.Features.Orders.Queries
{
    public class GetKitchenOrderByIdQuery : IRequest<OperationResult<KitchenOrderDto>>
    {
        public Guid ObjectId { get; set; }
        public Guid OrderId { get; set; }
    }

    public class GetKitchenOrderByIdQueryHandler : IRequestHandler<GetKitchenOrderByIdQuery, OperationResult<KitchenOrderDto>>
    {
        private readonly IMenuManagementDbContext _context;
        private readonly IMapper _mapper;

        public GetKitchenOrderByIdQueryHandler(IMenuManagementDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<OperationResult<KitchenOrderDto>> Handle(GetKitchenOrderByIdQuery request, CancellationToken cancellationToken)
        {
            var order = await _context.Orders
                .AsNoTracking()
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.ObjectId == request.ObjectId && x.Id == request.OrderId, cancellationToken);

            if (order != null)
            {
                return OperationResult<KitchenOrderDto>.Success(_mapper.Map<KitchenOrderDto>(order));
            }

            // Fallback to completed orders
            var completedOrder = await _context.CompletedOrders
                .AsNoTracking()
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.ObjectId == request.ObjectId && x.Id == request.OrderId, cancellationToken);

            if (completedOrder == null)
            {
                return OperationResult<KitchenOrderDto>.Failure("Order not found.");
            }

            return OperationResult<KitchenOrderDto>.Success(_mapper.Map<KitchenOrderDto>(completedOrder));
        }
    }
}
