using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.Users.Commands
{
    public class DeleteUserCommand : IRequest<OperationResult>
    {
        public Guid Id { get; set; }
    }

    public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, OperationResult>
    {
        private readonly IMenuManagementDbContext _context;

        public DeleteUserCommandHandler(IMenuManagementDbContext context)
        {
            _context = context;
        }

        public async Task<OperationResult> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
        {
            var entity = await _context.Users.FindAsync(new object[] { request.Id }, cancellationToken);

            if (entity == null)
            {
                return OperationResult.Failure("User not found.");
            }

            if (entity.Username == "admin")
            {
                return OperationResult.Failure("Cannot delete the default system administrator.");
            }

            _context.Users.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);

            return OperationResult.Success();
        }
    }
}
