using System;
using System.Collections.Generic;

namespace MenuManagement.Domain.Entities
{
    public class MenuEntity : BaseEntity
    {
        public Guid ObjectId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? NameEn { get; set; }
        public string? NameRu { get; set; }
        public string? Description { get; set; }
        public string? DescriptionEn { get; set; }
        public string? DescriptionRu { get; set; }
        public int SortOrder { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;

        public ObjectEntity Object { get; set; } = null!;
        public ICollection<MenuItemEntity> MenuItems { get; set; } = new List<MenuItemEntity>();
    }
}
