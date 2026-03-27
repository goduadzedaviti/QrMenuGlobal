using System;

namespace MenuManagement.Application.Features.Orders.DTOs
{
    public class KitchenDeviceDto
    {
        public Guid Id { get; set; }
        public Guid ObjectId { get; set; }
        public string DeviceId { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public string? PushToken { get; set; }
        public string? CurrentConnectionId { get; set; }
        public DateTime LastSeenAt { get; set; }
    }
}
