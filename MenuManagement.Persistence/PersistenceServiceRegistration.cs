using MenuManagement.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace MenuManagement.Persistence
{
    public static class PersistenceServiceRegistration
    {
        public static IServiceCollection AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
        {
            var rawConnection =
                Environment.GetEnvironmentVariable("DATABASE_URL") ??
                configuration.GetConnectionString("PostgresConnection") ??
                configuration.GetConnectionString("DefaultConnection");

            var connectionString = BuildPostgresConnectionString(rawConnection);

            services.AddDbContext<MenuManagementDbContext>(options =>
            {
                if (string.IsNullOrWhiteSpace(connectionString))
                {
                    throw new InvalidOperationException(
                        "PostgreSQL connection string was not found. Configure ConnectionStrings:PostgresConnection, ConnectionStrings:DefaultConnection, or DATABASE_URL.");
                }

                options.UseNpgsql(
                    connectionString,
                    builder => builder.MigrationsAssembly(typeof(MenuManagementDbContext).Assembly.FullName)
                                      .EnableRetryOnFailure());
            });

            services.AddScoped<IMenuManagementDbContext>(provider => provider.GetRequiredService<MenuManagementDbContext>());

            return services;
        }

        private static string? BuildPostgresConnectionString(string? rawConnection)
        {
            if (string.IsNullOrWhiteSpace(rawConnection))
            {
                return rawConnection;
            }

            var normalizedConnection = ConvertPostgresUriToConnectionString(rawConnection);

            try
            {
                var builder = new NpgsqlConnectionStringBuilder(normalizedConnection);
                var isLocalHost =
                    string.Equals(builder.Host, "localhost", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(builder.Host, "127.0.0.1", StringComparison.OrdinalIgnoreCase);

                if (builder.Port == 0)
                {
                    builder.Port = 5432;
                }

                if (isLocalHost)
                {
                    builder.SslMode = SslMode.Disable;
                }
                else if (builder.SslMode == SslMode.Disable || builder.SslMode == SslMode.Prefer)
                {
                    builder.SslMode = SslMode.Require;
                }

                return builder.ConnectionString;
            }
            catch
            {
                return normalizedConnection;
            }
        }

        private static string? ConvertPostgresUriToConnectionString(string? uri)
        {
            if (string.IsNullOrWhiteSpace(uri) ||
                (!uri.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) &&
                 !uri.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)))
            {
                return uri;
            }

            try
            {
                var databaseUri = new Uri(uri);
                var userInfo = databaseUri.UserInfo.Split(':', 2);

                var builder = new NpgsqlConnectionStringBuilder
                {
                    Host = databaseUri.Host,
                    Port = databaseUri.Port > 0 ? databaseUri.Port : 5432,
                    Database = databaseUri.AbsolutePath.TrimStart('/'),
                    Username = Uri.UnescapeDataString(userInfo[0]),
                    Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty
                };

                return builder.ConnectionString;
            }
            catch
            {
                return uri;
            }
        }
    }
}
