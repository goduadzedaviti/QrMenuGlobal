using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Persistence
{
    public class MenuManagementDbContext : DbContext, IMenuManagementDbContext
    {
        public MenuManagementDbContext(DbContextOptions<MenuManagementDbContext> options)
            : base(options)
        {
        }

        public DbSet<ObjectEntity> Objects => Set<ObjectEntity>();
        public DbSet<MenuEntity> Menus => Set<MenuEntity>();
        public DbSet<MenuItemEntity> MenuItems => Set<MenuItemEntity>();
        public DbSet<UserEntity> Users => Set<UserEntity>();
        public DbSet<LanguageSetting> LanguageSettings => Set<LanguageSetting>();
        public DbSet<OrderEntity> Orders => Set<OrderEntity>();
        public DbSet<OrderItemEntity> OrderItems => Set<OrderItemEntity>();
        public DbSet<CompletedOrderEntity> CompletedOrders => Set<CompletedOrderEntity>();
        public DbSet<CompletedOrderItemEntity> CompletedOrderItems => Set<CompletedOrderItemEntity>();
        public DbSet<KitchenDeviceEntity> KitchenDevices => Set<KitchenDeviceEntity>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
            base.OnModelCreating(modelBuilder);

            // PostgreSQL defaults to lowercase, so we force it to avoid case-sensitivity issues
            if (Database.ProviderName == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                foreach (var entity in modelBuilder.Model.GetEntityTypes())
                {
                    entity.SetTableName(entity.GetTableName()?.ToLower().Replace("entity", "s"));
                }
                
                // Explicitly map specific tables to be sure
                modelBuilder.Entity<UserEntity>().ToTable("users");
                modelBuilder.Entity<ObjectEntity>().ToTable("objects");
                modelBuilder.Entity<MenuEntity>().ToTable("menus");
                modelBuilder.Entity<MenuItemEntity>().ToTable("menu_items");
                modelBuilder.Entity<LanguageSetting>().ToTable("language_settings");
                modelBuilder.Entity<OrderEntity>().ToTable("orders");
                modelBuilder.Entity<OrderItemEntity>().ToTable("order_items");
                modelBuilder.Entity<CompletedOrderEntity>().ToTable("completed_orders");
                modelBuilder.Entity<CompletedOrderItemEntity>().ToTable("completed_order_items");
                modelBuilder.Entity<KitchenDeviceEntity>().ToTable("kitchen_devices");
            }
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return base.SaveChangesAsync(cancellationToken);
        }
    }
}
