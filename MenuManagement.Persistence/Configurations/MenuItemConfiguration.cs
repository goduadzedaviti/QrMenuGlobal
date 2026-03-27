using MenuManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MenuManagement.Persistence.Configurations
{
    public class MenuItemConfiguration : IEntityTypeConfiguration<MenuItemEntity>
    {
        public void Configure(EntityTypeBuilder<MenuItemEntity> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
            builder.Property(x => x.Price).HasPrecision(18, 2);
        }
    }
}
