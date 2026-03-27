using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MenuManagement.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddObjectUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "objects",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "objects");
        }
    }
}
