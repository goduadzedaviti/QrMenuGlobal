using System;

namespace MenuManagement.Domain.Entities
{
    public class KitchenDeviceEntity : BaseEntity
    {
        public Guid ObjectId { get; set; }
        public string DeviceId { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Platform { get; set; } = "Web";
        public string? PushToken { get; set; }
        public string? CurrentConnectionId { get; set; }
        public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        public ObjectEntity Object { get; set; } = null!;
    }
}
