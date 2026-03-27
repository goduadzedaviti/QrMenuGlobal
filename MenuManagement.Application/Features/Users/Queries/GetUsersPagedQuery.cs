using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Application.Common.Models;
using MenuManagement.Domain;
using MenuManagement.Application.Features.Users.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.Users.Queries
{
    public class GetUsersPagedQuery : IRequest<OperationResult<PaginatedList<UserDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class GetUsersPagedQueryHandler : IRequestHandler<GetUsersPagedQuery, OperationResult<PaginatedList<UserDto>>>
    {
        private readonly IMenuManagementDbContext _context;
        private readonly IMapper _mapper;

        public GetUsersPagedQueryHandler(IMenuManagementDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<OperationResult<PaginatedList<UserDto>>> Handle(GetUsersPagedQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Users.AsNoTracking();

            var count = await query.CountAsync(cancellationToken);
            var data = await query.OrderBy(x => x.Username)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<UserDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            var paginatedList = new PaginatedList<UserDto>(data, count, request.PageNumber, request.PageSize);
            return OperationResult<PaginatedList<UserDto>>.Success(paginatedList);
        }
    }
}
