using System;
using System.Threading;
using System.Threading.Tasks;
using MenuManagement.Application.Features.Orders.DTOs;

namespace MenuManagement.Application.Common.Interfaces
{
    public interface IKitchenRealtimeNotifier
    {
        Task NotifyOrderCreatedAsync(Guid objectId, KitchenOrderDto order, CancellationToken cancellationToken);
        Task NotifyOrderUpdatedAsync(Guid objectId, KitchenOrderDto order, CancellationToken cancellationToken);
        Task NotifyWaiterCalledAsync(Guid objectId, string tableLabel, CancellationToken cancellationToken);
    }
}
