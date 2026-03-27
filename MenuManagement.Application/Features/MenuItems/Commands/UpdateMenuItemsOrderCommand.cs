using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.MenuItems.Commands
{
    public class UpdateMenuItemsOrderCommand : IRequest<OperationResult>
    {
        public List<MenuItemOrderDto> Items { get; set; } = new();
    }

    public class MenuItemOrderDto
    {
        public System.Guid Id { get; set; }
        public int SortOrder { get; set; }
    }

    public class UpdateMenuItemsOrderCommandHandler : IRequestHandler<UpdateMenuItemsOrderCommand, OperationResult>
    {
        private readonly IMenuManagementDbContext _context;

        public UpdateMenuItemsOrderCommandHandler(IMenuManagementDbContext context)
        {
            _context = context;
        }

        public async Task<OperationResult> Handle(UpdateMenuItemsOrderCommand request, CancellationToken cancellationToken)
        {
            var ids = request.Items.Select(x => x.Id).ToList();
            var entities = await _context.MenuItems
                .Where(x => ids.Contains(x.Id))
                .ToListAsync(cancellationToken);

            foreach (var itemDto in request.Items)
            {
                var entity = entities.FirstOrDefault(x => x.Id == itemDto.Id);
                if (entity != null)
                {
                    entity.SortOrder = itemDto.SortOrder;
                }
            }

            await _context.SaveChangesAsync(cancellationToken);

            return OperationResult.Success();
        }
    }
}
