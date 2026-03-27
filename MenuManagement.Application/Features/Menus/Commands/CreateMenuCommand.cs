using System;
using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using MenuManagement.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.Menus.Commands
{
    public class CreateMenuCommand : IRequest<OperationResult<Guid>>
    {
        public Guid ObjectId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? NameEn { get; set; }
        public string? NameRu { get; set; }
        public string? Description { get; set; }
        public string? DescriptionEn { get; set; }
        public string? DescriptionRu { get; set; }
        public int SortOrder { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class CreateMenuCommandHandler : IRequestHandler<CreateMenuCommand, OperationResult<Guid>>
    {
        private readonly IMenuManagementDbContext _context;

        public CreateMenuCommandHandler(IMenuManagementDbContext context)
        {
            _context = context;
        }

        public async Task<OperationResult<Guid>> Handle(CreateMenuCommand request, CancellationToken cancellationToken)
        {
            var parentObject = await _context.Objects.FindAsync(new object[] { request.ObjectId }, cancellationToken);
            if (parentObject == null)
            {
                return OperationResult<Guid>.Failure("Object not found.");
            }

            var entity = new MenuEntity
            {
                ObjectId = request.ObjectId,
                Name = request.Name,
                NameEn = request.NameEn,
                NameRu = request.NameRu,
                Description = request.Description,
                DescriptionEn = request.DescriptionEn,
                DescriptionRu = request.DescriptionRu,
                SortOrder = request.SortOrder,
                ImageUrl = request.ImageUrl,
                IsActive = request.IsActive
            };

            _context.Menus.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);

            return OperationResult<Guid>.Success(entity.Id);
        }
    }
}
