using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MenuManagement.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTripAdvisorUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TripAdvisorUrl",
                table: "objects",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TripAdvisorUrl",
                table: "objects");
        }
    }
}
