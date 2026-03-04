using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Configure JSON serialization to use PascalCase
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = null; // Use PascalCase
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                  "http://localhost:3000",
                  "http://localhost:3005",
                  "http://localhost:3007",
                  "http://localhost:5173")
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add cookie authentication
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "MFE.Auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
        options.ExpireTimeSpan = TimeSpan.FromHours(8);
        options.LoginPath = "/auth/login";
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

// Login page (GET) - shows a simple login form
app.MapGet("/auth/login", (HttpContext context) =>
{
    var returnUrl = context.Request.Query["returnUrl"].FirstOrDefault() ?? "http://localhost:3000";
    var escapedReturnUrl = Uri.EscapeDataString(returnUrl);

    var html = $$"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>MFE Shell - Login</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f6f8fb; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
            .login-box { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); width: 320px; }
            h1 { margin: 0 0 24px; color: #111827; font-size: 24px; text-align: center; }
            label { display: block; margin-bottom: 6px; color: #374151; font-weight: 500; }
            input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box; margin-bottom: 16px; }
            input:focus { outline: none; border-color: #2563eb; }
            button { width: 100%; padding: 12px; background: #111827; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; }
            button:hover { background: #1f2937; }
            .hint { font-size: 12px; color: #6b7280; text-align: center; margin-top: 16px; }
        </style>
    </head>
    <body>
        <div class="login-box">
            <h1>MFE Shell Login</h1>
            <form method="POST" action="/auth/login?returnUrl={{escapedReturnUrl}}">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" placeholder="Enter any username" required />
                <label for="displayName">Display Name</label>
                <input type="text" id="displayName" name="displayName" placeholder="Your display name" required />
                <button type="submit">Sign In</button>
            </form>
            <p class="hint">Mock auth - enter any credentials</p>
        </div>
    </body>
    </html>
    """;

    return Results.Content(html, "text/html");
}).AllowAnonymous();

// Login handler (POST) - sets the auth cookie
app.MapPost("/auth/login", async (HttpContext context) =>
{
    var form = await context.Request.ReadFormAsync();
    var username = form["username"].FirstOrDefault() ?? "user";
    var displayName = form["displayName"].FirstOrDefault() ?? "User";
    var returnUrl = context.Request.Query["returnUrl"].FirstOrDefault() ?? "http://localhost:3000";

    var claims = new List<Claim>
    {
        new(ClaimTypes.Name, username),
        new(ClaimTypes.Email, $"{username.ToLower().Replace(" ", ".")}@domain.com"),
        new("displayName", displayName),
        new("windowsId", new Random().Next(1000000, 9999999).ToString())
    };

    var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
    var principal = new ClaimsPrincipal(identity);

    await context.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

    return Results.Redirect(returnUrl);
}).AllowAnonymous();

// Logout endpoint
app.MapPost("/auth/logout", async (HttpContext context) =>
{
    await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    return Results.Ok(new { message = "Logged out successfully" });
});

// Get current user info
app.MapGet("/auth/me", (HttpContext context) =>
{
    if (!context.User.Identity?.IsAuthenticated ?? true)
    {
        return Results.Unauthorized();
    }

    return Results.Ok(new
    {
        displayName = context.User.FindFirst("displayName")?.Value ?? "Unknown User",
        windowsId = context.User.FindFirst("windowsId")?.Value ?? "0",
        email = context.User.FindFirst(ClaimTypes.Email)?.Value ?? "unknown@domain.com"
    });
}).RequireAuthorization();

// ============================================================================
// SHELL API ENDPOINTS
// ============================================================================

// Mock data for applications
var applications = new[]
{
    new { Id = "SMS", Name = "Sample Management System", Description = "Main application suite", Icon = "📊" },
    new { Id = "FMS", Name = "Finance Management System", Description = "Financial operations", Icon = "💰" }
};

// Mock data for profiles
var profiles = new Dictionary<string, object[]>
{
    ["SMS"] = new object[]
    {
        new { Id = "MAKER", Name = "Maker", Description = "Create and submit requests" },
        new { Id = "CHECKER", Name = "Checker", Description = "Review and approve requests" },
        new { Id = "ADMIN", Name = "Admin", Description = "System administration" }
    },
    ["FMS"] = new object[]
    {
        new { Id = "ANALYST", Name = "Analyst", Description = "Financial analysis" },
        new { Id = "MANAGER", Name = "Manager", Description = "Manage team and approvals" }
    }
};

// Mock data for menus
var menus = new Dictionary<string, object[]>
{
    ["SMS:MAKER"] = new object[]
    {
        new {
            Id = "1",
            Name = "CBMS",
            Order = 1,
            Icon = "💳",
            MfeConfig = new {
                Name = "CBMS",
                RemoteEntry = "http://localhost:3001/assets/remoteEntry.js",
                Scope = "cbmsApp",
                ExposedModule = "./bootstrap",
                Route = "/cbms"
            }
        },
        new {
            Id = "2",
            Name = "Tasks",
            Order = 2,
            Icon = "📋",
            MfeConfig = new {
                Name = "CDTS",
                RemoteEntry = "http://localhost:3002/assets/remoteEntry.js",
                Scope = "cdtsApp",
                ExposedModule = "./bootstrap",
                Route = "/tasks"
            }
        },
        new {
            Id = "3",
            Name = "Products",
            Order = 3,
            Icon = "📦",
            MfeConfig = new {
                Name = "Products",
                RemoteEntry = "http://localhost:3003/assets/remoteEntry.js",
                Scope = "productsAngular",
                ExposedModule = "./bootstrap",
                Route = "/products"
            }
        }
    },
    ["SMS:CHECKER"] = new object[]
    {
        new {
            Id = "4",
            Name = "Approvals",
            Order = 1,
            Icon = "✅",
            MfeConfig = new {
                Name = "CBMS Approvals",
                RemoteEntry = "http://localhost:3001/assets/remoteEntry.js",
                Scope = "cbmsApp",
                ExposedModule = "./bootstrap",
                Route = "/cbms"
            }
        },
        new {
            Id = "5",
            Name = "Tasks Review",
            Order = 2,
            Icon = "📝",
            MfeConfig = new {
                Name = "CDTS Review",
                RemoteEntry = "http://localhost:3002/assets/remoteEntry.js",
                Scope = "cdtsApp",
                ExposedModule = "./bootstrap",
                Route = "/tasks"
            }
        }
    },
    ["SMS:ADMIN"] = new object[]
    {
        new {
            Id = "6",
            Name = "All Modules",
            Order = 1,
            Icon = "🔧",
            MfeConfig = new {
                Name = "Admin Dashboard",
                RemoteEntry = "http://localhost:3001/assets/remoteEntry.js",
                Scope = "cbmsApp",
                ExposedModule = "./bootstrap",
                Route = "/cbms"
            }
        }
    },
    ["FMS:ANALYST"] = new object[]
    {
        new {
            Id = "7",
            Name = "Products Catalog",
            Order = 1,
            Icon = "📈",
            MfeConfig = new {
                Name = "Products Analysis",
                RemoteEntry = "http://localhost:3003/assets/remoteEntry.js",
                Scope = "productsAngular",
                ExposedModule = "./bootstrap",
                Route = "/products"
            }
        }
    },
    ["FMS:MANAGER"] = new object[]
    {
        new {
            Id = "8",
            Name = "Team Tasks",
            Order = 1,
            Icon = "👥",
            MfeConfig = new {
                Name = "Team Management",
                RemoteEntry = "http://localhost:3002/assets/remoteEntry.js",
                Scope = "cdtsApp",
                ExposedModule = "./bootstrap",
                Route = "/tasks"
            }
        }
    }
};

// GET /shell/apps - Get all applications
app.MapGet("/shell/apps", () => Results.Ok(applications)).RequireAuthorization();

// GET /shell/apps/{appId}/profiles - Get profiles for an app
app.MapGet("/shell/apps/{appId}/profiles", (string appId) =>
{
    if (!profiles.ContainsKey(appId))
    {
        return Results.NotFound(new { message = $"Application '{appId}' not found" });
    }
    return Results.Ok(profiles[appId]);
}).RequireAuthorization();

// GET /shell/apps/{appId}/profiles/{profileId}/menus - Get menus for app/profile
app.MapGet("/shell/apps/{appId}/profiles/{profileId}/menus", (string appId, string profileId) =>
{
    var key = $"{appId}:{profileId}";
    if (!menus.ContainsKey(key))
    {
        return Results.NotFound(new { message = $"Menus not found for {appId}/{profileId}" });
    }
    return Results.Ok(menus[key]);
}).RequireAuthorization();

// POST /shell/mfes/resolve - Resolve MFE manifest
app.MapPost("/shell/mfes/resolve", (MfeResolveRequest request) =>
{
    // In a real scenario, this would validate and return environment-specific URLs
    return Results.Ok(new
    {
        RemoteEntry = request.RemoteEntry,
        Scope = request.Scope,
        ExposedModule = request.ExposedModule,
        ResolvedAt = DateTime.UtcNow
    });
}).RequireAuthorization();

app.Run();

// Request model for MFE resolution
record MfeResolveRequest(string RemoteEntry, string Scope, string ExposedModule);
