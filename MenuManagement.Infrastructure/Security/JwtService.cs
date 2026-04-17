using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MenuManagement.Infrastructure.Security
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(UserEntity user)
        {
            try 
            {
                var jwtSettings = _configuration.GetSection("JwtSettings");
                
                // FORCE a 32-character key to avoid "192 bits" error on production
                string keyStr = jwtSettings["Key"] ?? "ThisIsAVerySecretKeyForQrMenuSystem123456789!";
                if (keyStr.Length < 32)
                {
                    keyStr = "ThisIsAVerySecretKeyForQrMenuSystem123456789!";
                }

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));

                var claims = new List<Claim>
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Username ?? "unknown"),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(ClaimTypes.Role, user.Role ?? "User"),
                    new Claim("id", user.Id.ToString())
                };

                var token = new JwtSecurityToken(
                    issuer: jwtSettings["Issuer"] ?? "MenuManagementAPI",
                    audience: jwtSettings["Audience"] ?? "MenuManagementFrontend",
                    claims: claims,
                    expires: DateTime.UtcNow.AddDays(7),
                    signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
                );

                return new JwtSecurityTokenHandler().WriteToken(token);
            }
            catch (Exception ex)
            {
                throw new Exception($"JWT Generation failed: {ex.Message}. Stack: {ex.StackTrace}");
            }
        }
    }
}
