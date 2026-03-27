namespace MenuManagement.Domain.Entities
{
    public class UserEntity : BaseEntity
    {
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Admin";
        public bool IsActive { get; set; } = true;
    }
}
