using System;
using MenuManagement.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MenuManagement.Persistence.Migrations
{
    [DbContext(typeof(MenuManagementDbContext))]
    [Migration("20260324132000_AddLanguageSettings")]
    public partial class AddLanguageSettings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "language_settings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_language_settings", x => x.Id);
                });

            migrationBuilder.AddColumn<string>(
                name: "AddressEn",
                table: "objects",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AddressRu",
                table: "objects",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DescriptionEn",
                table: "objects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DescriptionRu",
                table: "objects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameEn",
                table: "objects",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameRu",
                table: "objects",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DescriptionEn",
                table: "menus",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DescriptionRu",
                table: "menus",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameEn",
                table: "menus",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameRu",
                table: "menus",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DescriptionEn",
                table: "menu_items",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DescriptionRu",
                table: "menu_items",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameEn",
                table: "menu_items",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameRu",
                table: "menu_items",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "AddressEn", table: "objects");
            migrationBuilder.DropColumn(name: "AddressRu", table: "objects");
            migrationBuilder.DropColumn(name: "DescriptionEn", table: "objects");
            migrationBuilder.DropColumn(name: "DescriptionRu", table: "objects");
            migrationBuilder.DropColumn(name: "NameEn", table: "objects");
            migrationBuilder.DropColumn(name: "NameRu", table: "objects");

            migrationBuilder.DropColumn(name: "DescriptionEn", table: "menus");
            migrationBuilder.DropColumn(name: "DescriptionRu", table: "menus");
            migrationBuilder.DropColumn(name: "NameEn", table: "menus");
            migrationBuilder.DropColumn(name: "NameRu", table: "menus");

            migrationBuilder.DropColumn(name: "DescriptionEn", table: "menu_items");
            migrationBuilder.DropColumn(name: "DescriptionRu", table: "menu_items");
            migrationBuilder.DropColumn(name: "NameEn", table: "menu_items");
            migrationBuilder.DropColumn(name: "NameRu", table: "menu_items");

            migrationBuilder.DropTable(
                name: "language_settings");
        }
    }
}
