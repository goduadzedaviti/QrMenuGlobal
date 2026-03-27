using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.Objects.Commands
{
    public class DeleteObjectCommand : IRequest<OperationResult>
    {
        public Guid Id { get; set; }
    }

    public class DeleteObjectCommandHandler : IRequestHandler<DeleteObjectCommand, OperationResult>
    {
        private readonly IMenuManagementDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public DeleteObjectCommandHandler(IMenuManagementDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<OperationResult> Handle(DeleteObjectCommand request, CancellationToken cancellationToken)
        {
            var entity = await _context.Objects.FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

            if (entity == null || (!_currentUserService.IsSystemAdmin && entity.UserId != _currentUserService.UserId))
            {
                return OperationResult.Failure("Object not found or access denied.");
            }

            _context.Objects.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);

            return OperationResult.Success();
        }
    }
}
