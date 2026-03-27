using System;

namespace MenuManagement.Domain.Entities
{
    public class CompletedOrderItemEntity : BaseEntity
    {
        public Guid OrderId { get; set; }
        public Guid MenuItemId { get; set; }
        public string NameSnapshot { get; set; } = string.Empty;
        public decimal PriceSnapshot { get; set; }
        public int Quantity { get; set; }
        public string? Notes { get; set; }

        public CompletedOrderEntity Order { get; set; } = null!;
        public MenuItemEntity MenuItem { get; set; } = null!;
    }
}
