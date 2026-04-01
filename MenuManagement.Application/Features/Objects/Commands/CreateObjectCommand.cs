using System;
using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Domain;
using MenuManagement.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace MenuManagement.Application.Features.Objects.Commands
{
    public class CreateObjectCommand : IRequest<OperationResult<Guid>>
    {
        public string Name { get; set; } = string.Empty;
        public string? NameEn { get; set; }
        public string? NameRu { get; set; }
        public string? Description { get; set; }
        public string? DescriptionEn { get; set; }
        public string? DescriptionRu { get; set; }
        public string? ImageUrl { get; set; }
        public string? GoogleReviewUrl { get; set; }
        public string? Address { get; set; }
        public string? AddressEn { get; set; }
        public string? AddressRu { get; set; }
        public string? Phone { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class CreateObjectCommandHandler : IRequestHandler<CreateObjectCommand, OperationResult<Guid>>
    {
        private readonly IMenuManagementDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public CreateObjectCommandHandler(IMenuManagementDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<OperationResult<Guid>> Handle(CreateObjectCommand request, CancellationToken cancellationToken)
        {
            var entity = new ObjectEntity
            {
                Name = request.Name,
                NameEn = request.NameEn,
                NameRu = request.NameRu,
                Description = request.Description,
                DescriptionEn = request.DescriptionEn,
                DescriptionRu = request.DescriptionRu,
                ImageUrl = request.ImageUrl,
                GoogleReviewUrl = request.GoogleReviewUrl,
                Address = request.Address,
                AddressEn = request.AddressEn,
                AddressRu = request.AddressRu,
                Phone = request.Phone,
                IsActive = request.IsActive,
                UserId = _currentUserService.UserId
            };

            _context.Objects.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);

            return OperationResult<System.Guid>.Success(entity.Id);
        }
    }
}
