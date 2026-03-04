namespace ShellBff;

public static class ShellEndpoints
{
    public static void MapShellEndpoints(this WebApplication app, ShellSettings settings)
    {
        var data = new ShellData(settings.MfeUrls);

        app.MapGet("/shell/apps", () => Results.Ok(data.Applications))
           .RequireAuthorization();

        app.MapGet("/shell/apps/{appId}/profiles", (string appId) =>
        {
            var profiles = data.GetProfiles(appId);
            return profiles.Length > 0 ? Results.Ok(profiles) : Results.NotFound(new { Message = $"App '{appId}' not found" });
        }).RequireAuthorization();

        app.MapGet("/shell/apps/{appId}/profiles/{profileId}/menus", (string appId, string profileId) =>
        {
            var menus = data.GetMenus(appId, profileId);
            return menus.Length > 0 ? Results.Ok(menus) : Results.NotFound(new { Message = $"Menus not found for {appId}/{profileId}" });
        }).RequireAuthorization();
    }
}

// Mock data provider
public class ShellData
{
    private readonly MfeUrlSettings _mfeUrls;

    public ShellData(MfeUrlSettings mfeUrls) => _mfeUrls = mfeUrls;

    public object[] Applications => new object[]
    {
        new { Id = "SMS", Name = "Sample Management System", Description = "Main application suite", Icon = "📊" },
        new { Id = "FMS", Name = "Finance Management System", Description = "Financial operations", Icon = "💰" }
    };

    public object[] GetProfiles(string appId) => appId.ToUpper() switch
    {
        "SMS" => new object[]
        {
            new { Id = "MAKER", Name = "Maker", Description = "Create and submit requests" },
            new { Id = "CHECKER", Name = "Checker", Description = "Review and approve requests" },
            new { Id = "ADMIN", Name = "Admin", Description = "System administration" }
        },
        "FMS" => new object[]
        {
            new { Id = "ANALYST", Name = "Analyst", Description = "Financial analysis" },
            new { Id = "MANAGER", Name = "Manager", Description = "Manage team and approvals" }
        },
        _ => Array.Empty<object>()
    };

    public object[] GetMenus(string appId, string profileId)
    {
        var key = $"{appId.ToUpper()}:{profileId.ToUpper()}";
        return key switch
        {
            "SMS:MAKER" => new object[]
            {
                CreateMenu("1", "CBMS", 1, "💳", "CBMS", _mfeUrls.Cbms, "cbmsApp", "/cbms"),
                CreateMenu("2", "Tasks", 2, "📋", "CDTS", _mfeUrls.Cdts, "cdtsApp", "/tasks"),
                CreateMenu("3", "Products", 3, "📦", "Products", _mfeUrls.Products, "productsAngular", "/products")
            },
            "SMS:CHECKER" => new object[]
            {
                CreateMenu("4", "Approvals", 1, "✅", "CBMS Approvals", _mfeUrls.Cbms, "cbmsApp", "/cbms"),
                CreateMenu("5", "Tasks Review", 2, "📝", "CDTS Review", _mfeUrls.Cdts, "cdtsApp", "/tasks")
            },
            "SMS:ADMIN" => new object[]
            {
                CreateMenu("6", "All Modules", 1, "🔧", "Admin Dashboard", _mfeUrls.Cbms, "cbmsApp", "/cbms")
            },
            "FMS:ANALYST" => new object[]
            {
                CreateMenu("7", "Products Catalog", 1, "📈", "Products Analysis", _mfeUrls.Products, "productsAngular", "/products")
            },
            "FMS:MANAGER" => new object[]
            {
                CreateMenu("8", "Team Tasks", 1, "👥", "Team Management", _mfeUrls.Cdts, "cdtsApp", "/tasks")
            },
            _ => Array.Empty<object>()
        };
    }

    private static object CreateMenu(string id, string name, int order, string icon, string mfeName, string remoteEntry, string scope, string route) => new
    {
        Id = id,
        Name = name,
        Order = order,
        Icon = icon,
        MfeConfig = new
        {
            Name = mfeName,
            RemoteEntry = remoteEntry,
            Scope = scope,
            ExposedModule = "./bootstrap",
            Route = route
        }
    };
}
