using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.Users.Commands
{
    public class UpdateUserCommand : IRequest<OperationResult>
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? Password { get; set; } // Optional: only update if provided
        public string Role { get; set; } = "Admin";
        public bool IsActive { get; set; } = true;
    }

    public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, OperationResult>
    {
        private readonly IMenuManagementDbContext _context;

        public UpdateUserCommandHandler(IMenuManagementDbContext context)
        {
            _context = context;
        }

        public async Task<OperationResult> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
        {
            var entity = await _context.Users.FindAsync(new object[] { request.Id }, cancellationToken);

            if (entity == null)
            {
                return OperationResult.Failure("User not found.");
            }

            entity.Username = request.Username;
            entity.Role = request.Role;
            entity.IsActive = request.IsActive;

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                entity.PasswordHash = request.Password;
            }

            await _context.SaveChangesAsync(cancellationToken);

            return OperationResult.Success();
        }
    }
}
