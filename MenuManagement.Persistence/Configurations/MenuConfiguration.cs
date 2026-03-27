using MenuManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MenuManagement.Persistence.Configurations
{
    public class MenuConfiguration : IEntityTypeConfiguration<MenuEntity>
    {
        public void Configure(EntityTypeBuilder<MenuEntity> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).HasMaxLength(200).IsRequired();

            builder.HasMany(x => x.MenuItems)
                .WithOne(x => x.Menu)
                .HasForeignKey(x => x.MenuId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
