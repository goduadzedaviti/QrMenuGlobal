using System;

namespace MenuManagement.Application.Common.Interfaces
{
    public interface ICurrentUserService
    {
        Guid? UserId { get; }
        string? Role { get; }
        bool IsSystemAdmin { get; }
        bool IsAdmin { get; }
    }
}
