using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.Menus.Commands
{
    public class UpdateMenusOrderCommand : IRequest<OperationResult>
    {
        public List<MenuOrderDto> Items { get; set; } = new();
    }

    public class MenuOrderDto
    {
        public System.Guid Id { get; set; }
        public int SortOrder { get; set; }
    }

    public class UpdateMenusOrderCommandHandler : IRequestHandler<UpdateMenusOrderCommand, OperationResult>
    {
        private readonly IMenuManagementDbContext _context;

        public UpdateMenusOrderCommandHandler(IMenuManagementDbContext context)
        {
            _context = context;
        }

        public async Task<OperationResult> Handle(UpdateMenusOrderCommand request, CancellationToken cancellationToken)
        {
            var ids = request.Items.Select(x => x.Id).ToList();
            var entities = await _context.Menus
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
