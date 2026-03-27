using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Application.Features.Orders.DTOs;
using MenuManagement.Domain;
using Microsoft.EntityFrameworkCore;

namespace MenuManagement.Application.Features.Orders.Queries
{
    public class GetKitchenOrdersQuery : IRequest<OperationResult<List<KitchenOrderDto>>>
    {
        public Guid ObjectId { get; set; }
        public bool ShowCompleted { get; set; } = false;
    }

    public class GetKitchenOrdersQueryHandler : IRequestHandler<GetKitchenOrdersQuery, OperationResult<List<KitchenOrderDto>>>
    {
        private readonly IMenuManagementDbContext _context;
        private readonly IMapper _mapper;

        public GetKitchenOrdersQueryHandler(IMenuManagementDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<OperationResult<List<KitchenOrderDto>>> Handle(GetKitchenOrdersQuery request, CancellationToken cancellationToken)
        {
            List<KitchenOrderDto> orders;

            if (request.ShowCompleted)
            {
                var threshold = DateTime.UtcNow.AddDays(-1);
                orders = await _context.CompletedOrders
                    .AsNoTracking()
                    .Where(x => x.ObjectId == request.ObjectId && x.CreatedAt > threshold)
                    .OrderByDescending(x => x.ReadyAt ?? x.CreatedAt)
                    .ProjectTo<KitchenOrderDto>(_mapper.ConfigurationProvider)
                    .ToListAsync(cancellationToken);
            }
            else
            {
                orders = await _context.Orders
                    .AsNoTracking()
                    .Where(x => x.ObjectId == request.ObjectId)
                    .OrderByDescending(x => x.CreatedAt)
                    .ProjectTo<KitchenOrderDto>(_mapper.ConfigurationProvider)
                    .ToListAsync(cancellationToken);
            }

            return OperationResult<List<KitchenOrderDto>>.Success(orders);
        }
    }
}
