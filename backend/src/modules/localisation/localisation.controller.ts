import { Router } from 'express';
import { buildLocalisationPayload, getCountryProfile, listCountryProfiles } from './localisation.service';

const localisationRouter = Router();

// Helper to compute a simple A/B/C/D grade from a score (0–100)
const computeGrade = (score: number): string => {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  return 'D';
};

// Helper to build a URL-safe slug from country name
const toSlug = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

// Existing endpoint: detailed localisation payload for a single country
localisationRouter.get('/country/:code', async (req, res) => {
  const { code } = req.params;
  const profile = getCountryProfile(code);

  if (!profile) {
    return res.status(404).json({
      error: `Country profile not found for code: ${code}`
    });
  }

  try {
    const payload = await buildLocalisationPayload(profile);
    return res.json(payload);
  } catch (error) {
    console.error('Error building localisation payload:', error);
    return res.status(500).json({
      error: 'Failed to build localisation payload'
    });
  }
});

// REMOVED: Countries summary moved to public route in routes.ts
// This endpoint is now public and defined in routes.ts before protected middleware
// Keeping this for backward compatibility but it won't be reached due to public route above
localisationRouter.get('/countries/summary', async (_req, res) => {
  try {
    const profiles = listCountryProfiles();

    const data = await Promise.all(profiles.map(async (profile) => {
      const payload = await buildLocalisationPayload(profile);
      const score = payload.marketScore;
      const grade = computeGrade(score);

      return {
        code: toSlug(profile.name), // e.g. "United States" -> "united-states"
        isoCode: profile.code, // keep ISO code as well
        name: profile.name,
        score,
        grade,
        priceBand: payload.priceBand,
        lastAnalyzed: null
      };
    }));

    return res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Error building countries summary:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to build countries summary'
    });
  }
});

// New: Detailed localisation analysis per country for CRM & dashboard
// Path: /api/localisation/analysis/:country  (and /api/localization/analysis/:country via alias)
localisationRouter.get('/analysis/:country', async (req, res) => {
  const { country } = req.params;
  const profile = getCountryProfile(country);

  if (!profile) {
    return res.status(404).json({
      success: false,
      error: `Country profile not found for code or name: ${country}`
    });
  }

  try {
    const payload = await buildLocalisationPayload(profile);
    const score = payload.marketScore;
    const grade = computeGrade(score);

  // Basic but fully shaped analysis object that matches what the frontend expects
  const analysis = {
    country: {
      code: profile.code,
      name: profile.name,
      region: profile.region
    },
    scoring: {
      overall: score,
      grade,
      recommendation:
        score >= 80
          ? 'High-priority expansion market'
          : score >= 60
          ? 'Strategic growth market'
          : 'Selective / opportunistic focus'
    },
    priceBand: {
      band: payload.priceBand,
      gdpPerCapita: payload.gdpPerCapita,
      marketType: payload.marketType
    },
    skuMix: {
      top3: ['Snacks', 'Beverages', 'Confectionery'],
      mix: {
        Snacks: {
          score: Math.min(100, score + 5),
          priority: 'High'
        },
        Beverages: {
          score: Math.max(40, score - 5),
          priority: 'Medium'
        },
        Confectionery: {
          score: Math.max(30, score - 10),
          priority: 'Medium'
        }
      },
      strategy: payload.skuStrategy.join
        ? payload.skuStrategy.join(', ')
        : String(payload.skuStrategy || 'Balanced portfolio with focus SKUs')
    },
    channelStrategy: {
      sorted: [
        {
          channel: 'Modern Trade',
          allocation: 40,
          priority: 'High'
        },
        {
          channel: 'General Trade',
          allocation: 35,
          priority: 'High'
        },
        {
          channel: 'E‑commerce',
          allocation: 15,
          priority: 'Medium'
        },
        {
          channel: 'HORECA',
          allocation: 10,
          priority: 'Medium'
        }
      ],
      primary: 'Modern Trade',
      secondary: 'General Trade'
    },
    coverageScore: {
      overall: Math.min(100, Math.max(40, score - 5)),
      gps: {
        coverageLevel: score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low',
        totalPoints: 5000 + score * 50
      },
      satellite: {
        highPriorityWhitespaces: Math.max(3, Math.round((100 - score) / 5))
      },
      recommendation:
        score >= 80
          ? 'Focus on depth and premiumisation in existing channels.'
          : 'Increase numeric distribution and close white space gaps before scaling media.'
    },
    strategyText: {
      fullText: [
        `For ${profile.name}, the overall market score of ${score} (${grade} grade) indicates a strong opportunity for Harvics Foods.`,
        `Leverage existing distributor structures and modern trade penetration while gradually expanding into high-potential white spaces.`,
        'Prioritise SKU mixes that balance affordability with premium cues, using GPS and satellite coverage to target dense urban clusters first.'
      ].join('\n\n')
    }
  };

    return res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error building localisation analysis:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to build localisation analysis'
    });
  }
});

