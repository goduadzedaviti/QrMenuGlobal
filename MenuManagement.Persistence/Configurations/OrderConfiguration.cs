using MenuManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MenuManagement.Persistence.Configurations
{
    public class OrderConfiguration : IEntityTypeConfiguration<OrderEntity>
    {
        public void Configure(EntityTypeBuilder<OrderEntity> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.OrderNumber).HasMaxLength(32).IsRequired();
            builder.Property(x => x.CustomerName).HasMaxLength(128).IsRequired();
            builder.Property(x => x.TableLabel).HasMaxLength(64).IsRequired();
            builder.Property(x => x.Notes).HasMaxLength(500);
            builder.Property(x => x.Status).HasMaxLength(24).IsRequired();

            builder.HasMany(x => x.Items)
                .WithOne(x => x.Order)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Object)
                .WithMany(x => x.Orders)
                .HasForeignKey(x => x.ObjectId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
