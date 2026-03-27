using MediatR;
using MenuManagement.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.LanguageSettings.Queries.GetActiveLanguages
{
    public class GetActiveLanguagesQuery : IRequest<List<string>>
    {
    }

    public class GetActiveLanguagesQueryHandler : IRequestHandler<GetActiveLanguagesQuery, List<string>>
    {
        private readonly IMenuManagementDbContext _context;

        public GetActiveLanguagesQueryHandler(IMenuManagementDbContext context)
        {
            _context = context;
        }

        public async Task<List<string>> Handle(GetActiveLanguagesQuery request, CancellationToken cancellationToken)
        {
            return await _context.LanguageSettings
                .Where(l => l.IsActive)
                .Select(l => l.Code)
                .ToListAsync(cancellationToken);
        }
    }
}
