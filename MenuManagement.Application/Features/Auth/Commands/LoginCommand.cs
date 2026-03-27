using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using MenuManagement.Application.Features.Auth.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.Auth.Commands
{
    public class LoginCommand : IRequest<OperationResult<AuthDto>>
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginCommandHandler : IRequestHandler<LoginCommand, OperationResult<AuthDto>>
    {
        private readonly IMenuManagementDbContext _context;
        private readonly IJwtService _jwtService;

        public LoginCommandHandler(IMenuManagementDbContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        public async Task<OperationResult<AuthDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            System.Console.WriteLine($"[Login] Attempt for username: {request.Username}");
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == request.Username, cancellationToken);

            if (user == null) 
            {
                System.Console.WriteLine($"[Login] User not found: {request.Username}");
                return OperationResult<AuthDto>.Failure("Invalid credentials.");
            }

            if (user.PasswordHash != request.Password) 
            {
                System.Console.WriteLine($"[Login] Password mismatch for: {request.Username}");
                return OperationResult<AuthDto>.Failure("Invalid credentials.");
            }

            if (!user.IsActive)
            {
                System.Console.WriteLine($"[Login] User deactivated: {request.Username}");
                return OperationResult<AuthDto>.Failure("User is deactivated.");
            }

            System.Console.WriteLine($"[Login] Success for: {request.Username}, Role: {user.Role}");

            var token = _jwtService.GenerateToken(user);

            return OperationResult<AuthDto>.Success(new AuthDto
            {
                Id = user.Id,
                Token = token,
                Username = user.Username,
                Role = user.Role
            });
        }
    }
}
