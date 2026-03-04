# Shell BFF (Backend for Frontend)

A minimal C# (.NET 8) API that provides authentication and shell configuration for the MFE platform.

## Running

```bash
cd backend/shell-bff
dotnet run
```

The server starts on `http://localhost:5001`.

## Endpoints

### Authentication

| Endpoint       | Method | Description                                         |
| -------------- | ------ | --------------------------------------------------- |
| `/auth/login`  | GET    | Login page (redirects to this if not authenticated) |
| `/auth/login`  | POST   | Process login form, set HttpOnly cookie             |
| `/auth/logout` | POST   | Clear auth cookie                                   |
| `/auth/me`     | GET    | Get current user info (requires auth)               |

### Shell Configuration

| Endpoint                                         | Method | Description                       |
| ------------------------------------------------ | ------ | --------------------------------- |
| `/shell/apps`                                    | GET    | List available applications       |
| `/shell/apps/{appId}/profiles`                   | GET    | List profiles for an application  |
| `/shell/apps/{appId}/profiles/{profileId}/menus` | GET    | Get menu items for a profile      |
| `/shell/mfes/resolve`                            | POST   | Resolve MFE configuration by name |

## Authentication Flow

1. Shell frontend calls `/auth/me` on load
2. If 401, redirect to `/auth/login?returnUrl=...`
3. User fills in mock credentials
4. POST to `/auth/login` sets HttpOnly cookie
5. Redirect back to shell with auth cookie set
6. Shell can now call authenticated endpoints

## Mock Data

The BFF includes mock data for:

- **Applications**: SMS, FMS
- **Profiles**: MAKER, CHECKER, ADMIN (SMS); ANALYST, MANAGER (FMS)
- **Menus**: Various menu items pointing to CBMS, CDTS, Products MFE remotes

## Configuration

CORS is configured for:

- `http://localhost:3000` (shell dev server)
- `http://localhost:5173` (vite default)

Cookie settings:

- HttpOnly: true
- SameSite: Lax
- Expiration: 8 hours
