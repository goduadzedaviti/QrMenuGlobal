using Microsoft.EntityFrameworkCore;

namespace MenuManagement.Persistence
{
    public static class KitchenSchemaBootstrapper
    {
        public static async Task EnsureAsync(MenuManagementDbContext context, CancellationToken cancellationToken = default)
        {
            await context.Database.ExecuteSqlRawAsync("""
                CREATE TABLE IF NOT EXISTS orders (
                    "Id" uuid PRIMARY KEY,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "ObjectId" uuid NOT NULL REFERENCES objects("Id") ON DELETE CASCADE,
                    "OrderNumber" character varying(32) NOT NULL,
                    "CustomerName" character varying(128) NOT NULL,
                    "TableLabel" character varying(64) NOT NULL,
                    "Notes" character varying(500) NULL,
                    "Status" character varying(24) NOT NULL,
                    "AcceptedAt" timestamp with time zone NULL,
                    "RejectedAt" timestamp with time zone NULL,
                    "ReadyAt" timestamp with time zone NULL
                );
                CREATE INDEX IF NOT EXISTS ix_orders_objectid_status ON orders("ObjectId", "Status");
                """, cancellationToken);

            await context.Database.ExecuteSqlRawAsync("""
                CREATE TABLE IF NOT EXISTS order_items (
                    "Id" uuid PRIMARY KEY,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "OrderId" uuid NOT NULL REFERENCES orders("Id") ON DELETE CASCADE,
                    "MenuItemId" uuid NOT NULL REFERENCES menu_items("Id") ON DELETE RESTRICT,
                    "NameSnapshot" character varying(200) NOT NULL,
                    "PriceSnapshot" numeric(10,2) NOT NULL,
                    "Quantity" integer NOT NULL,
                    "Notes" character varying(500) NULL
                );
                CREATE INDEX IF NOT EXISTS ix_order_items_orderid ON order_items("OrderId");
                """, cancellationToken);

            await context.Database.ExecuteSqlRawAsync("""
                CREATE TABLE IF NOT EXISTS kitchen_devices (
                    "Id" uuid PRIMARY KEY,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "ObjectId" uuid NOT NULL REFERENCES objects("Id") ON DELETE CASCADE,
                    "DeviceId" character varying(128) NOT NULL,
                    "DisplayName" character varying(128) NOT NULL,
                    "Platform" character varying(32) NOT NULL,
                    "PushToken" character varying(255) NULL,
                    "CurrentConnectionId" character varying(128) NULL,
                    "LastSeenAt" timestamp with time zone NOT NULL,
                    "IsActive" boolean NOT NULL
                );
                CREATE UNIQUE INDEX IF NOT EXISTS ix_kitchen_devices_deviceid ON kitchen_devices("DeviceId");
                CREATE INDEX IF NOT EXISTS ix_kitchen_devices_objectid_isactive ON kitchen_devices("ObjectId", "IsActive");
                """, cancellationToken);
        }
    }
}
