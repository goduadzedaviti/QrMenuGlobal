using System;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using MenuManagement.Application.Common.Interfaces;

namespace MenuManagement.Infrastructure.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid? UserId
        {
            get
            {
                var claims = _httpContextAccessor.HttpContext?.User?.Claims;
                
                // Prioritize our custom "id" claim which we know contains the GUID
                var idClaim = claims?.FirstOrDefault(c => c.Type == "id");
                
                // Fallback to others only if they are valid GUIDs
                if (idClaim == null)
                {
                    idClaim = claims?.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier || c.Type == "sub");
                }

                if (idClaim != null && Guid.TryParse(idClaim.Value, out var guid))
                {
                    return guid;
                }
                return null;
            }
        }

        public string? Role 
        {
            get
            {
                var role = _httpContextAccessor.HttpContext?.User?.Claims?.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role")?.Value;
                System.Console.WriteLine($"[CurrentUserService] Detected Role: {role}");
                return role;
            }
        }

        public bool IsSystemAdmin => string.Equals(Role, "SystemAdmin", StringComparison.OrdinalIgnoreCase);

        public bool IsAdmin => IsSystemAdmin || string.Equals(Role, "Admin", StringComparison.OrdinalIgnoreCase);
    }
}
