using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using MenuManagement.Application.Features.MenuItems.DTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.MenuItems.Queries
{
    public class GetMenuItemsByMenuIdQuery : IRequest<OperationResult<List<MenuItemDto>>>
    {
        public Guid MenuId { get; set; }
        public bool IncludeUnavailable { get; set; }
    }

    public class GetMenuItemsByMenuIdQueryHandler : IRequestHandler<GetMenuItemsByMenuIdQuery, OperationResult<List<MenuItemDto>>>
    {
        private readonly IMenuManagementDbContext _context;
        private readonly IMapper _mapper;

        public GetMenuItemsByMenuIdQueryHandler(IMenuManagementDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<OperationResult<List<MenuItemDto>>> Handle(GetMenuItemsByMenuIdQuery request, CancellationToken cancellationToken)
        {
            var items = await _context.MenuItems
                .Where(x => x.MenuId == request.MenuId && (request.IncludeUnavailable || x.IsAvailable))
                .OrderBy(x => x.SortOrder)
                .ProjectTo<MenuItemDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return OperationResult<List<MenuItemDto>>.Success(items);
        }
    }
}
