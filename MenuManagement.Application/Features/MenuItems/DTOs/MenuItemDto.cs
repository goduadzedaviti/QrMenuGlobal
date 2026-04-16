using System;

namespace MenuManagement.Application.Features.MenuItems.DTOs
{
    public class MenuItemDto
    {
        public Guid Id { get; set; }
        public Guid MenuId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? NameEn { get; set; }
        public string? NameRu { get; set; }
        public string? Description { get; set; }
        public string? DescriptionEn { get; set; }
        public string? DescriptionRu { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public string? ModelUrl { get; set; }
        public int SortOrder { get; set; }
        public bool IsAvailable { get; set; }
        public bool ShowAr { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
