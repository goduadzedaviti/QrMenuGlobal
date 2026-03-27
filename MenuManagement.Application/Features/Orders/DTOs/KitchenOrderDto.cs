using System;
using System.Collections.Generic;

namespace MenuManagement.Application.Features.Orders.DTOs
{
    public class KitchenOrderDto
    {
        public Guid Id { get; set; }
        public Guid ObjectId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string TableLabel { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? RejectedAt { get; set; }
        public DateTime? ReadyAt { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }
}
