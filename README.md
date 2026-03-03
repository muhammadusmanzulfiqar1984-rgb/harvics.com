# Harvics Corporate Website & Distributor Portal

A modern, fully localized corporate website and distributor portal for Harvics Global Ventures, built with Next.js 15, TypeScript, and Express.js.

## 🚀 Features

- 📱 **Responsive Design**: Mobile-first approach with modern UI
- 🌍 **Full Localization**: Support for 38+ languages using `next-intl`
- 🎨 **Beautiful Animations**: Smooth transitions and interactive elements
- 🚀 **Next.js 15**: Latest Next.js with App Router
- 🎯 **TypeScript**: Full type safety across frontend and backend
- 🎨 **Tailwind CSS**: Modern styling framework with custom Harvics branding
- 🗄️ **PostgreSQL Database**: Comprehensive V15.2 schema for distributor portal
- 🤖 **AI Engine**: Python-based AI models for recommendations and insights
- 🏢 **Multi-Portal System**: Distributor, Supplier, Company, and Investor portals
- 🔐 **Role-Based Access Control**: Secure authentication and authorization

---

## 📁 Complete Project Structure

```
harvics-website/
│
├── 📄 README.md                    # This file - complete project documentation
├── 📄 package.json                 # Project dependencies and scripts
├── 📄 next.config.js               # Next.js configuration with i18n
├── 📄 tailwind.config.js           # Tailwind CSS configuration
├── 📄 tsconfig.json                # TypeScript configuration
├── 📄 docker-compose.yml           # Docker configuration for services
├── 📄 netlify.toml                 # Netlify deployment configuration
│
├── 📁 src/                         # Frontend source code
│   ├── 📁 app/                     # Next.js App Router
│   │   ├── 📁 [locale]/            # Localized routes
│   │   │   ├── 📄 page.tsx         # Homepage
│   │   │   ├── 📁 about/           # About pages
│   │   │   │   ├── 📄 page.tsx
│   │   │   │   └── 📁 brand-story/
│   │   │   ├── 📁 products/        # Product catalog
│   │   │   │   ├── 📄 page.tsx
│   │   │   │   ├── 📁 [category]/
│   │   │   │   └── 📁 confectionery/
│   │   │   ├── 📁 contact/         # Contact page
│   │   │   ├── 📁 checkout/        # Checkout flow
│   │   │   ├── 📁 login/           # Authentication
│   │   │   │   ├── 📄 page.tsx
│   │   │   │   ├── 📁 company/
│   │   │   │   ├── 📁 distributor/
│   │   │   │   ├── 📁 supplier/
│   │   │   │   ├── 📁 employee/
│   │   │   │   └── 📁 investor/
│   │   │   ├── 📁 dashboard/       # User dashboards
│   │   │   │   ├── 📁 company/
│   │   │   │   ├── 📁 distributor/
│   │   │   │   └── 📁 supplier/
│   │   │   ├── 📁 distributor-portal/  # Full distributor portal
│   │   │   │   ├── 📄 page.tsx         # Portal dashboard
│   │   │   │   ├── 📁 orders/          # Order management
│   │   │   │   │   ├── 📁 new/
│   │   │   │   │   ├── 📁 history/
│   │   │   │   │   └── 📁 invoices/
│   │   │   │   ├── 📁 products/        # Product catalog & pricing
│   │   │   │   │   ├── 📁 catalogue/
│   │   │   │   │   ├── 📁 pricing/
│   │   │   │   │   └── 📁 promotions/
│   │   │   │   ├── 📁 coverage/        # Territory coverage
│   │   │   │   │   ├── 📁 territories/
│   │   │   │   │   ├── 📁 heatmap/
│   │   │   │   │   └── 📁 request/
│   │   │   │   ├── 📁 market/          # Market intelligence
│   │   │   │   │   ├── 📁 sellout/
│   │   │   │   │   └── 📁 competitors/
│   │   │   │   ├── 📁 account/         # Account management
│   │   │   │   │   ├── 📁 profile/
│   │   │   │   │   ├── 📁 users/
│   │   │   │   │   └── 📁 documents/
│   │   │   │   ├── 📁 support/         # Support & tickets
│   │   │   │   │   ├── 📁 tickets/
│   │   │   │   │   └── 📁 knowledge/
│   │   │   │   └── 📄 layout.tsx       # Portal layout wrapper
│   │   │   ├── 📁 investor-relations/  # Investor portal
│   │   │   ├── 📁 copilot/            # AI copilot interface
│   │   │   ├── 📁 csr/                # Corporate social responsibility
│   │   │   ├── 📁 portal/             # Generic portal routes
│   │   │   └── 📄 layout.tsx          # Root locale layout
│   │   ├── 📁 api/                    # Next.js API routes
│   │   ├── 📄 globals.css             # Global styles
│   │   ├── 📄 layout.tsx              # Root layout
│   │   └── 📄 head.tsx                # HTML head configuration
│   │
│   ├── 📁 components/                 # React components (41 files)
│   │   ├── 📄 Header.tsx              # Main navigation header
│   │   ├── 📄 Footer.tsx              # Site footer with links
│   │   ├── 📄 CreativeHero.tsx        # Homepage hero section
│   │   ├── 📄 CreativeProductShowcase.tsx  # Product showcase
│   │   ├── 📄 MStyleNavigation.tsx    # M&S-style product nav
│   │   ├── 📄 SaleMegaMenu.tsx        # Sale mega menu
│   │   ├── 📄 FoodMegaMenu.tsx        # Food mega menu
│   │   ├── 📄 NestleNewsSection.tsx   # News section component
│   │   ├── 📄 InteractiveWorldMap.tsx # Interactive global map
│   │   ├── 📄 HarvicsGlobalWorld.tsx  # Global presence component
│   │   ├── 📄 CreativeStatsSection.tsx # Statistics section
│   │   ├── 📄 ContactSection.tsx      # Contact form section
│   │   ├── 📄 LanguageSwitcher.tsx    # Language selector
│   │   ├── 📄 CountrySelector.tsx     # Country selector
│   │   ├── 📄 RegionSelector.tsx      # Region selector
│   │   ├── 📄 CookieSettingsButton.tsx # Cookie preferences
│   │   ├── 📄 ScrollToTopButton.tsx   # Scroll to top button
│   │   ├── 📄 SearchModal.tsx         # Search functionality
│   │   ├── 📄 Lightbox.tsx            # Image lightbox
│   │   ├── 📄 ProductSlider.tsx       # Product carousel
│   │   ├── 📄 DarkModeToggle.tsx      # Dark mode switcher
│   │   ├── 📄 ChatbotWidget.tsx       # Chatbot interface
│   │   ├── 📄 AICopilot.tsx           # AI copilot component
│   │   ├── 📄 EnterpriseCRM.tsx       # CRM interface
│   │   ├── 📄 AdminPanel.tsx          # Admin panel
│   │   ├── 📄 PersonaPortal.tsx       # Persona-based portal
│   │   ├── 📄 InvestorRelationsTabs.tsx # Investor tabs
│   │   ├── 📄 StockTicker.tsx         # Stock price ticker
│   │   ├── 📄 StockChart.tsx          # Stock chart component
│   │   ├── 📄 AutoBugDetector.tsx     # Bug detection component
│   │   ├── 📄 PayPalButton.tsx        # PayPal integration
│   │   ├── 📄 ServiceInfoBanner.tsx   # Service info banner
│   │   └── 📁 portals/
│   │       └── 📄 DistributorPortalLayout.tsx  # Portal layout
│   │
│   ├── 📁 contexts/                   # React contexts
│   │   ├── 📄 CountryContext.tsx      # Country selection context
│   │   └── 📄 RegionContext.tsx       # Region selection context
│   │
│   ├── 📁 data/                       # Static data files
│   │   ├── 📄 countryData.ts          # Country information
│   │   ├── 📄 regions.ts              # Regional data
│   │   ├── 📄 productCategories.ts    # Product categories
│   │   └── 📄 folderBasedProducts.ts  # Product data structure
│   │
│   ├── 📁 hooks/                      # Custom React hooks
│   │   └── 📄 useDashboardData.ts     # Dashboard data hook
│   │
│   ├── 📁 locales/                    # Translation files
│   │   ├── 📄 en.json                 # English translations
│   │   └── 📄 ar.json                 # Arabic translations
│   │
│   ├── 📁 lib/                        # Utility libraries
│   │   └── 📄 api.ts                  # API client utilities
│   │
│   ├── 📁 services/                   # Frontend services
│   │   └── 📄 translation.ts          # Translation service
│   │
│   ├── 📁 types/                      # TypeScript type definitions
│   │   └── 📄 userScope.ts            # User scope types
│   │
│   ├── 📁 utils/                      # Utility functions
│   │   └── 📄 [utility files]
│   │
│   ├── 📄 i18n.ts                     # Next-intl configuration
│   └── 📄 middleware.ts               # Next.js middleware (locale)
│
├── 📁 backend/                        # Backend Express.js API
│   ├── 📁 src/
│   │   ├── 📄 index.ts                # Express server entry point
│   │   ├── 📄 routes.ts               # API route definitions
│   │   │
│   │   ├── 📁 config/                 # Configuration files
│   │   │
│   │   ├── 📁 core/                   # Core utilities
│   │   │
│   │   ├── 📁 middleware/             # Express middleware
│   │   │   └── 📄 cors.middleware.ts
│   │   │
│   │   ├── 📁 modules/                # Feature modules (14 modules)
│   │   │   ├── 📁 auth/               # Authentication
│   │   │   │   ├── 📄 auth.controller.ts
│   │   │   │   ├── 📄 userScope.types.ts
│   │   │   │   └── 📄 userScopes.data.ts
│   │   │   ├── 📁 localisation/       # Localization API
│   │   │   │   ├── 📄 localisation.controller.ts
│   │   │   │   ├── 📄 localisation.service.ts
│   │   │   │   ├── 📄 countries.controller.ts
│   │   │   │   ├── 📄 countries.service.ts
│   │   │   │   └── 📄 [types & data files]
│   │   │   ├── 📁 domains/            # Domain management
│   │   │   ├── 📁 products/           # Product API
│   │   │   ├── 📁 navigation/         # Navigation API
│   │   │   ├── 📁 master-data/        # Master data types
│   │   │   │   └── 📄 types.ts        # V15.2 schema types
│   │   │   ├── 📁 ai/                 # AI integration
│   │   │   ├── 📁 gps/                # GPS/geolocation
│   │   │   ├── 📁 satellite/          # Satellite data
│   │   │   ├── 📁 trade/              # Trade operations
│   │   │   ├── 📁 procurement/        # Procurement
│   │   │   ├── 📁 dataOcean/          # Data ocean integration
│   │   │   ├── 📁 fmcgGraph/          # FMCG graph data
│   │   │   ├── 📁 bff/                # Backend for Frontend
│   │   │   └── 📁 system/             # System endpoints
│   │   │
│   │   ├── 📁 types/                  # Backend types
│   │   │
│   │   └── 📁 external/               # External integrations
│   │       └── 📁 mockProviders/
│   │           └── 📁 data/
│   │               └── 📄 MONDELEZ_DATA_OCEAN.json
│   │
│   ├── 📁 tests/                      # Backend tests
│   │   ├── 📄 domains.data.test.ts
│   │   ├── 📄 gps.test.ts
│   │   └── 📄 localisation.test.ts
│   │
│   └── 📄 tsconfig.json               # Backend TypeScript config
│
├── 📁 db/                             # Database migrations
│   └── 📁 migrations/
│       ├── 📄 001_init_core.sql       # Core initialization
│       ├── 📄 002_countries_regions_cities.sql  # Geography data
│       └── 📄 003_complete_master_data.sql     # V15.2 full schema
│
├── 📁 ai-engine/                      # Python AI engine
│   ├── 📁 src/
│   │   ├── 📄 main.py                 # AI engine entry point
│   │   ├── 📄 system_monitor.py       # System monitoring
│   │   └── 📁 models/                 # AI models
│   │       ├── 📄 coverage.py         # Coverage prediction
│   │       ├── 📄 demand.py           # Demand forecasting
│   │       ├── 📄 price.py            # Price optimization
│   │       ├── 📄 sku.py              # SKU recommendations
│   │       └── 📄 strategy.py         # Strategic recommendations
│   ├── 📁 tests/
│   ├── 📄 requirements.txt            # Python dependencies
│   └── 📄 start_monitor.sh            # Monitor startup script
│
├── 📁 docs/                           # Documentation (organized)
│   ├── 📄 README.md                   # Documentation index
│   ├── 📁 architecture/               # Architecture docs (4 files)
│   │   ├── 📄 HARVICS_PLATFORM_ARCHITECTURE.md
│   │   ├── 📄 DATABASE_SCHEMA_V15.2_IMPLEMENTATION.md
│   │   ├── 📄 DATABASE_SETUP_GUIDE.md
│   │   └── 📄 LOCALIZATION_ARCHITECTURE.md
│   ├── 📁 implementation/             # Implementation docs (2 files)
│   │   ├── 📄 IMPLEMENTATION_ROADMAP.md
│   │   └── 📄 COMPLETE_LOCALIZATION_APPLIED.md
│   ├── 📁 guides/                     # User guides (8 files)
│   │   ├── 📄 HOW_TO_RUN.md
│   │   ├── 📄 HOW_TO_CHECK_EVERYTHING.md
│   │   ├── 📄 LOCALE_SWITCHING_GUIDE.md
│   │   ├── 📄 LOGIN_CREDENTIALS.md
│   │   ├── 📄 PORTAL_ACCESS.md
│   │   ├── 📄 QUICK_CHECK_GUIDE.md
│   │   ├── 📄 QUICK_VIEW_COMMANDS.md
│   │   └── 📄 API_SERVICES_INTEGRATION.md
│   ├── 📁 analysis/                   # Analysis docs (3 files)
│   │   ├── 📄 M_S_INSPIRED_REDESIGN.md
│   │   ├── 📄 M_S_FOODS_ANALYSIS.md
│   │   └── 📄 M_S_PATTERNS_APPLIED.md
│   └── 📁 archive/                    # Archived/old docs (40+ files)
│
├── 📁 scripts/                        # Utility scripts
│   ├── 📄 START_SERVERS.sh            # Start all servers
│   ├── 📄 STOP_SERVERS.sh             # Stop all servers
│   ├── 📄 ACTIVATE_LOCALIZATION.sh    # Activate localization
│   ├── 📄 deploy-to-harvics-com.sh    # Deployment script
│   ├── 📄 test-all.sh                 # Run all tests
│   └── 📄 README.md                   # Scripts documentation
│
├── 📁 public/                         # Static assets
│   ├── 📁 Images/                     # Image assets (155 files)
│   ├── 📁 Music/                      # Audio files
│   ├── 📄 logo.png                    # Company logo
│   ├── 📄 favicon.ico                 # Favicon
│   ├── 📄 manifest.json               # PWA manifest
│   ├── 📄 robots.txt                  # SEO robots file
│   └── 📄 _redirects                  # Netlify redirects
│
└── 📁 node_modules/                   # NPM dependencies (auto-generated)

```

