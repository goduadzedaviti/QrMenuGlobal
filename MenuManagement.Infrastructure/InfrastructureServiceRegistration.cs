using MenuManagement.Application.Common.Interfaces;
using MenuManagement.Infrastructure.Security;
using MenuManagement.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;

namespace MenuManagement.Infrastructure
{
    public static class InfrastructureServiceRegistration
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
        {
            services.AddHttpContextAccessor();
            services.AddScoped<IJwtService, JwtService>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            return services;
        }
    }
}
