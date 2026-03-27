using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Application.Features.LanguageSettings.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.LanguageSettings.Queries.GetLanguageSettings
{
    public class GetLanguageSettingsQuery : IRequest<List<LanguageSettingDto>>
    {
    }

    public class GetLanguageSettingsQueryHandler : IRequestHandler<GetLanguageSettingsQuery, List<LanguageSettingDto>>
    {
        private readonly IMenuManagementDbContext _context;

        public GetLanguageSettingsQueryHandler(IMenuManagementDbContext context)
        {
            _context = context;
        }

        public async Task<List<LanguageSettingDto>> Handle(GetLanguageSettingsQuery request, CancellationToken cancellationToken)
        {
            return await _context.LanguageSettings
                .Select(l => new LanguageSettingDto
                {
                    Id = l.Id,
                    Code = l.Code,
                    Name = l.Name,
                    IsActive = l.IsActive
                })
                .ToListAsync(cancellationToken);
        }
    }
}