---

## 🗄️ Database Schema (V15.2)

The application uses PostgreSQL with a comprehensive schema for the Distributor Portal:

### Reference Tables
- `countries`, `regions`, `cities`, `territories` - Geographic hierarchy
- `channels` - Sales channels (GT, MT, HORECA, WHOLESALE)
- `currencies` - Currency definitions

### Identity & Access
- `distributors` - Distributor master data
- `distributor_warehouses` - Warehouse locations
- `distributor_territories` - Territory assignments
- `portal_users` - User accounts
- `portal_user_permissions` - Fine-grained permissions

### Master Data
- `skus` - Product SKUs
- `sku_images` - Product images
- `price_lists` - Pricing structures
- `price_list_items` - Price list entries

### Orders & Finance
- `orders` - Order management
- `order_items` - Order line items
- `invoices` - Invoice tracking
- `payments` - Payment records
- `credit_limits_history` - Credit limit audit trail

### Promotions
- `promotions` - Promotion definitions
- `promotion_skus` - Promotion-SKU mapping
- `distributor_promotions` - Distributor participation

### Support & Market Data
- `tickets` - Support tickets
- `ticket_comments` - Ticket conversations
- `documents` - Document management
- `sellout_uploads` - Sellout data uploads
- `sellout_lines` - Parsed sellout data
- `competitor_reports` - Competitor intelligence

