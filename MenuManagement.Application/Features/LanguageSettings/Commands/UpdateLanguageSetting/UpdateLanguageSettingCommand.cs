using MediatR;
using MenuManagement.Application.Common.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.LanguageSettings.Commands.UpdateLanguageSetting
{
    public class UpdateLanguageSettingCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
        public bool IsActive { get; set; }
    }

    public class UpdateLanguageSettingCommandHandler : IRequestHandler<UpdateLanguageSettingCommand, Unit>
    {
        private readonly IMenuManagementDbContext _context;

        public UpdateLanguageSettingCommandHandler(IMenuManagementDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(UpdateLanguageSettingCommand request, CancellationToken cancellationToken)
        {
            var entity = await _context.LanguageSettings.FindAsync(request.Id);
            if (entity == null) return Unit.Value;

            entity.IsActive = request.IsActive;
            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
