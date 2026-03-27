using MenuManagement.Domain.Entities;

namespace MenuManagement.Application.Common.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(UserEntity user);
    }
}
