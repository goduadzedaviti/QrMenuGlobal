using MenuManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MenuManagement.Persistence.Configurations
{
    public class LanguageSettingConfiguration : IEntityTypeConfiguration<LanguageSetting>
    {
        public void Configure(EntityTypeBuilder<LanguageSetting> builder)
        {
            builder.ToTable("language_settings");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Code)
                .IsRequired()
                .HasMaxLength(10);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(100);
        }
    }
}
