using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.Auth.Commands
{
    public class ChangePasswordCommand : IRequest<OperationResult>
    {
        public Guid UserId { get; set; }
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, OperationResult>
    {
        private readonly IMenuManagementDbContext _context;

        public ChangePasswordCommandHandler(IMenuManagementDbContext context)
        {
            _context = context;
        }

        public async Task<OperationResult> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

            if (user == null)
            {
                return OperationResult.Failure("User not found.");
            }

            if (user.PasswordHash != request.CurrentPassword)
            {
                return OperationResult.Failure("Incorrect current password.");
            }

            user.PasswordHash = request.NewPassword;
            await _context.SaveChangesAsync(cancellationToken);

            return OperationResult.Success();
        }
    }
}
