using MenuManagement.Persistence;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace MenuManagement.API.Hubs
{
    public interface IKitchenClient
    {
        Task OrderCreated(object payload);
        Task OrderUpdated(object payload);
        Task WaiterCalled(object payload);
        Task BillRequested(object payload);
    }

    public class KitchenHub : Hub<IKitchenClient>
    {
        private readonly MenuManagementDbContext _dbContext;

        public KitchenHub(MenuManagementDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task RegisterDevice(string deviceId, Guid objectId)
        {
            var device = await _dbContext.KitchenDevices.FirstOrDefaultAsync(x => x.DeviceId == deviceId);
            if (device != null)
            {
                device.ObjectId = objectId;
                device.CurrentConnectionId = Context.ConnectionId;
                device.LastSeenAt = DateTime.UtcNow;
                device.IsActive = true;
                await _dbContext.SaveChangesAsync();
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, GetGroupName(objectId));
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var device = await _dbContext.KitchenDevices.FirstOrDefaultAsync(x => x.CurrentConnectionId == Context.ConnectionId);
            if (device != null)
            {
                device.CurrentConnectionId = null;
                device.LastSeenAt = DateTime.UtcNow;
                await _dbContext.SaveChangesAsync();
            }

            await base.OnDisconnectedAsync(exception);
        }

        public static string GetGroupName(Guid objectId) => $"object:{objectId:N}";
    }
}
