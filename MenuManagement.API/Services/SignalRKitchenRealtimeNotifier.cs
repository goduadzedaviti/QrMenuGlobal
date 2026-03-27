using MenuManagement.API.Hubs;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Application.Features.Orders.DTOs;
using Microsoft.AspNetCore.SignalR;

namespace MenuManagement.API.Services
{
    public class SignalRKitchenRealtimeNotifier : IKitchenRealtimeNotifier
    {
        private readonly IHubContext<KitchenHub, IKitchenClient> _hubContext;

        public SignalRKitchenRealtimeNotifier(IHubContext<KitchenHub, IKitchenClient> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task NotifyOrderCreatedAsync(Guid objectId, KitchenOrderDto order, CancellationToken cancellationToken)
        {
            await _hubContext.Clients.Group(KitchenHub.GetGroupName(objectId)).OrderCreated(order);
        }

        public async Task NotifyOrderUpdatedAsync(Guid objectId, KitchenOrderDto order, CancellationToken cancellationToken)
        {
            await _hubContext.Clients.Group(KitchenHub.GetGroupName(objectId)).OrderUpdated(order);
        }

        public async Task NotifyWaiterCalledAsync(Guid objectId, string tableLabel, CancellationToken cancellationToken)
        {
            await _hubContext.Clients.Group(KitchenHub.GetGroupName(objectId)).WaiterCalled(new { tableLabel, calledAtUtc = DateTime.UtcNow });
        }
    }
}