### AI & Audit
- `ai_recommendations_log` - AI recommendation tracking
- `audit_logs` - System audit trail

See `docs/architecture/DATABASE_SCHEMA_V15.2_IMPLEMENTATION.md` for complete schema details.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **PostgreSQL** 14+ (for database)
- **Python** 3.9+ (for AI engine, optional)

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   DATABASE_URL=postgresql://user:password@localhost:5432/harvics
   USE_MOCK_PROVIDERS=true
   ```

3. **Set up database**:
   ```bash
   # Run migrations
   psql -U postgres -d harvics < db/migrations/001_init_core.sql
   psql -U postgres -d harvics < db/migrations/002_countries_regions_cities.sql
   psql -U postgres -d harvics < db/migrations/003_complete_master_data.sql
   ```

4. **Start development servers**:
   ```bash
   # Start both frontend and backend
   npm run start-servers
   
   # Or start individually:
   npm run dev          # Frontend (port 3000)
   npm run backend      # Backend API (port 4000)
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - API Docs: http://localhost:4000/api

---

## 📝 Available Scripts

```bash
npm run dev              # Start Next.js dev server (port 3000)
npm run backend          # Start Express backend (port 4000)
npm run backend:watch    # Backend with auto-reload
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run test-all         # Run all tests
npm run start-servers    # Start both frontend & backend
npm run stop-servers     # Stop all servers
npm run clear-cache      # Clear Next.js cache
```

