using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using MenuManagement.Application.Features.Menus.DTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.Menus.Queries
{
    public class GetMenusByObjectIdQuery : IRequest<OperationResult<List<MenuDto>>>
    {
        public Guid ObjectId { get; set; }
    }

    public class GetMenusByObjectIdQueryHandler : IRequestHandler<GetMenusByObjectIdQuery, OperationResult<List<MenuDto>>>
    {
        private readonly IMenuManagementDbContext _context;
        private readonly IMapper _mapper;

        public GetMenusByObjectIdQueryHandler(IMenuManagementDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<OperationResult<List<MenuDto>>> Handle(GetMenusByObjectIdQuery request, CancellationToken cancellationToken)
        {
            var items = await _context.Menus
                .Where(x => x.ObjectId == request.ObjectId)
                .OrderBy(x => x.SortOrder)
                .ProjectTo<MenuDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return OperationResult<List<MenuDto>>.Success(items);
        }
    }
}
