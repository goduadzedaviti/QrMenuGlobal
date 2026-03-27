using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;
using MenuManagement.Domain.Entities;

namespace MenuManagement.Application.Common.Interfaces
{
    public interface IMenuManagementDbContext
    {
        DbSet<ObjectEntity> Objects { get; }
        DbSet<MenuEntity> Menus { get; }
        DbSet<MenuItemEntity> MenuItems { get; }
        DbSet<UserEntity> Users { get; }
        DbSet<LanguageSetting> LanguageSettings { get; }
        DbSet<OrderEntity> Orders { get; }
        DbSet<OrderItemEntity> OrderItems { get; }
        DbSet<CompletedOrderEntity> CompletedOrders { get; }
        DbSet<CompletedOrderItemEntity> CompletedOrderItems { get; }
        DbSet<KitchenDeviceEntity> KitchenDevices { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