---

## 🌍 Localization

The application supports **38+ languages** using `next-intl`:

- **Primary locales**: English (en), Arabic (ar)
- **Supported locales**: French, Spanish, German, Chinese, Hebrew, Hindi, Portuguese, Russian, Japanese, Korean, Italian, Dutch, Polish, Turkish, Vietnamese, Thai, Indonesian, Malay, Swahili, Ukrainian, Romanian, Czech, Swedish, Danish, Finnish, Norwegian, Greek, Hungarian, Bulgarian, Croatian, Slovak, Serbian, Bengali, Urdu, Persian, Pashto

### Translation Files
- `src/locales/en.json` - English translations
- `src/locales/ar.json` - Arabic translations
- Additional locales can be added by creating new JSON files

### Usage in Components
```tsx
import {useTranslations} from 'next-intl';

function MyComponent() {
  const t = useTranslations('namespace');
  return <h1>{t('key')}</h1>;
}
```

See `docs/guides/LOCALE_SWITCHING_GUIDE.md` for detailed localization guide.

---

## 🏗️ Architecture Overview

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom Harvics branding
- **Internationalization**: next-intl
- **State Management**: React Context API
- **Routing**: File-based routing with locale support

### Backend (Express.js)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via migrations)
- **ORM**: Prisma (recommended, setup guide in docs)
- **API Style**: RESTful API
- **Modules**: Modular architecture (14 feature modules)

