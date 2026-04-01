/**
 * Add missing translation keys to all locale files
 * Run: node scripts/add-static-page-translations.js
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/locales');

// New translation keys for static pages
const newTranslations = {
  en: {
    media: {
      title: "Media Center",
      pageTitle: "Media Center | Harvics",
      description: "Press resources, brand assets, and the latest news from Harvics Global Ventures.",
      corporate: "Corporate",
      sections: {
        news: {
          title: "News & Press Releases",
          desc: "Latest announcements, market expansions, product launches, and corporate updates from Harvics Global Ventures.",
          cta: "Read Latest News"
        },
        gallery: {
          title: "Image Gallery",
          desc: "High-resolution brand assets, product photography, facility images, and event coverage for media use.",
          cta: "Browse Gallery"
        },
        contacts: {
          title: "Media Contacts",
          desc: "Reach our communications team for press inquiries, interview requests, and partnership announcements.",
          cta: "Contact Press Team"
        }
      },
      highlights: {
        marketsCovered: "Markets Covered",
        industryVerticals: "Industry Verticals",
        foundedIn: "Founded in Dubai",
        languagesSupported: "Languages Supported"
      },
      recentHeadlines: "Recent Headlines",
      headlines: {
        expansion: "Harvics Expands FMCG Operations to 5 New Southeast Asian Markets",
        aiPlatform: "New AI-Powered Supply Chain Platform Launched for Global Distribution",
        carbonNeutral: "Harvics Achieves Carbon-Neutral Milestone Across All Facilities",
        partnership: "Strategic Partnership with Leading Textile Manufacturers in South Asia"
      }
    },
    careers: {
      title: "Careers",
      pageTitle: "Careers | Harvics",
      description: "Join Harvics Global Ventures — explore opportunities across 40+ countries.",
      joinUs: "Join Us",
      heroTitle: "Build the Future of Global Trade",
      heroDesc: "We're growing across 40+ countries. Join a team that's building the AI-powered operating system for global commerce.",
      stats: {
        openPositions: "Open Positions",
        countries: "Countries",
        industryVerticals: "Industry Verticals",
        departmentsHiring: "Departments Hiring"
      },
      openPositionsByDept: "Open Positions by Department",
      departments: {
        sales: {
          name: "Sales & Distribution",
          desc: "Drive revenue across 40+ markets. Territory management, key accounts, distributor relations."
        },
        supplyChain: {
          name: "Supply Chain & Logistics",
          desc: "End-to-end supply chain from factory to shelf. Fleet management, warehousing, last-mile delivery."
        },
        technology: {
          name: "Technology & AI",
          desc: "Build Harvics OS — our AI-powered enterprise platform. Full-stack, ML engineering, data science."
        },
        finance: {
          name: "Finance & Treasury",
          desc: "Multi-currency treasury, trade finance, HPay digital payments, FX management across regions."
        },
        procurement: {
          name: "Procurement & Sourcing",
          desc: "Global sourcing from 15+ origin countries. Supplier audits, quality control, factory-direct programs."
        },
        hr: {
          name: "Human Resources",
          desc: "Talent acquisition, L&D, performance management across diverse geographies and cultures."
        },
        legal: {
          name: "Legal & Compliance",
          desc: "Trade compliance, sanctions screening, IP protection, contract management across jurisdictions."
        },
        marketing: {
          name: "Marketing & Brand",
          desc: "Multi-language campaigns, 38-locale content, digital marketing, brand strategy for 10 verticals."
        }
      },
      roles: "roles",
      whyHarvics: "Why Harvics",
      benefits: {
        globalMobility: {
          title: "Global Mobility",
          desc: "Work across Dubai, London, Karachi, Lahore, and 40+ markets"
        },
        growthTrack: {
          title: "Growth Track",
          desc: "Fast-track career progression in a scaling enterprise"
        },
        aiCulture: {
          title: "AI-First Culture",
          desc: "Work with cutting-edge AI and real-time intelligence systems"
        },
        competitivePackage: {
          title: "Competitive Package",
          desc: "Market-leading compensation, housing, and benefits"
        },
        learningBudget: {
          title: "Learning Budget",
          desc: "Annual development budget for courses, conferences, and certifications"
        },
        flexibleWork: {
          title: "Flexible Work",
          desc: "Hybrid arrangements with regional hub offices worldwide"
        }
      }
    },
    strategy: {
      title: "Our Strategy",
      pageTitle: "Strategy | Harvics",
      description: "Building a sustainable future through innovation and excellence",
      heroSubtitle: "Building a sustainable future through innovation and excellence",
      pillars: {
        globalExpansion: {
          title: "Global Expansion",
          desc: "Expanding our presence in emerging markets while strengthening our position in established markets"
        },
        productInnovation: {
          title: "Product Innovation",
          desc: "Investing in R&D to develop new products that meet evolving consumer preferences"
        },
        sustainability: {
          title: "Sustainability",
          desc: "Committed to sustainable practices across our supply chain and operations"
        },
        digitalTransformation: {
          title: "Digital Transformation",
          desc: "Leveraging technology to enhance customer experience and operational efficiency"
        }
      },
      vision: {
        title: "Our Vision",
        desc: "To be the world's leading premium consumer goods company, recognized for quality, innovation, and sustainability."
      }
    }
  },
  ar: {
    media: {
      title: "المركز الإعلامي",
      pageTitle: "المركز الإعلامي | هارفيكس",
      description: "موارد صحفية وأصول العلامة التجارية وأحدث الأخبار من هارفيكس للمشاريع العالمية.",
      corporate: "الشركة",
      sections: {
        news: {
          title: "الأخبار والبيانات الصحفية",
          desc: "أحدث الإعلانات وتوسعات السوق وإطلاق المنتجات والتحديثات المؤسسية من هارفيكس للمشاريع العالمية.",
          cta: "قراءة آخر الأخبار"
        },
        gallery: {
          title: "معرض الصور",
          desc: "أصول العلامة التجارية عالية الدقة وتصوير المنتجات وصور المرافق وتغطية الأحداث للاستخدام الإعلامي.",
          cta: "تصفح المعرض"
        },
        contacts: {
          title: "جهات الاتصال الإعلامية",
          desc: "تواصل مع فريق الاتصالات للاستفسارات الصحفية وطلبات المقابلات وإعلانات الشراكة.",
          cta: "اتصل بفريق الصحافة"
        }
      },
      highlights: {
        marketsCovered: "الأسواق المغطاة",
        industryVerticals: "القطاعات الصناعية",
        foundedIn: "تأسست في دبي",
        languagesSupported: "اللغات المدعومة"
      },
      recentHeadlines: "أحدث العناوين",
      headlines: {
        expansion: "هارفيكس توسع عمليات السلع الاستهلاكية إلى 5 أسواق جديدة في جنوب شرق آسيا",
        aiPlatform: "إطلاق منصة سلسلة التوريد المدعومة بالذكاء الاصطناعي للتوزيع العالمي",
        carbonNeutral: "هارفيكس تحقق معلم الحياد الكربوني عبر جميع المنشآت",
        partnership: "شراكة استراتيجية مع كبار مصنعي المنسوجات في جنوب آسيا"
      }
    },
    careers: {
      title: "الوظائف",
      pageTitle: "الوظائف | هارفيكس",
      description: "انضم إلى هارفيكس للمشاريع العالمية — استكشف الفرص في أكثر من 40 دولة.",
      joinUs: "انضم إلينا",
      heroTitle: "ابنِ مستقبل التجارة العالمية",
      heroDesc: "نحن ننمو في أكثر من 40 دولة. انضم إلى فريق يبني نظام التشغيل المدعوم بالذكاء الاصطناعي للتجارة العالمية.",
      stats: {
        openPositions: "الوظائف الشاغرة",
        countries: "الدول",
        industryVerticals: "القطاعات الصناعية",
        departmentsHiring: "الأقسام التي توظف"
      },
      openPositionsByDept: "الوظائف الشاغرة حسب القسم",
      departments: {
        sales: {
          name: "المبيعات والتوزيع",
          desc: "دفع الإيرادات في أكثر من 40 سوقًا. إدارة المناطق والحسابات الرئيسية وعلاقات الموزعين."
        },
        supplyChain: {
          name: "سلسلة التوريد والخدمات اللوجستية",
          desc: "سلسلة التوريد من المصنع إلى الرف. إدارة الأسطول والتخزين والتوصيل للميل الأخير."
        },
        technology: {
          name: "التكنولوجيا والذكاء الاصطناعي",
          desc: "بناء نظام هارفيكس — منصتنا المؤسسية المدعومة بالذكاء الاصطناعي. تطوير كامل وهندسة التعلم الآلي وعلوم البيانات."
        },
        finance: {
          name: "المالية والخزينة",
          desc: "خزينة متعددة العملات وتمويل التجارة ومدفوعات هيباي الرقمية وإدارة العملات الأجنبية عبر المناطق."
        },
        procurement: {
          name: "المشتريات والتوريد",
          desc: "التوريد العالمي من أكثر من 15 دولة مصدر. عمليات تدقيق الموردين ومراقبة الجودة وبرامج المصنع المباشر."
        },
        hr: {
          name: "الموارد البشرية",
          desc: "استقطاب المواهب والتعلم والتطوير وإدارة الأداء عبر مناطق جغرافية وثقافات متنوعة."
        },
        legal: {
          name: "الشؤون القانونية والامتثال",
          desc: "الامتثال التجاري وفحص العقوبات وحماية الملكية الفكرية وإدارة العقود عبر الولايات القضائية."
        },
        marketing: {
          name: "التسويق والعلامة التجارية",
          desc: "حملات متعددة اللغات ومحتوى 38 لغة والتسويق الرقمي واستراتيجية العلامة التجارية لـ 10 قطاعات."
        }
      },
      roles: "وظيفة",
      whyHarvics: "لماذا هارفيكس",
      benefits: {
        globalMobility: {
          title: "التنقل العالمي",
          desc: "العمل عبر دبي ولندن وكراتشي ولاهور وأكثر من 40 سوقًا"
        },
        growthTrack: {
          title: "مسار النمو",
          desc: "تقدم وظيفي سريع في مؤسسة متنامية"
        },
        aiCulture: {
          title: "ثقافة الذكاء الاصطناعي أولاً",
          desc: "العمل مع أحدث الذكاء الاصطناعي وأنظمة الذكاء في الوقت الفعلي"
        },
        competitivePackage: {
          title: "حزمة تنافسية",
          desc: "تعويضات رائدة في السوق والسكن والمزايا"
        },
        learningBudget: {
          title: "ميزانية التعلم",
          desc: "ميزانية تطوير سنوية للدورات والمؤتمرات والشهادات"
        },
        flexibleWork: {
          title: "العمل المرن",
          desc: "ترتيبات هجينة مع مكاتب مركزية إقليمية في جميع أنحاء العالم"
        }
      }
    },
    strategy: {
      title: "استراتيجيتنا",
      pageTitle: "الاستراتيجية | هارفيكس",
      description: "بناء مستقبل مستدام من خلال الابتكار والتميز",
      heroSubtitle: "بناء مستقبل مستدام من خلال الابتكار والتميز",
      pillars: {
        globalExpansion: {
          title: "التوسع العالمي",
          desc: "توسيع وجودنا في الأسواق الناشئة مع تعزيز موقعنا في الأسواق الراسخة"
        },
        productInnovation: {
          title: "ابتكار المنتجات",
          desc: "الاستثمار في البحث والتطوير لتطوير منتجات جديدة تلبي تفضيلات المستهلكين المتطورة"
        },
        sustainability: {
          title: "الاستدامة",
          desc: "ملتزمون بالممارسات المستدامة عبر سلسلة التوريد والعمليات"
        },
        digitalTransformation: {
          title: "التحول الرقمي",
          desc: "الاستفادة من التكنولوجيا لتحسين تجربة العملاء والكفاءة التشغيلية"
        }
      },
      vision: {
        title: "رؤيتنا",
        desc: "أن نكون الشركة الرائدة عالمياً في السلع الاستهلاكية المتميزة، معترف بها للجودة والابتكار والاستدامة."
      }
    }
  },
  es: {
    media: {
      title: "Centro de Medios",
      pageTitle: "Centro de Medios | Harvics",
      description: "Recursos de prensa, activos de marca y las últimas noticias de Harvics Global Ventures.",
      corporate: "Corporativo",
      sections: {
        news: {
          title: "Noticias y Comunicados de Prensa",
          desc: "Últimos anuncios, expansiones de mercado, lanzamientos de productos y actualizaciones corporativas de Harvics Global Ventures.",
          cta: "Leer Últimas Noticias"
        },
        gallery: {
          title: "Galería de Imágenes",
          desc: "Activos de marca de alta resolución, fotografía de productos, imágenes de instalaciones y cobertura de eventos para uso de medios.",
          cta: "Explorar Galería"
        },
        contacts: {
          title: "Contactos de Medios",
          desc: "Contacte a nuestro equipo de comunicaciones para consultas de prensa, solicitudes de entrevistas y anuncios de asociación.",
          cta: "Contactar Equipo de Prensa"
        }
      },
      highlights: {
        marketsCovered: "Mercados Cubiertos",
        industryVerticals: "Verticales de Industria",
        foundedIn: "Fundada en Dubái",
        languagesSupported: "Idiomas Soportados"
      },
      recentHeadlines: "Titulares Recientes",
      headlines: {
        expansion: "Harvics Expande Operaciones de FMCG a 5 Nuevos Mercados del Sudeste Asiático",
        aiPlatform: "Nueva Plataforma de Cadena de Suministro Impulsada por IA Lanzada para Distribución Global",
        carbonNeutral: "Harvics Alcanza Hito de Neutralidad de Carbono en Todas las Instalaciones",
        partnership: "Asociación Estratégica con Fabricantes Textiles Líderes en el Sur de Asia"
      }
    },
    careers: {
      title: "Carreras",
      pageTitle: "Carreras | Harvics",
      description: "Únete a Harvics Global Ventures — explora oportunidades en más de 40 países.",
      joinUs: "Únete a Nosotros",
      heroTitle: "Construye el Futuro del Comercio Global",
      heroDesc: "Estamos creciendo en más de 40 países. Únete a un equipo que está construyendo el sistema operativo impulsado por IA para el comercio global.",
      stats: {
        openPositions: "Posiciones Abiertas",
        countries: "Países",
        industryVerticals: "Verticales de Industria",
        departmentsHiring: "Departamentos Contratando"
      },
      openPositionsByDept: "Posiciones Abiertas por Departamento",
      departments: {
        sales: {
          name: "Ventas y Distribución",
          desc: "Impulsa ingresos en más de 40 mercados. Gestión de territorios, cuentas clave, relaciones con distribuidores."
        },
        supplyChain: {
          name: "Cadena de Suministro y Logística",
          desc: "Cadena de suministro de extremo a extremo desde fábrica hasta estante. Gestión de flota, almacenamiento, entrega de última milla."
        },
        technology: {
          name: "Tecnología e IA",
          desc: "Construye Harvics OS — nuestra plataforma empresarial impulsada por IA. Full-stack, ingeniería ML, ciencia de datos."
        },
        finance: {
          name: "Finanzas y Tesorería",
          desc: "Tesorería multi-moneda, financiación comercial, pagos digitales HPay, gestión FX en todas las regiones."
        },
        procurement: {
          name: "Compras y Aprovisionamiento",
          desc: "Aprovisionamiento global de más de 15 países de origen. Auditorías de proveedores, control de calidad, programas directos de fábrica."
        },
        hr: {
          name: "Recursos Humanos",
          desc: "Adquisición de talento, L&D, gestión del rendimiento en diversas geografías y culturas."
        },
        legal: {
          name: "Legal y Cumplimiento",
          desc: "Cumplimiento comercial, verificación de sanciones, protección de PI, gestión de contratos en jurisdicciones."
        },
        marketing: {
          name: "Marketing y Marca",
          desc: "Campañas multilingües, contenido de 38 idiomas, marketing digital, estrategia de marca para 10 verticales."
        }
      },
      roles: "roles",
      whyHarvics: "Por Qué Harvics",
      benefits: {
        globalMobility: {
          title: "Movilidad Global",
          desc: "Trabaja en Dubái, Londres, Karachi, Lahore y más de 40 mercados"
        },
        growthTrack: {
          title: "Trayectoria de Crecimiento",
          desc: "Progresión profesional acelerada en una empresa en expansión"
        },
        aiCulture: {
          title: "Cultura IA-Primero",
          desc: "Trabaja con IA de vanguardia y sistemas de inteligencia en tiempo real"
        },
        competitivePackage: {
          title: "Paquete Competitivo",
          desc: "Compensación líder en el mercado, vivienda y beneficios"
        },
        learningBudget: {
          title: "Presupuesto de Aprendizaje",
          desc: "Presupuesto anual de desarrollo para cursos, conferencias y certificaciones"
        },
        flexibleWork: {
          title: "Trabajo Flexible",
          desc: "Arreglos híbridos con oficinas hub regionales en todo el mundo"
        }
      }
    },
    strategy: {
      title: "Nuestra Estrategia",
      pageTitle: "Estrategia | Harvics",
      description: "Construyendo un futuro sostenible a través de la innovación y la excelencia",
      heroSubtitle: "Construyendo un futuro sostenible a través de la innovación y la excelencia",
      pillars: {
        globalExpansion: {
          title: "Expansión Global",
          desc: "Expandiendo nuestra presencia en mercados emergentes mientras fortalecemos nuestra posición en mercados establecidos"
        },
        productInnovation: {
          title: "Innovación de Producto",
          desc: "Invirtiendo en I+D para desarrollar nuevos productos que satisfagan las preferencias cambiantes del consumidor"
        },
        sustainability: {
          title: "Sostenibilidad",
          desc: "Comprometidos con prácticas sostenibles en toda nuestra cadena de suministro y operaciones"
        },
        digitalTransformation: {
          title: "Transformación Digital",
          desc: "Aprovechando la tecnología para mejorar la experiencia del cliente y la eficiencia operativa"
        }
      },
      vision: {
        title: "Nuestra Visión",
        desc: "Ser la empresa líder mundial de bienes de consumo premium, reconocida por calidad, innovación y sostenibilidad."
      }
    }
  },
  fr: {
    media: {
      title: "Centre Médias",
      pageTitle: "Centre Médias | Harvics",
      description: "Ressources presse, actifs de marque et dernières nouvelles de Harvics Global Ventures.",
      corporate: "Entreprise",
      sections: {
        news: {
          title: "Actualités et Communiqués de Presse",
          desc: "Dernières annonces, expansions de marché, lancements de produits et mises à jour corporatives de Harvics Global Ventures.",
          cta: "Lire les Dernières Nouvelles"
        },
        gallery: {
          title: "Galerie d'Images",
          desc: "Actifs de marque haute résolution, photographie de produits, images d'installations et couverture d'événements pour utilisation médiatique.",
          cta: "Parcourir la Galerie"
        },
        contacts: {
          title: "Contacts Médias",
          desc: "Contactez notre équipe de communication pour les demandes de presse, les demandes d'interview et les annonces de partenariat.",
          cta: "Contacter l'Équipe Presse"
        }
      },
      highlights: {
        marketsCovered: "Marchés Couverts",
        industryVerticals: "Secteurs d'Activité",
        foundedIn: "Fondée à Dubaï",
        languagesSupported: "Langues Supportées"
      },
      recentHeadlines: "Titres Récents",
      headlines: {
        expansion: "Harvics Étend ses Opérations FMCG à 5 Nouveaux Marchés d'Asie du Sud-Est",
        aiPlatform: "Nouvelle Plateforme de Chaîne d'Approvisionnement Alimentée par l'IA Lancée pour la Distribution Mondiale",
        carbonNeutral: "Harvics Atteint le Jalon de Neutralité Carbone dans Toutes les Installations",
        partnership: "Partenariat Stratégique avec les Principaux Fabricants Textiles en Asie du Sud"
      }
    },
    careers: {
      title: "Carrières",
      pageTitle: "Carrières | Harvics",
      description: "Rejoignez Harvics Global Ventures — explorez les opportunités dans plus de 40 pays.",
      joinUs: "Rejoignez-Nous",
      heroTitle: "Construisez l'Avenir du Commerce Mondial",
      heroDesc: "Nous grandissons dans plus de 40 pays. Rejoignez une équipe qui construit le système d'exploitation alimenté par l'IA pour le commerce mondial.",
      stats: {
        openPositions: "Postes Ouverts",
        countries: "Pays",
        industryVerticals: "Secteurs d'Activité",
        departmentsHiring: "Départements qui Recrutent"
      },
      openPositionsByDept: "Postes Ouverts par Département",
      departments: {
        sales: {
          name: "Ventes et Distribution",
          desc: "Générez des revenus sur plus de 40 marchés. Gestion de territoire, comptes clés, relations distributeurs."
        },
        supplyChain: {
          name: "Chaîne d'Approvisionnement et Logistique",
          desc: "Chaîne d'approvisionnement de bout en bout de l'usine au rayon. Gestion de flotte, entreposage, livraison du dernier kilomètre."
        },
        technology: {
          name: "Technologie et IA",
          desc: "Construisez Harvics OS — notre plateforme d'entreprise alimentée par l'IA. Full-stack, ingénierie ML, science des données."
        },
        finance: {
          name: "Finance et Trésorerie",
          desc: "Trésorerie multi-devises, financement du commerce, paiements numériques HPay, gestion FX dans toutes les régions."
        },
        procurement: {
          name: "Achats et Approvisionnement",
          desc: "Approvisionnement mondial depuis plus de 15 pays d'origine. Audits de fournisseurs, contrôle qualité, programmes directs usine."
        },
        hr: {
          name: "Ressources Humaines",
          desc: "Acquisition de talents, L&D, gestion de la performance dans diverses géographies et cultures."
        },
        legal: {
          name: "Juridique et Conformité",
          desc: "Conformité commerciale, filtrage des sanctions, protection de la PI, gestion des contrats dans les juridictions."
        },
        marketing: {
          name: "Marketing et Marque",
          desc: "Campagnes multilingues, contenu en 38 langues, marketing digital, stratégie de marque pour 10 secteurs."
        }
      },
      roles: "postes",
      whyHarvics: "Pourquoi Harvics",
      benefits: {
        globalMobility: {
          title: "Mobilité Mondiale",
          desc: "Travaillez à Dubaï, Londres, Karachi, Lahore et plus de 40 marchés"
        },
        growthTrack: {
          title: "Parcours de Croissance",
          desc: "Progression de carrière accélérée dans une entreprise en expansion"
        },
        aiCulture: {
          title: "Culture IA-Première",
          desc: "Travaillez avec une IA de pointe et des systèmes d'intelligence en temps réel"
        },
        competitivePackage: {
          title: "Package Compétitif",
          desc: "Rémunération leader du marché, logement et avantages"
        },
        learningBudget: {
          title: "Budget Formation",
          desc: "Budget de développement annuel pour cours, conférences et certifications"
        },
        flexibleWork: {
          title: "Travail Flexible",
          desc: "Arrangements hybrides avec bureaux hub régionaux dans le monde entier"
        }
      }
    },
    strategy: {
      title: "Notre Stratégie",
      pageTitle: "Stratégie | Harvics",
      description: "Construire un avenir durable par l'innovation et l'excellence",
      heroSubtitle: "Construire un avenir durable par l'innovation et l'excellence",
      pillars: {
        globalExpansion: {
          title: "Expansion Mondiale",
          desc: "Étendre notre présence sur les marchés émergents tout en renforçant notre position sur les marchés établis"
        },
        productInnovation: {
          title: "Innovation Produit",
          desc: "Investir dans la R&D pour développer de nouveaux produits répondant aux préférences évolutives des consommateurs"
        },
        sustainability: {
          title: "Durabilité",
          desc: "Engagés dans des pratiques durables dans toute notre chaîne d'approvisionnement et nos opérations"
        },
        digitalTransformation: {
          title: "Transformation Digitale",
          desc: "Tirer parti de la technologie pour améliorer l'expérience client et l'efficacité opérationnelle"
        }
      },
      vision: {
        title: "Notre Vision",
        desc: "Être la première entreprise mondiale de biens de consommation premium, reconnue pour la qualité, l'innovation et la durabilité."
      }
    }
  }
};

// Function to deep merge objects
function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// Get list of all locale files
const localeFiles = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));

console.log(`Found ${localeFiles.length} locale files`);

// Process each locale
localeFiles.forEach(file => {
  const locale = file.replace('.json', '');
  const filePath = path.join(LOCALES_DIR, file);
  
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Get translations for this locale, fallback to English
    const translations = newTranslations[locale] || newTranslations['en'];
    
    // Merge new translations
    deepMerge(content, translations);
    
    // Write back
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    
    console.log(`✅ Updated ${file} with static page translations`);
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n✅ All locale files updated with media, careers, and strategy translations!');
