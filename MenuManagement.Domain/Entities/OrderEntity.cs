using System;
using System.Collections.Generic;

namespace MenuManagement.Domain.Entities
{
    public class OrderEntity : BaseEntity
    {
        public Guid ObjectId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = "Guest";
        public string TableLabel { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string Status { get; set; } = "Created";
        public DateTime? AcceptedAt { get; set; }
        public DateTime? RejectedAt { get; set; }
        public DateTime? ReadyAt { get; set; }

        public ObjectEntity Object { get; set; } = null!;
        public ICollection<OrderItemEntity> Items { get; set; } = new List<OrderItemEntity>();
    }
}
