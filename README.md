# 🔧 API Loom

**API Loom** is a modern, Angular-based OpenAPI/Swagger specification editor and viewer. Create, edit, and manage API specifications (Swagger 2.0 and OpenAPI 3.x) with a visual interface.

[![Angular](https://img.shields.io/badge/Angular-19-red?logo=angular)](https://angular.io/)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-19-blue)](https://primeng.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## ✨ Features

- 📝 **Visual Swagger/OpenAPI Editor** - Edit API specifications with an intuitive UI
- 🔄 **Dual Version Support** - Works with Swagger 2.0 and OpenAPI 3.x
- 💾 **LocalStorage Backend** - Specs stored locally in your browser
- 🌐 **Multi-language** - English, German, Hungarian translations
- 🎨 **Modern UI** - Built with PrimeNG and Tailwind CSS
- 📦 **Backend-Optional** - Can run entirely standalone without a server
- 🔐 **Keycloak Ready** - Optional authentication with Keycloak
- 🚀 **GitHub Pages Ready** - Deploy anywhere as static files

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or later
- **npm** 11.x or later

### Installation

```bash
# Clone the repository
git clone https://github.com/<username>/api-loom.git
cd api-loom

# Install dependencies
npm install

# Start development server
npm start
```

Navigate to `http://localhost:4200/` - the app will reload automatically on file changes.

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server with proxy |
| `npm run build` | Production build (with Keycloak + backend) |
| `npm run build:standalone` | **Standalone build** (no backend, no auth) |
| `npm test` | Run unit tests with Karma |
| `npm run lint` | Lint the codebase |

---

## 🏗️ Build Modes

API Loom supports **two deployment modes**:

### 1️⃣ **Full Mode** (with Backend & Keycloak)

```bash
npm run build
```

- Requires backend API at `/api`
- Keycloak authentication enabled
- Remote spec synchronization
- Suitable for enterprise deployments

### 2️⃣ **Standalone Mode** (No Backend Required) ⭐

```bash
npm run build:standalone
```

- **No backend required** - runs entirely in the browser
- **No authentication** - immediate access
- **localStorage only** - specs saved locally
- **Perfect for:**
  - GitHub Pages deployment
  - Static hosting (Netlify, Vercel)
  - Local development/testing
  - Demos and prototypes

---

## 🚀 Deployment

### Quick Deploy to GitHub Pages

```bash
# Build standalone version
npm run build:standalone

# Push to GitHub
git add .
git commit -m "Deploy standalone version"
git push origin main

# Enable GitHub Pages in repo Settings
# Settings > Pages > Source: GitHub Actions
```

**GitHub Actions workflow included** - automatic deployment on every push!

For detailed deployment instructions (Netlify, Vercel, self-hosted), see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

---

## 🏛️ Architecture

### Core Components

- **IndexComponent** - Landing page and dashboard
- **PathsComponent** - API paths/endpoints editor
- **SchemasComponent** - Schema/model visual editor
- **ResponsesComponent** - Response management
- **ReferenceComponent** - Schema reference viewer

### State Management

- **ApiDataService** - Central service managing Swagger specs
  - Stores specs in `localStorage`
  - Manages multiple specs with selection state
  - Syncs with backend (in full mode)

### Authentication

- **Keycloak Integration** - SSO authentication (full mode only)
- **AuthService** - Authentication wrapper
- **Standalone Mode** - Mock authentication providers

### Routing

```
/ → Index (Dashboard)
/path/:path/:method → Path Editor
/schemas → Schemas List
/schemas/:schema → Schema Editor
/responses/:response → Response Editor
/reference/:reference → Reference Viewer
```

---

## 🛠️ Technology Stack

### Core
- **Angular 19** - Frontend framework
- **TypeScript 5.8** - Type-safe development
- **RxJS** - Reactive programming

### UI Components
- **PrimeNG 19** - Component library
- **Angular Material 19** - Additional components
- **Tailwind CSS 4** - Utility-first styling
- **ag-grid** - Data grids

### Authentication
- **Keycloak Angular** - SSO integration (optional)
- **@ingenimind/apiloom-api-client** - Backend API client

### Internationalization
- **@ngx-translate** - Multi-language support
- Languages: English, German, Hungarian

### Other
- **js-yaml** - YAML parsing
- **highlight.js** - Syntax highlighting
- **Quill** - Rich text editor

---

## 📁 Project Structure

```
api-loom/
├── src/
│   ├── app/
│   │   ├── common/              # Shared components
│   │   │   ├── paths/           # Path editor
│   │   │   ├── schemas/         # Schema editor
│   │   │   ├── components/      # Reusable components
│   │   │   └── index/           # Dashboard
│   │   ├── services/
│   │   │   ├── api-data.service.ts          # Spec management
│   │   │   ├── api-data.service.standalone.ts  # Standalone version
│   │   │   ├── auth.service.ts              # Authentication
│   │   │   └── auth.service.standalone.ts   # Mock auth
│   │   ├── app.config.ts                    # Full mode config
│   │   ├── app.config.standalone.ts         # Standalone config
│   │   └── app.routes.ts                    # Routing
│   ├── assets/
│   │   └── i18n/                # Translation files
│   ├── themes/                  # PrimeNG themes
│   ├── main.ts                  # Full mode bootstrap
│   └── main.standalone.ts       # Standalone bootstrap
├── .github/
│   └── workflows/
│       └── deploy-pages.yml     # GitHub Actions deployment
├── DEPLOYMENT.md                # Detailed deployment guide
├── CLAUDE.md                    # Project guidance for Claude Code
└── README.md                    # This file
```

---

## 🔧 Configuration

### Development Proxy

The dev server proxies `/api` requests to `http://localhost:8085` (configured in `proxy.conf.json`). This avoids CORS issues during development.

### Keycloak Configuration

Edit `src/app/app.config.ts`:

```typescript
provideKeycloak({
  config: {
    url: 'http://localhost:38082',  // Your Keycloak URL
    realm: 'apiloom',                // Your realm
    clientId: 'apiloom-fe',          // Your client ID
  },
  // ...
})
```

### Backend API

The app expects the backend at `/api` (proxied in dev). Configure your backend URL in production deployment.

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm test -- --code-coverage

# Run linter
npm run lint
```

---

## 🌍 Internationalization

Add new languages in `src/assets/i18n/`:

```
src/assets/i18n/
├── en.json  # English (default)
├── de.json  # German
└── hu.json  # Hungarian
```

The app automatically loads the user's language preference from localStorage.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 Development Workflow

### Working with Swagger Specs

Always follow this pattern when modifying specs:

```typescript
// 1. Get current spec
const spec = apiDataService.getSelectedSwaggerSpecValue();

// 2. Modify spec
spec.paths['/users'] = { /* ... */ };

// 3. Update in service
apiDataService.updateSwaggerSpec(spec);

// 4. Save to storage
apiDataService.saveSwaggerSpecToStorage(spec);

// 5. (Optional) Save to backend
apiDataService.saveSwaggerToDatabase(filename, spec);
```

### Version Detection

Check spec version before accessing schemas:

```typescript
if (spec.openapi) {
  // OpenAPI 3.x - use spec.components.schemas
} else {
  // Swagger 2.0 - use spec.definitions
}
```

---

## 🐛 Troubleshooting

### Problem: "404 Not Found" on page reload

**Solution:** SPA routing configuration issue

- GitHub Pages: Copy `index.html` to `404.html`
- Netlify/Vercel: Handled automatically

### Problem: Assets not loading

**Solution:** Incorrect `--base-href`

```bash
npm run build:standalone -- --base-href /
```

### Problem: localStorage not working

**Solution:** Must use HTTPS or localhost (not `file://`)

```bash
npx http-server dist/api-conf/browser
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Angular](https://angular.io/) - The modern web framework
- [PrimeNG](https://primeng.org/) - Rich UI component library
- [Keycloak](https://www.keycloak.org/) - Open source identity management
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/<username>/api-loom/issues)
- **Discussions:** [GitHub Discussions](https://github.com/<username>/api-loom/discussions)
- **Documentation:** See [DEPLOYMENT.md](./DEPLOYMENT.md) and [CLAUDE.md](./CLAUDE.md)

---

<div align="center">

**Built with ❤️ using Angular and PrimeNG**

[⭐ Star this repo](https://github.com/<username>/api-loom) | [🐛 Report Bug](https://github.com/<username>/api-loom/issues) | [💡 Request Feature](https://github.com/<username>/api-loom/issues)

</div>
