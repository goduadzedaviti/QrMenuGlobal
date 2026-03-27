using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.Orders.Commands
{
    public class CallWaiterCommand : IRequest<OperationResult<bool>>
    {
        public Guid ObjectId { get; set; }
        public string TableLabel { get; set; } = string.Empty;
    }

    public class CallWaiterCommandHandler : IRequestHandler<CallWaiterCommand, OperationResult<bool>>
    {
        private readonly IMenuManagementDbContext _context;
        private readonly IKitchenRealtimeNotifier _notifier;

        public CallWaiterCommandHandler(IMenuManagementDbContext context, IKitchenRealtimeNotifier notifier)
        {
            _context = context;
            _notifier = notifier;
        }

        public async Task<OperationResult<bool>> Handle(CallWaiterCommand request, CancellationToken cancellationToken)
        {
            var objectExists = await _context.Objects
                .AnyAsync(x => x.Id == request.ObjectId && x.IsActive, cancellationToken);

            if (!objectExists)
            {
                return OperationResult<bool>.Failure("Restaurant was not found.");
            }

            await _notifier.NotifyWaiterCalledAsync(request.ObjectId, request.TableLabel, cancellationToken);
            return OperationResult<bool>.Success(true);
        }
    }
}
