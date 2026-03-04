using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;
using ShellBff;

var builder = WebApplication.CreateBuilder(args);

// Load settings from configuration
var settings = builder.Configuration.GetSection("Shell").Get<ShellSettings>() ?? new ShellSettings();

// Register JwtService
builder.Services.AddSingleton<IJwtService>(new JwtService(settings.Jwt));
builder.Services.AddSingleton(settings);

// Configure JSON to use PascalCase
builder.Services.ConfigureHttpJsonOptions(opt => opt.SerializerOptions.PropertyNamingPolicy = null);

// CORS
builder.Services.AddCors(opt => opt.AddDefaultPolicy(policy =>
    policy.WithOrigins(settings.CorsOrigins)
          .AllowCredentials()
          .AllowAnyHeader()
          .AllowAnyMethod()));

builder.Services.AddAuthorization();

var app = builder.Build();

// Middleware
if (!app.Environment.IsDevelopment())
{
    app.UseForwardedHeaders(new()
    {
        ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor
                         | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto
    });
}

app.UseCors();

// Custom JWT Cookie Authentication Middleware
app.Use(async (context, next) =>
{
    var jwtService = context.RequestServices.GetRequiredService<IJwtService>();
    var token = context.Request.Cookies["auth_token"];

    if (!string.IsNullOrEmpty(token))
    {
        var principal = jwtService.ValidateToken(token);
        if (principal != null)
        {
            context.User = principal;
        }
    }

    await next();
});

app.UseAuthorization();

// Map endpoints
app.MapAuthEndpoints(settings);
app.MapShellEndpoints(settings);

app.Run();
