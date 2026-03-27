using MenuManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MenuManagement.Persistence.Configurations
{
    public class ObjectConfiguration : IEntityTypeConfiguration<ObjectEntity>
    {
        public void Configure(EntityTypeBuilder<ObjectEntity> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
            builder.Property(x => x.Address).HasMaxLength(500);
            builder.Property(x => x.Phone).HasMaxLength(20);

            builder.HasMany(x => x.Menus)
                .WithOne(x => x.Object)
                .HasForeignKey(x => x.ObjectId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
