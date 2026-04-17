using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.Objects.Commands
{
    public class UpdateObjectCommand : IRequest<OperationResult>
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? NameEn { get; set; }
        public string? NameRu { get; set; }
        public string? Description { get; set; }
        public string? DescriptionEn { get; set; }
        public string? DescriptionRu { get; set; }
        public string? ImageUrl { get; set; }
        public string? GoogleReviewUrl { get; set; }
        public string? TripAdvisorUrl { get; set; }
        public string? Address { get; set; }
        public string? AddressEn { get; set; }
        public string? AddressRu { get; set; }
        public string? Phone { get; set; }
        public bool IsActive { get; set; }
    }

    public class UpdateObjectCommandHandler : IRequestHandler<UpdateObjectCommand, OperationResult>
    {
        private readonly IMenuManagementDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public UpdateObjectCommandHandler(IMenuManagementDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<OperationResult> Handle(UpdateObjectCommand request, CancellationToken cancellationToken)
        {
            var entity = await _context.Objects.FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

            if (entity == null || (!_currentUserService.IsSystemAdmin && entity.UserId != _currentUserService.UserId))
            {
                return OperationResult.Failure("Object not found or access denied.");
            }

            entity.Name = request.Name;
            entity.NameEn = request.NameEn;
            entity.NameRu = request.NameRu;
            entity.Description = request.Description;
            entity.DescriptionEn = request.DescriptionEn;
            entity.DescriptionRu = request.DescriptionRu;
            entity.ImageUrl = request.ImageUrl;
            entity.GoogleReviewUrl = request.GoogleReviewUrl;
            entity.TripAdvisorUrl = request.TripAdvisorUrl;
            entity.Address = request.Address;
            entity.AddressEn = request.AddressEn;
            entity.AddressRu = request.AddressRu;
            entity.Phone = request.Phone;
            entity.IsActive = request.IsActive;

            await _context.SaveChangesAsync(cancellationToken);

            return OperationResult.Success();
        }
    }
}
