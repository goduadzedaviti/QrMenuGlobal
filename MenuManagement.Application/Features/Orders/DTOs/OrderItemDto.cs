using System;

namespace MenuManagement.Application.Features.Orders.DTOs
{
    public class OrderItemDto
    {
        public Guid Id { get; set; }
        public Guid MenuItemId { get; set; }
        public string NameSnapshot { get; set; } = string.Empty;
        public decimal PriceSnapshot { get; set; }
        public int Quantity { get; set; }
        public string? Notes { get; set; }
    }
}
