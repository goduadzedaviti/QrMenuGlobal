using System;
using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using MenuManagement.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.Users.Commands
{
    public class CreateUserCommand : IRequest<OperationResult<Guid>>
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Admin";
        public bool IsActive { get; set; } = true;
    }

    public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, OperationResult<Guid>>
    {
        private readonly IMenuManagementDbContext _context;

        public CreateUserCommandHandler(IMenuManagementDbContext context)
        {
            _context = context;
        }

        public async Task<OperationResult<Guid>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {
            var entity = new UserEntity
            {
                Username = request.Username,
                PasswordHash = request.Password, // Demo purposes, using plain password
                Role = request.Role,
                IsActive = request.IsActive
            };

            _context.Users.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);

            return OperationResult<Guid>.Success(entity.Id);
        }
    }
}
