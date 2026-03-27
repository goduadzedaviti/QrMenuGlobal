using AutoMapper;
using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using MenuManagement.Application.Features.Menus.DTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.Menus.Queries
{
    public class GetMenuByIdQuery : IRequest<OperationResult<MenuDto>>
    {
        public Guid Id { get; set; }
    }

    public class GetMenuByIdQueryHandler : IRequestHandler<GetMenuByIdQuery, OperationResult<MenuDto>>
    {
        private readonly IMenuManagementDbContext _context;
        private readonly IMapper _mapper;

        public GetMenuByIdQueryHandler(IMenuManagementDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<OperationResult<MenuDto>> Handle(GetMenuByIdQuery request, CancellationToken cancellationToken)
        {
            var item = await _context.Menus
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (item == null)
            {
                return OperationResult<MenuDto>.Failure("Menu not found");
            }

            var dto = _mapper.Map<MenuDto>(item);
            return OperationResult<MenuDto>.Success(dto);
        }
    }
}
