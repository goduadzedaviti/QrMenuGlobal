using MenuManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MenuManagement.Persistence.Configurations
{
    public class KitchenDeviceConfiguration : IEntityTypeConfiguration<KitchenDeviceEntity>
    {
        public void Configure(EntityTypeBuilder<KitchenDeviceEntity> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.DeviceId).HasMaxLength(128).IsRequired();
            builder.Property(x => x.DisplayName).HasMaxLength(128).IsRequired();
            builder.Property(x => x.Platform).HasMaxLength(32).IsRequired();
            builder.Property(x => x.PushToken).HasMaxLength(255);
            builder.Property(x => x.CurrentConnectionId).HasMaxLength(128);
            builder.HasIndex(x => x.DeviceId).IsUnique();

            builder.HasOne(x => x.Object)
                .WithMany(x => x.KitchenDevices)
                .HasForeignKey(x => x.ObjectId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
