using System;

namespace MenuManagement.Domain.Entities
{
    public class LanguageSetting : BaseEntity
    {
        public string Code { get; set; } = string.Empty; // ka, en, ru
        public string Name { get; set; } = string.Empty; // Georgian, English, Russian
        public bool IsActive { get; set; } = true;
    }
}