### AI Engine (Python)
- **Framework**: Python 3.9+
- **Purpose**: AI recommendations, demand forecasting, price optimization
- **Models**: Coverage, demand, price, SKU, strategy
- **Integration**: Separate service, communicates via API

### Database
- **Type**: PostgreSQL
- **Schema Version**: V15.2
- **Migrations**: SQL migration files in `db/migrations/`
- **Tables**: 31 tables covering reference data, identity, master data, orders, finance, promotions, support, AI tracking, and audit logs

---

## 🔐 Authentication & Authorization

The application supports multiple user personas:

- **Company Users**: Internal staff access
- **Distributors**: Distributor portal access
- **Suppliers**: Supplier portal access
- **Employees**: Employee dashboard
- **Investors**: Investor relations portal

### Login Pages
- `/login` - Unified login page
- `/login/company` - Company login
- `/login/distributor` - Distributor login
- `/login/supplier` - Supplier login
- `/login/employee` - Employee login
- `/login/investor` - Investor login

See `docs/guides/LOGIN_CREDENTIALS.md` for default credentials.

---

## 🎨 Branding & Design

### Color Scheme
- **Primary Gold**: `#d4af37` (Harvics golden)
- **Dark Maroon**: `#3c0008` (Text on gold)
- **Harvics Red**: `#c41e3a` (Accent color)
- **White**: `#ffffff` (Background)

