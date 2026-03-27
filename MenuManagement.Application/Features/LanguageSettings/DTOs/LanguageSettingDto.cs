using System;

namespace MenuManagement.Application.Features.LanguageSettings.DTOs
{
    public class LanguageSettingDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}
