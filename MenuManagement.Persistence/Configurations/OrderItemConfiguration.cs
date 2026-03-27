using MenuManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MenuManagement.Persistence.Configurations
{
    public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItemEntity>
    {
        public void Configure(EntityTypeBuilder<OrderItemEntity> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.NameSnapshot).HasMaxLength(200).IsRequired();
            builder.Property(x => x.PriceSnapshot).HasColumnType("numeric(10,2)");
            builder.Property(x => x.Notes).HasMaxLength(500);

            builder.HasOne(x => x.MenuItem)
                .WithMany()
                .HasForeignKey(x => x.MenuItemId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
