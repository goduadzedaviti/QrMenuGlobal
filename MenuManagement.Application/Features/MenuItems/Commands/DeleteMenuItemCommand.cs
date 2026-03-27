using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.MenuItems.Commands
{
    public class DeleteMenuItemCommand : IRequest<OperationResult>
    {
        public Guid Id { get; set; }
    }

    public class DeleteMenuItemCommandHandler : IRequestHandler<DeleteMenuItemCommand, OperationResult>
    {
        private readonly IMenuManagementDbContext _context;

        public DeleteMenuItemCommandHandler(IMenuManagementDbContext context)
        {
            _context = context;
        }

        public async Task<OperationResult> Handle(DeleteMenuItemCommand request, CancellationToken cancellationToken)
        {
            var entity = await _context.MenuItems.FindAsync(new object[] { request.Id }, cancellationToken);

            if (entity == null)
            {
                return OperationResult.Failure("Menu item not found.");
            }

            _context.MenuItems.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);

            return OperationResult.Success();
        }
    }
}
