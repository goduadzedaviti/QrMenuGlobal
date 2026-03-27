using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.Menus.Commands
{
    public class UpdateMenuCommand : IRequest<OperationResult>
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? NameEn { get; set; }
        public string? NameRu { get; set; }
        public string? Description { get; set; }
        public string? DescriptionEn { get; set; }
        public string? DescriptionRu { get; set; }
        public int SortOrder { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; }
    }

    public class UpdateMenuCommandHandler : IRequestHandler<UpdateMenuCommand, OperationResult>
    {
        private readonly IMenuManagementDbContext _context;

        public UpdateMenuCommandHandler(IMenuManagementDbContext context)
        {
            _context = context;
        }

        public async Task<OperationResult> Handle(UpdateMenuCommand request, CancellationToken cancellationToken)
        {
            var entity = await _context.Menus.FindAsync(new object[] { request.Id }, cancellationToken);

            if (entity == null)
            {
                return OperationResult.Failure("Menu not found.");
            }

            entity.Name = request.Name;
            entity.NameEn = request.NameEn;
            entity.NameRu = request.NameRu;
            entity.Description = request.Description;
            entity.DescriptionEn = request.DescriptionEn;
            entity.DescriptionRu = request.DescriptionRu;
            entity.SortOrder = request.SortOrder;
            entity.ImageUrl = request.ImageUrl;
            entity.IsActive = request.IsActive;

            await _context.SaveChangesAsync(cancellationToken);

            return OperationResult.Success();
        }
    }
}
