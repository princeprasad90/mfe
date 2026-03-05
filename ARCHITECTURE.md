# 🏗️ MFE Platform Architecture

> Enterprise Micro-Frontend Platform with Module Federation, Cookie-based JWT Authentication, and Cross-MFE Communication

---

## 📊 High-Level Architecture

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#3b82f6', 'primaryTextColor': '#fff', 'primaryBorderColor': '#1d4ed8', 'lineColor': '#64748b', 'secondaryColor': '#10b981', 'tertiaryColor': '#f1f5f9'}}}%%
flowchart TB
    subgraph Users["👥 Users"]
        Browser["🌐 Browser"]
    end

    subgraph CDN["☁️ Static Hosting (IIS/CDN)"]
        direction LR
        ShellStatic["📦 Shell Assets<br/>shell.heydaygift.com"]
        CbmsStatic["📦 CBMS Assets<br/>cbms.heydaygift.com"]
        CdtsStatic["📦 CDTS Assets<br/>cdts.heydaygift.com"]
        ProductsStatic["📦 Products Assets<br/>mfe.heydaygift.com"]
    end

    subgraph Shell["🏠 Shell Application"]
        direction TB
        ShellUI["⚛️ React Shell<br/>Layout • Router • Auth"]

        subgraph Features["✨ Shell Features"]
            direction LR
            Notifications["🔔 Notifications"]
            Loader["⏳ Global Loader"]
            Sidebar["📋 Dynamic Menu"]
        end
    end

    subgraph MFEs["🧩 Micro-Frontends"]
        direction LR
        CBMS["💳 CBMS<br/>Payments<br/>(React)"]
        CDTS["✅ CDTS<br/>Tasks<br/>(React)"]
        Products["📦 Products<br/>Catalog<br/>(Angular)"]
    end

    subgraph Backend["⚙️ Backend Services"]
        direction TB
        ShellBFF["🔌 Shell BFF<br/>api.heydaygift.com<br/>(.NET 8)"]

        subgraph BFFFeatures["BFF Capabilities"]
            Auth["🔐 Auth<br/>JWT RS256"]
            Config["📋 Config<br/>Apps • Profiles"]
            JWKS["🔑 JWKS<br/>Public Key"]
        end
    end

    subgraph IdP["🏢 Identity"]
        SAML["🔒 SAML IdP<br/>(Enterprise SSO)"]
    end

    Browser --> ShellStatic
    Browser --> CbmsStatic
    Browser --> CdtsStatic
    Browser --> ProductsStatic

    ShellStatic --> ShellUI
    ShellUI --> Features
    ShellUI -->|"Module Federation"| MFEs

    CBMS -.->|"Events"| Notifications
    CDTS -.->|"Events"| Notifications
    Products -.->|"Events"| Loader

    ShellUI -->|"API Calls"| ShellBFF
    ShellBFF --> BFFFeatures
    ShellBFF <-->|"SSO"| SAML

    classDef blue fill:#3b82f6,stroke:#1d4ed8,color:#fff
    classDef green fill:#10b981,stroke:#059669,color:#fff
    classDef purple fill:#8b5cf6,stroke:#6d28d9,color:#fff
    classDef orange fill:#f59e0b,stroke:#d97706,color:#fff
    classDef pink fill:#ec4899,stroke:#be185d,color:#fff

    class ShellUI,ShellStatic blue
    class CBMS,CDTS,Products,CbmsStatic,CdtsStatic,ProductsStatic green
    class ShellBFF,Auth,Config,JWKS purple
    class SAML orange
    class Notifications,Loader,Sidebar pink
```

---

## 🔐 Authentication Flow

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#8b5cf6', 'primaryTextColor': '#fff', 'lineColor': '#64748b'}}}%%
sequenceDiagram
    autonumber
    participant U as 👤 User
    participant B as 🌐 Browser
    participant S as 🏠 Shell
    participant BFF as 🔌 Shell BFF
    participant IdP as 🏢 SAML IdP
    participant MFE as 🧩 MFE

    rect rgb(239, 246, 255)
        Note over U,MFE: 🔐 Authentication Flow
        U->>B: Access shell.heydaygift.com
        B->>S: Load Shell App
        S->>BFF: GET /auth/me (check session)
        BFF-->>S: 401 Unauthorized
        S->>BFF: Redirect to /auth/login
        BFF->>IdP: SAML AuthnRequest
        IdP->>U: 🔑 Login Prompt
        U->>IdP: Enter Credentials
        IdP->>BFF: SAML Response (Assertion)
        BFF->>BFF: 🔏 Generate JWT (RS256)
        BFF-->>B: Set HttpOnly Cookie (auth_token)
        B->>S: Redirect to returnUrl
    end

    rect rgb(240, 253, 244)
        Note over U,MFE: ✅ Authenticated Session
        S->>BFF: GET /auth/me (with cookie)
        BFF->>BFF: ✓ Validate JWT
        BFF-->>S: { UserId, Email, DisplayName }
        S->>BFF: GET /shell/apps
        BFF-->>S: Available MFE Apps
        S->>MFE: 📦 Load remoteEntry.js
        MFE-->>S: React/Angular Component
        S->>B: 🎨 Render Complete UI
    end

    rect rgb(254, 243, 199)
        Note over U,MFE: 🔄 MFE API Calls
        MFE->>BFF: API Request + Cookie
        BFF->>BFF: Validate JWT from Cookie
        BFF-->>MFE: Protected Data
    end
```

