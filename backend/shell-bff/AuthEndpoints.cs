using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ShellBff;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app, ShellSettings settings)
    {
        // Login page (GET)
        app.MapGet("/auth/login", (HttpContext context) =>
        {
            var returnUrl = context.Request.Query["returnUrl"].FirstOrDefault() ?? settings.DefaultReturnUrl;

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
                    <form method="POST" action="/auth/login">
                        <input type="hidden" name="returnUrl" value="{{returnUrl}}" />
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" placeholder="Enter any username" required />
                        <label for="displayName">Display Name</label>
                        <input type="text" id="displayName" name="displayName" placeholder="Your display name" required />
                        <button type="submit">Sign In</button>
                    </form>
                    <p class="hint">Mock auth - enter any credentials (will be replaced with SAML)</p>
                </div>
            </body>
            </html>
            """;

            return Results.Content(html, "text/html");
        });

        // Login handler (POST) - Creates JWT and sets HttpOnly cookie
        app.MapPost("/auth/login", async (HttpContext context, IJwtService jwtService) =>
        {
            var form = await context.Request.ReadFormAsync();
            var username = form["username"].FirstOrDefault() ?? "user";
            var displayName = form["displayName"].FirstOrDefault() ?? "User";
            // returnUrl comes from hidden form field (POST body) to avoid IIS blocking :// in query strings
            var returnUrl = form["returnUrl"].FirstOrDefault()
                         ?? context.Request.Query["returnUrl"].FirstOrDefault()
                         ?? settings.DefaultReturnUrl;

            // Generate unique user ID (mock - in real SAML this comes from IdP)
            var userId = $"user-{username.ToLower().Replace(" ", "-")}-{Guid.NewGuid().ToString("N")[..8]}";
            var email = $"{username.ToLower().Replace(" ", ".")}@domain.com";

            // Generate JWT token (signed with private key)
            var token = jwtService.GenerateToken(userId, email, displayName);

            // Set JWT in HttpOnly cookie
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = settings.Cookie.SecurePolicy == "Always",
                SameSite = settings.Cookie.SameSite switch
                {
                    "None" => SameSiteMode.None,
                    "Strict" => SameSiteMode.Strict,
                    _ => SameSiteMode.Lax
                },
                Expires = DateTimeOffset.UtcNow.AddHours(settings.Jwt.ExpirationHours),
                Path = "/"
            };

            context.Response.Cookies.Append("auth_token", token, cookieOptions);

            return Results.Redirect(returnUrl);
        });

        // Logout - Clears the auth cookie
        app.MapPost("/auth/logout", (HttpContext context) =>
        {
            context.Response.Cookies.Delete("auth_token", new CookieOptions
            {
                Path = "/",
                HttpOnly = true
            });

            return Results.Ok(new { Message = "Logged out successfully" });
        });

        // Get current user session - validates JWT and returns user info
        app.MapGet("/auth/me", (HttpContext context) =>
        {
            if (context.User.Identity?.IsAuthenticated != true)
                return Results.Unauthorized();

            var userId = context.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                      ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = context.User.FindFirst(JwtRegisteredClaimNames.Email)?.Value
                     ?? context.User.FindFirst(ClaimTypes.Email)?.Value;
            var displayName = context.User.FindFirst("displayName")?.Value;

            return Results.Ok(new
            {
                UserId = userId,
                Email = email,
                DisplayName = displayName
            });
        });

        // Expose public key for MFE BFFs to validate tokens
        app.MapGet("/auth/.well-known/jwks", (ShellSettings shellSettings) =>
        {
            // Return public key in JWKS format (simplified - just PEM for now)
            return Results.Ok(new
            {
                PublicKey = shellSettings.Jwt.PublicKey,
                Issuer = shellSettings.Jwt.Issuer,
                Audience = shellSettings.Jwt.Audience
            });
        });
    }
}
