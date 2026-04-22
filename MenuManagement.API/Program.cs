using MenuManagement.Application;
using MenuManagement.Infrastructure;
using MenuManagement.Persistence;
using MenuManagement.API.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using MenuManagement.Persistence.Seed;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using MenuManagement.API.Hubs;
using MenuManagement.API.Services;
using MenuManagement.Application.Common.Interfaces;
using Microsoft.AspNetCore.StaticFiles;

var builder = WebApplication.CreateBuilder(args);

// Ensure wwwroot exists for static files
var wwwrootPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
var uploadsPath = Path.Combine(wwwrootPath, "uploads");
if (!Directory.Exists(wwwrootPath)) Directory.CreateDirectory(wwwrootPath);
if (!Directory.Exists(uploadsPath)) Directory.CreateDirectory(uploadsPath);
builder.Environment.WebRootPath = wwwrootPath;

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Configure Kestrel limits
builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = 30000000; // 30MB
});

// Add services to the container.
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices();
builder.Services.AddPersistenceServices(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSignalR();
builder.Services.AddScoped<IKitchenRealtimeNotifier, SignalRKitchenRealtimeNotifier>();

// Configure Swagger with JWT
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Menu Management API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header
            },
            new List<string>()
        }
    });
});

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");

// Ensure validation key matches the generation key
string validationKey = jwtSettings["Key"] ?? "ThisIsAVerySecretKeyForQrMenuSystem123456789!";
if (validationKey.Length < 32)
{
    validationKey = "ThisIsAVerySecretKeyForQrMenuSystem123456789!";
}
var key = Encoding.UTF8.GetBytes(validationKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "MenuManagementAPI",
        ValidAudience = jwtSettings["Audience"] ?? "MenuManagementFrontend",
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
var configuredOrigins = allowedOrigins ?? Array.Empty<string>();

bool IsAllowedOrigin(string? origin)
{
    if (string.IsNullOrWhiteSpace(origin))
    {
        return builder.Environment.IsDevelopment();
    }

    if (configuredOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase))
    {
        return true;
    }

    if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
    {
        return false;
    }

    if (builder.Environment.IsDevelopment())
    {
        return true;
    }

    return uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase)
        || uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase)
        || uri.Host.StartsWith("192.168.", StringComparison.OrdinalIgnoreCase)
        || uri.Host.StartsWith("172.", StringComparison.OrdinalIgnoreCase)
        || uri.Host.StartsWith("10.", StringComparison.OrdinalIgnoreCase)
        || uri.Host.EndsWith(".onrender.com", StringComparison.OrdinalIgnoreCase)
        || uri.Host.EndsWith(".trycloudflare.com", StringComparison.OrdinalIgnoreCase);
}

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(c => {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Menu Management API v1");
    // This allows Swagger to work behind a reverse proxy (like Render)
    c.RoutePrefix = "swagger";
});

app.UseMiddleware<ExceptionMiddleware>();

var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".gltf"] = "model/gltf+json";
provider.Mappings[".glb"] = "model/gltf-binary";

app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    ContentTypeProvider = provider
});

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

if (app.Environment.IsDevelopment())
{
    app.MapGet("/", context => {
        context.Response.Redirect("/swagger");
        return Task.CompletedTask;
    });
}

app.MapControllers();
app.MapHub<KitchenHub>("/hubs/kitchen");
app.MapFallbackToFile("index.html");

// Apply migrations and seed startup data.
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<MenuManagementDbContext>();
    try
    {
        await context.Database.MigrateAsync();
        await DatabaseSeeder.SeedAsync(context, includeSampleData: false);
        await KitchenSchemaBootstrapper.EnsureAsync(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred during migration or seeding.");
    }
}

app.Run();