---

## 🧱 Shell Component Architecture

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#3b82f6', 'primaryTextColor': '#fff', 'lineColor': '#64748b'}}}%%
flowchart LR
    subgraph Browser["🌐 Browser Runtime"]
        direction TB

        subgraph ShellApp["🏠 Shell Application"]
            direction TB
            App["App.tsx"]
            AuthContext["🔐 AuthContext"]
            Router["🧭 Router"]

            subgraph Layout["📐 Layout"]
                Sidebar["📋 Sidebar"]
                Header["👤 Header"]
                Content["📄 ContentArea"]
            end

            subgraph Stores["🗃️ Zustand Stores"]
                NotifStore["🔔 notificationStore"]
                LoadStore["⏳ loadingStore"]
            end

            subgraph Components["🧱 Components"]
                NotifUI["NotificationContainer"]
                LoaderUI["GlobalLoader"]
                MfeContainer["MfeContainer"]
            end
        end

        subgraph MFEs["🧩 Loaded MFEs"]
            CBMS["💳 CBMS"]
            CDTS["✅ CDTS"]
            Products["📦 Products"]
        end
    end

    App --> AuthContext
    AuthContext --> Router
    Router --> Layout
    Content --> MfeContainer
    MfeContainer --> MFEs

    Stores --> Components

    CBMS -.->|"CustomEvent"| NotifStore
    CDTS -.->|"CustomEvent"| NotifStore
    Products -.->|"CustomEvent"| LoadStore

    NotifStore --> NotifUI
    LoadStore --> LoaderUI

    classDef shell fill:#3b82f6,stroke:#1d4ed8,color:#fff
    classDef store fill:#8b5cf6,stroke:#6d28d9,color:#fff
    classDef mfe fill:#10b981,stroke:#059669,color:#fff
    classDef component fill:#ec4899,stroke:#be185d,color:#fff

    class App,AuthContext,Router,Layout,Sidebar,Header,Content shell
    class NotifStore,LoadStore store
    class CBMS,CDTS,Products,MfeContainer mfe
    class NotifUI,LoaderUI component
```

---

## 🔑 JWT Token Flow

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#f59e0b', 'lineColor': '#64748b'}}}%%
flowchart LR
    subgraph ShellBFF["🔌 Shell BFF"]
        PrivateKey["🔐 Private Key"]
        PublicKey["🔓 Public Key"]
        JWTGen["🔏 JWT Generator"]
        JWKS["📋 /auth/.well-known/jwks"]
    end

    subgraph Browser["🌐 Browser"]
        Cookie["🍪 HttpOnly Cookie<br/>auth_token"]
    end

    subgraph MfeBFFs["🧩 MFE BFFs"]
        CbmsBFF["CBMS BFF"]
        CdtsBFF["CDTS BFF"]
        Validator["✓ JWT Validator"]
    end

    PrivateKey -->|"Sign"| JWTGen
    JWTGen -->|"Set Cookie"| Cookie
    PublicKey --> JWKS
    JWKS -->|"Fetch Public Key"| CbmsBFF
    JWKS -->|"Fetch Public Key"| CdtsBFF
    Cookie -->|"Send with Request"| CbmsBFF
    Cookie -->|"Send with Request"| CdtsBFF
    CbmsBFF --> Validator
    CdtsBFF --> Validator

    classDef key fill:#f59e0b,stroke:#d97706,color:#fff
    classDef bff fill:#8b5cf6,stroke:#6d28d9,color:#fff
    classDef cookie fill:#10b981,stroke:#059669,color:#fff

    class PrivateKey,PublicKey,JWTGen,JWKS key
    class CbmsBFF,CdtsBFF,Validator bff
    class Cookie cookie
```

---

