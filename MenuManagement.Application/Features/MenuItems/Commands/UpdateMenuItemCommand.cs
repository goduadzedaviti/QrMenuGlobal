using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.MenuItems.Commands
{
    public class UpdateMenuItemCommand : IRequest<OperationResult>
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? NameEn { get; set; }
        public string? NameRu { get; set; }
        public string? Description { get; set; }
        public string? DescriptionEn { get; set; }
        public string? DescriptionRu { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public int SortOrder { get; set; }
        public bool IsAvailable { get; set; }
    }

    public class UpdateMenuItemCommandHandler : IRequestHandler<UpdateMenuItemCommand, OperationResult>
    {
        private readonly IMenuManagementDbContext _context;

        public UpdateMenuItemCommandHandler(IMenuManagementDbContext context)
        {
            _context = context;
        }

        public async Task<OperationResult> Handle(UpdateMenuItemCommand request, CancellationToken cancellationToken)
        {
            var entity = await _context.MenuItems.FindAsync(new object[] { request.Id }, cancellationToken);

            if (entity == null)
            {
                return OperationResult.Failure("Menu item not found.");
            }

            entity.Name = request.Name;
            entity.NameEn = request.NameEn;
            entity.NameRu = request.NameRu;
            entity.Description = request.Description;
            entity.DescriptionEn = request.DescriptionEn;
            entity.DescriptionRu = request.DescriptionRu;
            entity.Price = request.Price;
            entity.ImageUrl = request.ImageUrl;
            entity.SortOrder = request.SortOrder;
            entity.IsAvailable = request.IsAvailable;

            await _context.SaveChangesAsync(cancellationToken);

            return OperationResult.Success();
        }
    }
}
