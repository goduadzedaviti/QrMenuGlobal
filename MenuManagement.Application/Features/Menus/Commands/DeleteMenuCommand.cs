using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.Menus.Commands
{
    public class DeleteMenuCommand : IRequest<OperationResult>
    {
        public Guid Id { get; set; }
    }

    public class DeleteMenuCommandHandler : IRequestHandler<DeleteMenuCommand, OperationResult>
    {
        private readonly IMenuManagementDbContext _context;

        public DeleteMenuCommandHandler(IMenuManagementDbContext context)
        {
            _context = context;
        }

        public async Task<OperationResult> Handle(DeleteMenuCommand request, CancellationToken cancellationToken)
        {
            var entity = await _context.Menus.FindAsync(new object[] { request.Id }, cancellationToken);

            if (entity == null)
            {
                return OperationResult.Failure("Menu not found.");
            }

            _context.Menus.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);

            return OperationResult.Success();
        }
    }
}
