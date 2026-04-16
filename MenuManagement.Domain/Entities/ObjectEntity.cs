using System.Collections.Generic;

namespace MenuManagement.Domain.Entities
{
    public class ObjectEntity : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? NameEn { get; set; }
        public string? NameRu { get; set; }
        public string? Description { get; set; }
        public string? DescriptionEn { get; set; }
        public string? DescriptionRu { get; set; }
        public string? ImageUrl { get; set; }
        public string? GoogleReviewUrl { get; set; }
        public string? TripAdvisorUrl { get; set; }
        public string? Address { get; set; }
        public string? AddressEn { get; set; }
        public string? AddressRu { get; set; }
        public string? Phone { get; set; }
        public bool IsActive { get; set; } = true;

        public Guid? UserId { get; set; }

        public ICollection<MenuEntity> Menus { get; set; } = new List<MenuEntity>();
        public ICollection<OrderEntity> Orders { get; set; } = new List<OrderEntity>();
        public ICollection<KitchenDeviceEntity> KitchenDevices { get; set; } = new List<KitchenDeviceEntity>();
    }
}
