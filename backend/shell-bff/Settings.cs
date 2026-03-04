namespace ShellBff;

public class ShellSettings
{
    public string[] CorsOrigins { get; set; } = Array.Empty<string>();
    public string DefaultReturnUrl { get; set; } = "http://localhost:3000";
    public CookieSettings Cookie { get; set; } = new();
    public JwtSettings Jwt { get; set; } = new();
    public MfeUrlSettings MfeUrls { get; set; } = new();
}

public class CookieSettings
{
    public string SameSite { get; set; } = "Lax";
    public string SecurePolicy { get; set; } = "SameAsRequest";
}

public class JwtSettings
{
    public string PrivateKey { get; set; } = string.Empty;
    public string PublicKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = "mfe-shell";
    public string Audience { get; set; } = "mfe-apps";
    public int ExpirationHours { get; set; } = 8;
}

public class MfeUrlSettings
{
    public string Cbms { get; set; } = "http://localhost:3001/assets/remoteEntry.js";
    public string Cdts { get; set; } = "http://localhost:3002/assets/remoteEntry.js";
    public string Products { get; set; } = "http://localhost:3003/assets/remoteEntry.js";
}