// Languages handler - exported for public access
export const getLanguagesHandler = async (_req: any, res: any) => {
  try {
    const languages = [
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', rtl: false },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
      { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false },
      { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false },
      { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false },
      { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', rtl: false },
      { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', rtl: false },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', rtl: false },
      { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', rtl: false },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', rtl: false },
      { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', rtl: false },
      { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', rtl: false },
      { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', rtl: false },
      { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', rtl: false },
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', rtl: false },
      { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', rtl: false },
      { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', rtl: false },
      { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', rtl: false },
      { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', rtl: false },
      { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', rtl: false },
      { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', rtl: false },
      { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', rtl: false },
      { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', rtl: false },
      { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', rtl: false },
      { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', rtl: false },
      { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', rtl: false },
      { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', rtl: false },
      { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', rtl: false },
      { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', rtl: false },
      { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬', rtl: false },
      { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷', rtl: false },
      { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰', rtl: false },
      { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸', rtl: false },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', rtl: false },
      { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', rtl: true },
      { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', rtl: true },
      { code: 'ps', name: 'Pashto', nativeName: 'پښتو', flag: '🇦🇫', rtl: true }
    ];

    return res.json({
      success: true,
      count: languages.length,
      data: languages
    });
  } catch (error) {
    console.error('Error fetching languages:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch languages'
    });
  }
};

// Languages endpoint - Get supported languages for localization
localisationRouter.get('/languages', getLanguagesHandler);

// Translations handler - exported for public access
export const getTranslationsHandler = async (req: any, res: any) => {
  try {
    const { locale } = req.params;
  
  // In-memory translations (can be moved to database later) - moved outside try block for error handling
  const translations: Record<string, Record<string, any>> = {
      en: {
        navigation: {
          home: "Home",
          about: "About",
          aboutUs: "About Us",
          brandStory: "Brand Story",
          products: "Products",
          ourProducts: "Our Products",
          viewAllProducts: "View All Products",
          csr: "CSR",
          esgReport: "2024 ESG REPORT",
          investorRelations: "Investor Relations",
          portals: "Portals",
          help: "Help",
          findStore: "Find a store",
          signIn: "Sign in",
          wishlist: "Wishlist",
          cart: "Shopping cart"
        },
        footer: {
          companyName: "Harvics Global Ventures",
          tagline: "Premium FMCG Since 2018",
          description: "Leading global FMCG corporation delivering premium food products across diverse categories worldwide.",
          locations: "London • Milan • New York",
          since: "Since 2018",
          quickLinks: "Quick Links",
          home: "Home",
          aboutUs: "About Us",
          products: "Products",
          contact: "Contact",
          csr: "CSR",
          contactInfo: "Contact Info",
          copyright: "© 2024 Harvics Global Ventures. All rights reserved.",
          followUs: "Follow Us"
        },
        crm: {
          roleIndicator: {
            distributor: "Distributor",
            supplier: "Supplier",
            manager: "Manager",
            company: "Company",
            sales_officer: "Sales Officer",
            country_manager: "Country Manager",
            hq: "HQ"
          },
          tabs: {
            overview: "Overview",
            orders: "Orders",
            inventory: "Inventory",
            logistics: "Logistics",
            finance: "Finance",
            crm: "CRM",
            hr: "HR",
            executive: "Executive",
            investor: "Investor Relations",
            "legal-ipr": "Legal & IPR",
            competitor: "Competitor",
            "import-export": "Import/Export",
            admin: "Admin"
          },
          kpis: {
            totalOrders: "Total Orders",
            inventoryValue: "Inventory Value",
            logisticsEfficiency: "Logistics Efficiency",
            revenue: "Revenue",
            customers: "Customers",
            employees: "Employees",
            profit: "Profit"
          },
          orders: {
            orderManagement: "Order Management",
            newOrder: "New Order",
            totalOrders: "Total Orders",
            pending: "Pending",
            completed: "Completed",
            revenue: "Revenue"
          },
          common: {
            export: "Export",
            refresh: "Refresh",
            loading: "Loading...",
            noData: "No data available",
            error: "Error loading data"
          }
        },
        products: {
          pageTitle: "Our Products",
          subcategories: "Subcategories",
          harvicsCatoPops: {
            title: "Harvics Cato Pops",
            description: "Premium snack products"
          },
          harvicsSnapbar: {
            title: "Harvics Snapbar",
            description: "Delicious snack bars"
          }
        },
        common: {
          welcome: "Welcome",
          home: "Home",
          about: "About",
          products: "Products",
          contact: "Contact",
          login: "Login",
          dashboard: "Dashboard",
          logout: "Logout",
          search: "Search",
          language: "Language",
          country: "Country"
        },
        home: {
          welcome: "Welcome to",
          companyName: "Harvics Global Ventures",
          tagline: "Premium FMCG products across diverse categories worldwide. Since 2018, delivering excellence in food, beverages, and consumer goods.",
          exploreProducts: "Explore Products",
          learnMore: "Learn More"
        },
        investor: {
          tabs: {
            overview: "Overview",
            financials: "Financial Results",
            reports: "Annual Reports",
            presentations: "Presentations",
            news: "News & Announcements",
            contact: "Contact",
            overviewContent: "Welcome to Harvics Global Ventures Investor Relations. We are committed to transparency and providing our investors with comprehensive information about our financial performance, strategic initiatives, and growth opportunities.",
            financialsContent: "View our latest quarterly and annual financial results, including revenue, profit margins, and key performance indicators."
          }
        }
      },
      fr: {
        navigation: {
          home: "Accueil",
          about: "À propos",
          aboutUs: "À propos de nous",
          brandStory: "Histoire de la Marque",
          products: "Produits",
          ourProducts: "Nos Produits",
          viewAllProducts: "Voir tous les produits",
          csr: "RSE",
          esgReport: "RAPPORT RSE 2024",
          investorRelations: "Relations Investisseurs",
          portals: "Portails"
        },
        footer: {
          companyName: "Harvics Global Ventures",
          tagline: "FMCG Premium Depuis 2018",
          description: "Corporation FMCG mondiale de premier plan offrant des produits alimentaires premium dans diverses catégories à travers le monde.",
          locations: "Londres • Milan • New York",
          since: "Depuis 2018",
          quickLinks: "Liens Rapides",
          home: "Accueil",
          aboutUs: "À propos de nous",
          products: "Produits",
          contact: "Contact",
          csr: "RSE",
          contactInfo: "Informations de Contact",
          copyright: "© 2024 Harvics Global Ventures. Tous droits réservés.",
          followUs: "Suivez-nous"
        },
        crm: {
          roleIndicator: {
            distributor: "Distributeur",
            supplier: "Fournisseur",
            manager: "Gestionnaire",
            company: "Entreprise",
            sales_officer: "Agent Commercial",
            country_manager: "Directeur Pays",
            hq: "Siège"
          },
          tabs: {
            overview: "Vue d'ensemble",
            orders: "Commandes",
            inventory: "Inventaire",
            logistics: "Logistique",
            finance: "Finance",
            crm: "CRM",
            hr: "RH",
            executive: "Direction",
            investor: "Relations Investisseurs",
            "legal-ipr": "Juridique & PI",
            competitor: "Concurrent",
            "import-export": "Import/Export",
            admin: "Administration"
          },
          kpis: {
            totalOrders: "Total Commandes",
            inventoryValue: "Valeur Inventaire",
            logisticsEfficiency: "Efficacité Logistique",
            revenue: "Revenus",
            customers: "Clients",
            employees: "Employés",
            profit: "Profit"
          },
          orders: {
            orderManagement: "Gestion des Commandes",
            newOrder: "Nouvelle Commande",
            totalOrders: "Total Commandes",
            pending: "En attente",
            completed: "Terminé",
            revenue: "Revenus"
          },
          common: {
            export: "Exporter",
            refresh: "Actualiser",
            loading: "Chargement...",
            noData: "Aucune donnée disponible",
            error: "Erreur de chargement des données"
          }
        },
        products: {
          pageTitle: "Nos Produits",
          subcategories: "Sous-catégories",
          harvicsCatoPops: {
            title: "Harvics Cato Pops",
            description: "Produits de grignotage premium"
          },
          harvicsSnapbar: {
            title: "Harvics Snapbar",
            description: "Barres de grignotage délicieuses"
          }
        },
        common: {
          welcome: "Bienvenue",
          home: "Accueil",
          about: "À propos",
          products: "Produits",
          contact: "Contact",
          login: "Connexion",
          dashboard: "Tableau de bord",
          logout: "Déconnexion",
          search: "Rechercher",
          language: "Langue",
          country: "Pays"
        },
        home: {
          welcome: "Bienvenue chez",
          companyName: "Harvics Global Ventures",
          tagline: "Produits FMCG premium dans diverses catégories à travers le monde. Depuis 2018, offrant l'excellence dans les aliments, les boissons et les biens de consommation.",
          exploreProducts: "Explorer les Produits",
          learnMore: "En Savoir Plus"
        }
      },
      ar: {
        navigation: {
          home: "الرئيسية",
          about: "من نحن",
          aboutUs: "من نحن",
          brandStory: "قصة العلامة التجارية",
          products: "المنتجات",
          ourProducts: "منتجاتنا",
          viewAllProducts: "عرض جميع المنتجات",
          csr: "المسؤولية الاجتماعية",
          esgReport: "تقرير الاستدامة 2024",
          investorRelations: "علاقات المستثمرين",
          portals: "البوابات"
        },
        footer: {
          companyName: "هارفيكس جلوبال فينتشرز",
          tagline: "منتجات استهلاكية مميزة منذ 2018",
          description: "شركة عالمية رائدة في مجال المنتجات الاستهلاكية تقدم منتجات غذائية مميزة عبر فئات متنوعة حول العالم.",
          locations: "لندن • ميلانو • نيويورك",
          since: "منذ 2018",
          quickLinks: "روابط سريعة",
          home: "الرئيسية",
          aboutUs: "من نحن",
          products: "المنتجات",
          contact: "اتصل بنا",
          csr: "المسؤولية الاجتماعية",
          contactInfo: "معلومات الاتصال",
          copyright: "© 2024 هارفيكس جلوبال فينتشرز. جميع الحقوق محفوظة.",
          followUs: "تابعنا"
        },
        crm: {
          roleIndicator: {
            distributor: "موزع",
            supplier: "مورد",
            manager: "مدير",
            company: "شركة",
            sales_officer: "ضابط مبيعات",
            country_manager: "مدير الدولة",
            hq: "المقر الرئيسي"
          },
          tabs: {
            overview: "نظرة عامة",
            orders: "الطلبات",
            inventory: "المخزون",
            logistics: "اللوجستيات",
            finance: "المالية",
            crm: "إدارة علاقات العملاء",
            hr: "الموارد البشرية",
            executive: "تنفيذي",
            investor: "علاقات المستثمرين",
            "legal-ipr": "قانوني والملكية الفكرية",
            competitor: "منافس",
            "import-export": "استيراد/تصدير",
            admin: "إدارة"
          },
          kpis: {
            totalOrders: "إجمالي الطلبات",
            inventoryValue: "قيمة المخزون",
            logisticsEfficiency: "كفاءة اللوجستيات",
            revenue: "الإيرادات",
            customers: "العملاء",
            employees: "الموظفون",
            profit: "الربح"
          },
          orders: {
            orderManagement: "إدارة الطلبات",
            newOrder: "طلب جديد",
            totalOrders: "إجمالي الطلبات",
            pending: "قيد الانتظار",
            completed: "مكتمل",
            revenue: "الإيرادات"
          },
          common: {
            export: "تصدير",
            refresh: "تحديث",
            loading: "جاري التحميل...",
            noData: "لا توجد بيانات متاحة",
            error: "خطأ في تحميل البيانات"
          }
        },
        products: {
          pageTitle: "منتجاتنا",
          subcategories: "الفئات الفرعية",
          harvicsCatoPops: {
            title: "هارفيكس كاتو بوبس",
            description: "منتجات وجبات خفيفة مميزة"
          },
          harvicsSnapbar: {
            title: "هارفيكس سناب بار",
            description: "ألواح وجبات خفيفة لذيذة"
          }
        },
        common: {
          welcome: "مرحباً",
          home: "الرئيسية",
          about: "من نحن",
          products: "المنتجات",
          contact: "اتصل بنا",
          login: "تسجيل الدخول",
          dashboard: "لوحة التحكم",
          logout: "تسجيل الخروج",
          search: "بحث",
          language: "اللغة",
          country: "الدولة"
        },
        home: {
          welcome: "مرحباً بكم في",
          companyName: "هارفيكس جلوبال فينتشرز",
          tagline: "منتجات استهلاكية مميزة عبر فئات متنوعة حول العالم. منذ 2018، نقدم التميز في الأغذية والمشروبات والسلع الاستهلاكية.",
          exploreProducts: "استكشف المنتجات",
          learnMore: "اعرف المزيد"
        }
      },
      es: {
        navigation: {
          home: "Inicio",
          about: "Acerca de",
          aboutUs: "Acerca de Nosotros",
          brandStory: "Historia de la Marca",
          products: "Productos",
          ourProducts: "Nuestros Productos",
          viewAllProducts: "Ver Todos los Productos",
          csr: "RSC",
          esgReport: "INFORME RSC 2024",
          investorRelations: "Relaciones con Inversores",
          portals: "Portales"
        },
        footer: {
          companyName: "Harvics Global Ventures",
          tagline: "FMCG Premium Desde 2018",
          description: "Corporación FMCG global líder que ofrece productos alimentarios premium en diversas categorías en todo el mundo.",
          locations: "Londres • Milán • Nueva York",
          since: "Desde 2018",
          quickLinks: "Enlaces Rápidos",
          home: "Inicio",
          aboutUs: "Acerca de Nosotros",
          products: "Productos",
          contact: "Contacto",
          csr: "RSC",
          contactInfo: "Información de Contacto",
          copyright: "© 2024 Harvics Global Ventures. Todos los derechos reservados.",
          followUs: "Síguenos"
        },
        crm: {
          roleIndicator: {
            distributor: "Distribuidor",
            supplier: "Proveedor",
            manager: "Gerente",
            company: "Empresa",
            sales_officer: "Oficial de Ventas",
            country_manager: "Gerente de País",
            hq: "Sede Central"
          },
          tabs: {
            overview: "Resumen",
            orders: "Pedidos",
            inventory: "Inventario",
            logistics: "Logística",
            finance: "Finanzas",
            crm: "CRM",
            hr: "RRHH",
            executive: "Ejecutivo",
            investor: "Relaciones con Inversores",
            "legal-ipr": "Legal y PI",
            competitor: "Competidor",
            "import-export": "Importación/Exportación",
            admin: "Administración"
          },
          kpis: {
            totalOrders: "Total Pedidos",
            inventoryValue: "Valor del Inventario",
            logisticsEfficiency: "Eficiencia Logística",
            revenue: "Ingresos",
            customers: "Clientes",
            employees: "Empleados",
            profit: "Beneficio"
          },
          orders: {
            orderManagement: "Gestión de Pedidos",
            newOrder: "Nuevo Pedido",
            totalOrders: "Total Pedidos",
            pending: "Pendiente",
            completed: "Completado",
            revenue: "Ingresos"
          },
          common: {
            export: "Exportar",
            refresh: "Actualizar",
            loading: "Cargando...",
            noData: "No hay datos disponibles",
            error: "Error al cargar los datos"
          }
        },
        products: {
          pageTitle: "Nuestros Productos",
          subcategories: "Subcategorías",
          harvicsCatoPops: {
            title: "Harvics Cato Pops",
            description: "Productos de aperitivos premium"
          },
          harvicsSnapbar: {
            title: "Harvics Snapbar",
            description: "Barras de aperitivos deliciosas"
          }
        },
        common: {
          welcome: "Bienvenido",
          home: "Inicio",
          about: "Acerca de",
          products: "Productos",
          contact: "Contacto",
          login: "Iniciar Sesión",
          dashboard: "Panel de Control",
          logout: "Cerrar Sesión",
          search: "Buscar",
          language: "Idioma",
          country: "País"
        },
        home: {
          welcome: "Bienvenido a",
          companyName: "Harvics Global Ventures",
          tagline: "Productos FMCG premium en diversas categorías en todo el mundo. Desde 2018, ofreciendo excelencia en alimentos, bebidas y bienes de consumo.",
          exploreProducts: "Explorar Productos",
          learnMore: "Saber Más"
        }
      },
      de: {
        navigation: {
          home: "Startseite",
          about: "Über uns",
          aboutUs: "Über uns",
          brandStory: "Markengeschichte",
          products: "Produkte",
          ourProducts: "Unsere Produkte",
          viewAllProducts: "Alle Produkte anzeigen",
          csr: "CSR",
          esgReport: "ESG-BERICHT 2024",
          investorRelations: "Investorenbeziehungen",
          portals: "Portale"
        },
        footer: {
          companyName: "Harvics Global Ventures",
          tagline: "Premium FMCG Seit 2018",
          description: "Führendes globales FMCG-Unternehmen, das Premium-Lebensmittelprodukte in verschiedenen Kategorien weltweit anbietet.",
          locations: "London • Mailand • New York",
          since: "Seit 2018",
          quickLinks: "Schnelllinks",
          home: "Startseite",
          aboutUs: "Über uns",
          products: "Produkte",
          contact: "Kontakt",
          csr: "CSR",
          contactInfo: "Kontaktinformationen",
          copyright: "© 2024 Harvics Global Ventures. Alle Rechte vorbehalten.",
          followUs: "Folgen Sie uns"
        },
        crm: {
          roleIndicator: {
            distributor: "Händler",
            supplier: "Lieferant",
            manager: "Manager",
            company: "Unternehmen",
            sales_officer: "Verkaufsbeauftragter",
            country_manager: "Ländermanager",
            hq: "Hauptsitz"
          },
          tabs: {
            overview: "Übersicht",
            orders: "Bestellungen",
            inventory: "Inventar",
            logistics: "Logistik",
            finance: "Finanzen",
            crm: "CRM",
            hr: "Personal",
            executive: "Geschäftsführung",
            investor: "Investorenbeziehungen",
            "legal-ipr": "Recht & IPR",
            competitor: "Wettbewerber",
            "import-export": "Import/Export",
            admin: "Administration"
          },
          kpis: {
            totalOrders: "Gesamtbestellungen",
            inventoryValue: "Inventarwert",
            logisticsEfficiency: "Logistikeffizienz",
            revenue: "Umsatz",
            customers: "Kunden",
            employees: "Mitarbeiter",
            profit: "Gewinn"
          },
          orders: {
            orderManagement: "Bestellverwaltung",
            newOrder: "Neue Bestellung",
            totalOrders: "Gesamtbestellungen",
            pending: "Ausstehend",
            completed: "Abgeschlossen",
            revenue: "Umsatz"
          },
          common: {
            export: "Exportieren",
            refresh: "Aktualisieren",
            loading: "Laden...",
            noData: "Keine Daten verfügbar",
            error: "Fehler beim Laden der Daten"
          }
        },
        products: {
          pageTitle: "Unsere Produkte",
          subcategories: "Unterkategorien",
          harvicsCatoPops: {
            title: "Harvics Cato Pops",
            description: "Premium-Snack-Produkte"
          },
          harvicsSnapbar: {
            title: "Harvics Snapbar",
            description: "Köstliche Snack-Riegel"
          }
        },
        common: {
          welcome: "Willkommen",
          home: "Startseite",
          about: "Über uns",
          products: "Produkte",
          contact: "Kontakt",
          login: "Anmelden",
          dashboard: "Dashboard",
          logout: "Abmelden",
          search: "Suchen",
          language: "Sprache",
          country: "Land"
        },
        home: {
          welcome: "Willkommen bei",
          companyName: "Harvics Global Ventures",
          tagline: "Premium FMCG-Produkte in verschiedenen Kategorien weltweit. Seit 2018 bieten wir Exzellenz in Lebensmitteln, Getränken und Konsumgütern.",
          exploreProducts: "Produkte Erkunden",
          learnMore: "Mehr Erfahren"
        }
      },
      zh: {
        navigation: {
          home: "首页",
          about: "关于",
          aboutUs: "关于我们",
          brandStory: "品牌故事",
          products: "产品",
          ourProducts: "我们的产品",
          viewAllProducts: "查看所有产品",
          csr: "企业社会责任",
          esgReport: "2024年ESG报告",
          investorRelations: "投资者关系",
          portals: "门户"
        },
        footer: {
          companyName: "Harvics Global Ventures",
          tagline: "自2018年以来的优质快消品",
          description: "领先的全球快消品公司，在全球不同类别中提供优质食品产品。",
          locations: "伦敦 • 米兰 • 纽约",
          since: "自2018年",
          quickLinks: "快速链接",
          home: "首页",
          aboutUs: "关于我们",
          products: "产品",
          contact: "联系我们",
          csr: "企业社会责任",
          contactInfo: "联系信息",
          copyright: "© 2024 Harvics Global Ventures. 保留所有权利。",
          followUs: "关注我们"
        },
        crm: {
          roleIndicator: {
            distributor: "经销商",
            supplier: "供应商",
            manager: "经理",
            company: "公司",
            sales_officer: "销售员",
            country_manager: "国家经理",
            hq: "总部"
          },
          tabs: {
            overview: "概览",
            orders: "订单",
            inventory: "库存",
            logistics: "物流",
            finance: "财务",
            crm: "客户关系管理",
            hr: "人力资源",
            executive: "高管",
            investor: "投资者关系",
            "legal-ipr": "法律与知识产权",
            competitor: "竞争对手",
            "import-export": "进出口",
            admin: "管理"
          },
          kpis: {
            totalOrders: "总订单数",
            inventoryValue: "库存价值",
            logisticsEfficiency: "物流效率",
            revenue: "收入",
            customers: "客户",
            employees: "员工",
            profit: "利润"
          },
          orders: {
            orderManagement: "订单管理",
            newOrder: "新订单",
            totalOrders: "总订单数",
            pending: "待处理",
            completed: "已完成",
            revenue: "收入"
          },
          common: {
            export: "导出",
            refresh: "刷新",
            loading: "加载中...",
            noData: "无可用数据",
            error: "加载数据时出错"
          }
        },
        products: {
          pageTitle: "我们的产品",
          subcategories: "子类别",
          harvicsCatoPops: {
            title: "Harvics Cato Pops",
            description: "优质零食产品"
          },
          harvicsSnapbar: {
            title: "Harvics Snapbar",
            description: "美味的零食棒"
          }
        },
        common: {
          welcome: "欢迎",
          home: "首页",
          about: "关于",
          products: "产品",
          contact: "联系我们",
          login: "登录",
          dashboard: "仪表板",
          logout: "登出",
          search: "搜索",
          language: "语言",
          country: "国家"
        },
        home: {
          welcome: "欢迎来到",
          companyName: "Harvics Global Ventures",
          tagline: "全球各类优质快消品。自2018年以来，在食品、饮料和消费品领域提供卓越品质。",
          exploreProducts: "探索产品",
          learnMore: "了解更多"
        }
      },
      he: {
        navigation: {
          home: "בית",
          about: "אודות",
          aboutUs: "אודותינו",
          brandStory: "סיפור המותג",
          products: "מוצרים",
          ourProducts: "המוצרים שלנו",
          viewAllProducts: "צפה בכל המוצרים",
          csr: "אחריות תאגידית",
          esgReport: "דוח ESG 2024",
          investorRelations: "יחסי משקיעים",
          portals: "פורטלים"
        },
        footer: {
          companyName: "Harvics Global Ventures",
          tagline: "FMCG פרימיום מאז 2018",
          description: "תאגיד FMCG גלובלי מוביל המספק מוצרי מזון פרימיום בקטגוריות מגוונות ברחבי העולם.",
          locations: "לונדון • מילאנו • ניו יורק",
          since: "מאז 2018",
          quickLinks: "קישורים מהירים",
          home: "בית",
          aboutUs: "אודותינו",
          products: "מוצרים",
          contact: "יצירת קשר",
          csr: "אחריות תאגידית",
          contactInfo: "פרטי יצירת קשר",
          copyright: "© 2024 Harvics Global Ventures. כל הזכויות שמורות.",
          followUs: "עקבו אחרינו"
        },
        crm: {
          roleIndicator: {
            distributor: "מפיץ",
            supplier: "ספק",
            manager: "מנהל",
            company: "חברה",
            sales_officer: "קצין מכירות",
            country_manager: "מנהל מדינה",
            hq: "מטה"
          },
          tabs: {
            overview: "סקירה כללית",
            orders: "הזמנות",
            inventory: "מלאי",
            logistics: "לוגיסטיקה",
            finance: "כספים",
            crm: "ניהול קשרי לקוחות",
            hr: "משאבי אנוש",
            executive: "ביצועי",
            investor: "יחסי משקיעים",
            "legal-ipr": "משפטי וקניין רוחני",
            competitor: "מתחרה",
            "import-export": "יבוא/יצוא",
            admin: "ניהול"
          },
          kpis: {
            totalOrders: "סה\"כ הזמנות",
            inventoryValue: "ערך המלאי",
            logisticsEfficiency: "יעילות לוגיסטית",
            revenue: "הכנסות",
            customers: "לקוחות",
            employees: "עובדים",
            profit: "רווח"
          },
          orders: {
            orderManagement: "ניהול הזמנות",
            newOrder: "הזמנה חדשה",
            totalOrders: "סה\"כ הזמנות",
            pending: "ממתין",
            completed: "הושלם",
            revenue: "הכנסות"
          },
          common: {
            export: "ייצוא",
            refresh: "רענון",
            loading: "טוען...",
            noData: "אין נתונים זמינים",
            error: "שגיאה בטעינת הנתונים"
          }
        },
        products: {
          pageTitle: "המוצרים שלנו",
          subcategories: "תת-קטגוריות",
          harvicsCatoPops: {
            title: "Harvics Cato Pops",
            description: "מוצרי חטיפים פרימיום"
          },
          harvicsSnapbar: {
            title: "Harvics Snapbar",
            description: "מוטות חטיפים טעימים"
          }
        },
        common: {
          welcome: "ברוכים הבאים",
          home: "בית",
          about: "אודות",
          products: "מוצרים",
          contact: "יצירת קשר",
          login: "התחברות",
          dashboard: "לוח בקרה",
          logout: "התנתקות",
          search: "חיפוש",
          language: "שפה",
          country: "מדינה"
        },
        home: {
          welcome: "ברוכים הבאים ל",
          companyName: "Harvics Global Ventures",
          tagline: "מוצרי FMCG פרימיום בקטגוריות מגוונות ברחבי העולם. מאז 2018, מספקים מצוינות במזון, משקאות ומוצרי צריכה.",
          exploreProducts: "חקור מוצרים",
          learnMore: "למד עוד"
        }
      }
    };

    // Get translations for locale, fallback to English
    const requestedLocale: string = locale || 'en';
    let localeTranslations = translations[requestedLocale];
    
    // If locale not found, try loading from file system (for skeleton files)
    if (!localeTranslations) {
      try {
        const fs = require('fs');
        const path = require('path');
        const localeFilePath = path.join(__dirname, '../../../../../src/locales', `${locale}.json`);
        
        if (fs.existsSync(localeFilePath)) {
          const fileContent = fs.readFileSync(localeFilePath, 'utf8');
          localeTranslations = JSON.parse(fileContent);
          // Remove _note if it exists
          if (localeTranslations._note) {
            delete localeTranslations._note;
          }
        }
      } catch (fileError) {
        // File loading failed, will fallback to English
        console.warn(`Could not load translation file for ${locale}, using English fallback`);
      }
    }
    
    // Final fallback to English
    if (!localeTranslations || Object.keys(localeTranslations).length === 0) {
      localeTranslations = translations.en;
    }

    return res.json({
      success: true,
      locale: locale,
      messages: localeTranslations
    });
  } catch (error) {
    console.error('Error fetching translations:', error);
    // Return English translations as last resort
    try {
      const localeTranslations = translations.en || {};
      return res.json({
        success: true,
        locale: 'en',
        messages: localeTranslations
      });
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch translations'
      });
    }
  }
};

// Translations endpoint - Get UI translations for a locale
localisationRouter.get('/translations/:locale', getTranslationsHandler);

// Language preference endpoint - Store/Get user language preference
localisationRouter.post('/language-preference', async (req, res) => {
  try {
    const { languageCode, countryCode } = req.body;
    
    if (!languageCode) {
      return res.status(400).json({
        success: false,
        error: 'Language code is required'
      });
    }

    // In a real implementation, this would store in database
    // For now, we'll just validate and return success
    // Support all 38 languages from the frontend
    const validLanguages = [
      'en', 'ar', 'fr', 'es', 'de', 'zh', 'ur', 'hi', 'pt', 'ru', 'it', 'tr',
      'he', 'ja', 'ko', 'nl', 'pl', 'vi', 'th', 'id', 'ms', 'sw', 'uk', 'ro',
      'cs', 'sv', 'da', 'fi', 'no', 'el', 'hu', 'bg', 'hr', 'sk', 'sr', 'bn',
      'fa', 'ps'
    ];
    if (!validLanguages.includes(languageCode)) {
      return res.status(400).json({
        success: false,
        error: `Invalid language code: ${languageCode}. Supported languages: ${validLanguages.join(', ')}`
      });
    }

    return res.json({
      success: true,
      message: 'Language preference saved',
      data: {
        languageCode,
        countryCode: countryCode || null,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error saving language preference:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save language preference'
    });
  }
});

export default localisationRouter;