## 📡 Cross-MFE Communication

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ec4899', 'lineColor': '#64748b'}}}%%
flowchart TB
    subgraph MFE["🧩 Any MFE"]
        Action["User Action<br/>(Button Click)"]
        SDK["notification-sdk"]
    end

    subgraph Events["📡 Window Events"]
        NotifEvent["mfe:notification"]
        LoadStart["mfe:loading:start"]
        LoadStop["mfe:loading:stop"]
    end

    subgraph Shell["🏠 Shell"]
        NotifStore["🔔 notificationStore<br/>(Zustand)"]
        LoadStore["⏳ loadingStore<br/>(Zustand)"]
        NotifUI["Toast UI"]
        LoaderUI["Spinner UI"]
    end

    Action --> SDK
    SDK -->|"dispatchEvent"| NotifEvent
    SDK -->|"dispatchEvent"| LoadStart
    SDK -->|"dispatchEvent"| LoadStop

    NotifEvent -->|"addEventListener"| NotifStore
    LoadStart -->|"addEventListener"| LoadStore
    LoadStop -->|"addEventListener"| LoadStore

    NotifStore --> NotifUI
    LoadStore --> LoaderUI

    classDef mfe fill:#10b981,stroke:#059669,color:#fff
    classDef event fill:#f59e0b,stroke:#d97706,color:#fff
    classDef shell fill:#3b82f6,stroke:#1d4ed8,color:#fff
    classDef ui fill:#ec4899,stroke:#be185d,color:#fff

    class Action,SDK mfe
    class NotifEvent,LoadStart,LoadStop event
    class NotifStore,LoadStore shell
    class NotifUI,LoaderUI ui
```

---

## 🗂️ Project Structure

```
mfe/
├── 📁 apps/
│   ├── 🏠 shell/              # Host application
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── AuthContext.tsx
│   │   │   ├── api.ts
│   │   │   ├── stores/        # Zustand stores
│   │   │   └── components/    # Shell components
│   │   └── vite.config.ts
│   │
│   ├── 💳 cbms/               # Payments MFE (React)
│   │   ├── src/
│   │   │   ├── CbmsApp.tsx
│   │   │   └── cbms.css
│   │   └── vite.config.js
│   │
│   ├── ✅ cdts/               # Tasks MFE (React)
│   │   ├── src/
│   │   │   ├── CdtsApp.tsx
│   │   │   └── cdts.css
│   │   └── vite.config.js
│   │
│   └── 📦 mfe-products-angular/  # Products MFE (Angular)
│       ├── src/
│       └── vite.config.mts
│
├── 📁 backend/
│   └── 🔌 shell-bff/          # .NET 8 API
│       ├── Program.cs
│       ├── AuthEndpoints.cs
│       ├── ShellEndpoints.cs
│       ├── JwtService.cs
│       └── appsettings.*.json
│
└── 📁 packages/
    ├── 🔧 build-tools/        # PostCSS MFE scoping
    └── 📢 notification-sdk/   # Cross-MFE events
```

---

## 🌐 Deployment URLs

| Component    | URL                            | Technology   |
| ------------ | ------------------------------ | ------------ |
| 🏠 Shell     | `https://shell.heydaygift.com` | React + Vite |
| 🔌 Shell BFF | `https://api.heydaygift.com`   | .NET 8       |
| 💳 CBMS      | `https://cbms.heydaygift.com`  | React + Vite |
| ✅ CDTS      | `https://cdts.heydaygift.com`  | React + Vite |
| 📦 Products  | `https://mfe.heydaygift.com`   | Angular      |

---

## 🔧 Key Technologies

| Layer                 | Technology                         | Purpose                              |
| --------------------- | ---------------------------------- | ------------------------------------ |
| **Module Federation** | `@originjs/vite-plugin-federation` | Dynamic MFE loading                  |
| **State Management**  | Zustand                            | Shell stores (notifications, loader) |
| **Authentication**    | JWT RS256 + HttpOnly Cookie        | Secure token handling                |
| **CSS Isolation**     | PostCSS `data-mfe` scoping         | Style encapsulation                  |
| **API Gateway**       | .NET 8 Minimal API                 | BFF pattern                          |
| **Identity**          | SAML 2.0                           | Enterprise SSO (future)              |

---

## 📋 API Endpoints

### Auth (`/auth/*`)

| Method | Endpoint                 | Description                   |
| ------ | ------------------------ | ----------------------------- |
| GET    | `/auth/login`            | Login page                    |
| POST   | `/auth/login`            | Process login, set JWT cookie |
| POST   | `/auth/logout`           | Clear auth cookie             |
| GET    | `/auth/me`               | Get current user              |
| GET    | `/auth/.well-known/jwks` | Public key for MFE BFFs       |

### Shell (`/shell/*`)

| Method | Endpoint          | Description                |
| ------ | ----------------- | -------------------------- |
| GET    | `/shell/apps`     | Available MFE applications |
| GET    | `/shell/profiles` | User profiles              |
| GET    | `/shell/menu`     | Dynamic sidebar menu       |

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start all apps (dev mode)
npm run dev

# Build for production
npm run build

# Start Shell BFF
cd backend/shell-bff && dotnet run
```

---

## 🔒 Security Highlights

- ✅ **HttpOnly Cookies** - JWT not accessible via JavaScript
- ✅ **RS256 Asymmetric Keys** - Private key stays in Shell BFF only
- ✅ **SameSite=None + Secure** - Cross-origin cookie support
- ✅ **CORS Configured** - Shell origin whitelisted on MFEs
- ✅ **CSS Isolation** - No style bleeding between MFEs
