using AutoMapper;
using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using MenuManagement.Application.Features.Objects.DTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.Objects.Queries
{
    public class GetObjectByIdQuery : IRequest<OperationResult<ObjectDto>>
    {
        public Guid Id { get; set; }
    }

    public class GetObjectByIdQueryHandler : IRequestHandler<GetObjectByIdQuery, OperationResult<ObjectDto>>
    {
        private readonly IMenuManagementDbContext _context;
        private readonly IMapper _mapper;

        public GetObjectByIdQueryHandler(IMenuManagementDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<OperationResult<ObjectDto>> Handle(GetObjectByIdQuery request, CancellationToken cancellationToken)
        {
            var entity = await _context.Objects.FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

            if (entity == null)
            {
                return OperationResult<ObjectDto>.Failure("Object not found.");
            }

            // Public access is allowed for object details (menu view)
            return OperationResult<ObjectDto>.Success(_mapper.Map<ObjectDto>(entity));
        }
    }
}