### Design Inspiration
- **M&S Foods**: Clean, modern food retail design
- **Nestlé**: Professional FMCG corporate style
- **Custom**: Harvics brand identity with golden accents

### Components
- Modern, clean UI with embedded-style tabs
- Responsive navigation with mega menus
- Interactive product showcases
- Global presence map
- Statistics and analytics dashboards

---

## 📚 Documentation

All documentation is organized in the `/docs` folder:

### Quick Links
- **New to the project?** → `docs/guides/HOW_TO_RUN.md`
- **Setting up database?** → `docs/architecture/DATABASE_SETUP_GUIDE.md`
- **Understanding architecture?** → `docs/architecture/HARVICS_PLATFORM_ARCHITECTURE.md`
- **Implementation status?** → `docs/implementation/IMPLEMENTATION_ROADMAP.md`
- **Localization guide?** → `docs/guides/LOCALE_SWITCHING_GUIDE.md`

### Documentation Structure
- **`docs/architecture/`** - System architecture and design
- **`docs/implementation/`** - Implementation plans and progress
- **`docs/guides/`** - How-to guides and tutorials
- **`docs/analysis/`** - Design analysis and comparisons
- **`docs/archive/`** - Old/deprecated documentation

See `docs/README.md` for complete documentation index.

---

## 🧪 Testing

```bash
# Run all tests
npm run test-all

# Backend tests
cd backend && npm test

# Frontend tests (when configured)
npm run test
```

Test files are located in:
- `backend/tests/` - Backend API tests
- `ai-engine/tests/` - AI engine tests

---

## 🚢 Deployment

### Netlify (Recommended for Frontend)
The project is configured for Netlify deployment:
- Configuration: `netlify.toml`
- Build command: `npm run build`
- Publish directory: `.next`

### Docker
Docker Compose configuration available:
```bash
docker-compose up
```

### Manual Deployment
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Backend should run separately on port 4000

See deployment scripts in `scripts/` folder.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📞 Contact & Support

- **Email**: info@harvics.com
- **Phone**: +44 7405 527427
- **WhatsApp**: +44 7405 527427

---

## 📄 License

This project is licensed under the ISC License.

---

## 🎯 Key Technologies

| Category | Technology |
|----------|-----------|
| Frontend Framework | Next.js 15 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend | Express.js |
| Database | PostgreSQL |
| Localization | next-intl |
| AI Engine | Python 3.9+ |
| Package Manager | npm |
| Deployment | Netlify / Docker |

---

## 📊 Project Statistics

- **Components**: 41 React components
- **Pages**: 60+ Next.js pages
- **API Modules**: 14 backend modules
- **Database Tables**: 31 tables
- **Supported Languages**: 38+ locales
- **Routes**: 50+ localized routes

---

**Built with ❤️ for Harvics Global Ventures**
