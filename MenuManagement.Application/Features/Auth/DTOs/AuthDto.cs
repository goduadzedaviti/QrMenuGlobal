namespace MenuManagement.Application.Features.Auth.DTOs
{
    public class AuthDto
    {
        public Guid Id { get; set; }
        public string Token { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
