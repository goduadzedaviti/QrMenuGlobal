using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MenuManagement.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EnableShowArForExistingModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE menu_items SET \"ShowAr\" = TRUE WHERE \"ModelUrl\" IS NOT NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
