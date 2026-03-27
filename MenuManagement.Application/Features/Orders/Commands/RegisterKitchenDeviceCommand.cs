using AutoMapper;
using MediatR;
using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Application.Features.Orders.DTOs;
using MenuManagement.Domain;
using MenuManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MenuManagement.Application.Features.Orders.Commands
{
    public class RegisterKitchenDeviceCommand : IRequest<OperationResult<KitchenDeviceDto>>
    {
        public Guid ObjectId { get; set; }
        public string DeviceId { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Platform { get; set; } = "Web";
        public string? PushToken { get; set; }
    }

    public class RegisterKitchenDeviceCommandHandler : IRequestHandler<RegisterKitchenDeviceCommand, OperationResult<KitchenDeviceDto>>
    {
        private readonly IMenuManagementDbContext _context;
        private readonly IMapper _mapper;

        public RegisterKitchenDeviceCommandHandler(IMenuManagementDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<OperationResult<KitchenDeviceDto>> Handle(RegisterKitchenDeviceCommand request, CancellationToken cancellationToken)
        {
            var objectExists = await _context.Objects.AnyAsync(x => x.Id == request.ObjectId && x.IsActive, cancellationToken);
            if (!objectExists)
            {
                return OperationResult<KitchenDeviceDto>.Failure("Restaurant was not found.");
            }

            var device = await _context.KitchenDevices
                .FirstOrDefaultAsync(x => x.DeviceId == request.DeviceId, cancellationToken);

            if (device == null)
            {
                device = new KitchenDeviceEntity
                {
                    DeviceId = request.DeviceId
                };
                _context.KitchenDevices.Add(device);
            }

            device.ObjectId = request.ObjectId;
            device.DisplayName = string.IsNullOrWhiteSpace(request.DisplayName) ? "Kitchen Tablet" : request.DisplayName.Trim();
            device.Platform = string.IsNullOrWhiteSpace(request.Platform) ? "Web" : request.Platform.Trim();
            device.PushToken = string.IsNullOrWhiteSpace(request.PushToken) ? null : request.PushToken.Trim();
            device.LastSeenAt = DateTime.UtcNow;
            device.IsActive = true;

            await _context.SaveChangesAsync(cancellationToken);
            return OperationResult<KitchenDeviceDto>.Success(_mapper.Map<KitchenDeviceDto>(device));
        }
    }
}
