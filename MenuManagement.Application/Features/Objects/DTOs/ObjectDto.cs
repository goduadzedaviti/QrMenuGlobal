using System;

namespace MenuManagement.Application.Features.Objects.DTOs
{
    public class ObjectDto
    {
        public Guid Id { get; set; }
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
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
