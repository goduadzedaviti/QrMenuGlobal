using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MenuManagement.Persistence.Migrations
{
    public partial class AddCompletedOrdersTables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "completed_orders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ObjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderNumber = table.Column<string>(type: "text", nullable: false),
                    CustomerName = table.Column<string>(type: "text", nullable: false),
                    TableLabel = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    AcceptedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RejectedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReadyAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_completed_orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_completed_orders_objects_ObjectId",
                        column: x => x.ObjectId,
                        principalTable: "objects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "completed_order_items",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    MenuItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    NameSnapshot = table.Column<string>(type: "text", nullable: false),
                    PriceSnapshot = table.Column<decimal>(type: "numeric", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_completed_order_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_completed_order_items_completed_orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "completed_orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_completed_order_items_menu_items_MenuItemId",
                        column: x => x.MenuItemId,
                        principalTable: "menu_items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_completed_order_items_MenuItemId",
                table: "completed_order_items",
                column: "MenuItemId");

            migrationBuilder.CreateIndex(
                name: "IX_completed_order_items_OrderId",
                table: "completed_order_items",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_completed_orders_ObjectId",
                table: "completed_orders",
                column: "ObjectId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "completed_order_items");

            migrationBuilder.DropTable(
                name: "completed_orders");
        }
    }
}
