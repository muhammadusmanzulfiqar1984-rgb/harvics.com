import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import {
  Volume2,
  VolumeX,
  Globe,
  ChevronRight,
  Calculator,
  Shield,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  Check,
  FileText,
  Layers,
  Lock,
  X,
  ExternalLink,
  Maximize2,
  Sun,
  Moon,
  Compass,
  MessageSquare,
  Briefcase,
  MapPin,
  Building2,
  TrendingUp,
  User,
  Clock,
  Sparkles,
  Coffee,
  Activity,
  Tv,
  Utensils,
  UserCheck,
  Smile,
  Loader2,
  Mic,
  Play,
  Square
} from "lucide-react";

import MonolithViewer3D from "./components/MonolithViewer3D";

// Bilingual Copy Dictionary (English and Urdu)
// Handcrafted with McKinsey brand voice and IDEO user empathy

const ASSET = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

const TRANSLATIONS = {
  en: {
    brand: "Tabraiz Town",
    brandSubtitle: "Rahim Yar Khan",
    explore: "Explore the Vision",
    visionHeader: "01 / 07 — THE PIVOT",
    visionTitle: "A Demographic Shift in Southern Punjab",
    visionBody: "Throughout history, civilization has chosen the desert to build its future. Dubai redefined the coastline of the Gulf. Tabraiz Town now redefines the trajectory of Southern Punjab. This is not an expansion of Rahim Yar Khan. It is its arrival on the global architectural stage.",
    visionQuote: "We do not build to accommodate horizontal expansion; we sculpt vertical modern monuments to shelter generational legacy.",
    archHeader: "02 / 07 — ARCHITECTURE",
    archTitle: "The Vertical Monolith",
    archBody: "A 30-Kanal vertical mixed-use ecosystem designed not as a contradiction to the arid Cholistan terrain, but as its mathematical, structural conclusion. High-contrast monolithic grids integrated with open-air garden buffers.",
    archViewDrawings: "Request Technical Elevation Drawings",
    materialHeader: "03 / 07 — MATERIALITY",
    materialTitle: "Travertine meets Champagne Steel",
    materialBody: "We remove the noise of the external world to cultivate something infinitely rarer: absolute sensory silence. Space defined entirely by absence, pure light, and natural density.",
    configHeader: "04 / 07 — CONFIGURATIONS & ADD-ONS",
    configTitle: "Furnished Parity & Bespoke Add-ons",
    alliancesHeader: "05 / 07 — STRATEGIC ALLIANCES",
    alliancesTitle: "Sovereign Infrastructure & Financial Partners",
    investmentHeader: "06 / 07 — STRATEGIC METRICS",
    investmentTitle: "Macroeconomic Underwriting Portfolio",
    investmentBody: "Southern Punjab is witnessing a major consolidation of agricultural capital. Family enterprises are reallocating reserves into secure, high-density real assets. Our 14.2% ARR projection represents structured asset optimization.",
    signatureHeader: "07 / 07 — THE SIGNATURE",
    signatureTitle: "A Permanent Mark on the Horizon",
    signatureBody: "Choosing Tabraiz Town is not an acquisition. It is a permanent signature on the horizon of Punjab—a physical, enduring statement of status, foresight, and sovereign legacy.",
    registryTitle: "Private Registry Portal",
    registrySubtitle: "CREDENTIALS VERIFICATION REQUIRED FOR EXECUTIVE DOSSIER",
    registryPlaceholder: "Enter Your Identity or Corporate Email Address",
    registryButton: "Submit Verification Request",
    registryDiscretion: "Our representative will contact your office with absolute discretion.",
    calculatorTitle: "Interactive Underwriting Simulator",
    calculatorDesc: "Model your generational capital allocation and calculate localized compound yield metrics.",
    unitSize: "Asset Scale Selection",
    horizon: "Holding Period",
    fundingSource: "Capital Category",
    projectedYield: "Projected ARR (Annualized Rate of Return)",
    accumulatedValue: "Generational Asset Valuation",
    compareStandard: "Premium over Conventional Real Estate",
    ambientAudio: "Ambient Soundscapes",
    themeLabel: "Visual Spectrum",
    soundOn: "Ambient Drone Enabled",
    soundOff: "Silence Interface"
  },
  ur: {
    brand: "تبریز ٹاؤن",
    brandSubtitle: "رحیم یار خان",
    explore: "وژن کا مشاہدہ کریں",
    visionHeader: "01 / 07 — وژن اور سمت",
    visionTitle: "جنوبی پنجاب کا سب سے بڑا عمرانی انقلاب",
    visionBody: "پوری تاریخ میں، انسانی تہذیب نے اپنا مستقبل سنوارنے کے لیے صحرا کا انتخاب کیا ہے۔ جس طرح دبئی نے خلیج کی ساحلی پٹی کو نئی زندگی دی، اسی طرح تبریز ٹاؤن جنوبی پنجاب کی تقدیر بدلنے جا رہا ہے۔ یہ رحیم یار خان کی محض ایک روایتی توسیع نہیں ہے، بلکہ عالمی تعمیراتی افق پر اس کا تاریخی عروج ہے۔",
    visionQuote: "ہم عارضی افقی پھیلاؤ کے لیے تعمیر نہیں کرتے؛ ہم نسلوں کے تحفظ اور وقار کے لیے بلند پایہ عمودی یادگاریں تراشتے ہیں۔",
    archHeader: "02 / 07 — طرزِ تعمیر",
    archTitle: "عمودی سنگِ میل",
    archBody: "۳۰ کنال رقبے پر محیط ایک ایسا مربوط اور جدید ترین عمودی نظام جو صحرائے چولستان کی مٹی اور تپش کے تضاد میں نہیں، بلکہ اس کی سائنسی اور ریاضیاتی ہم آہنگی میں تیار کیا گیا ہے۔",
    archViewDrawings: "تکنیکی تعمیراتی نقشہ جات کی درخواست کریں",
    materialHeader: "03 / 07 — مادی حسن",
    materialTitle: "تراورٹائن اور شیمپین اسٹیل کا ملاپ",
    materialBody: "ہم بیرونی دنیا کے شور کو مٹا کر ایک انتہائی نایاب تحفہ پیش کرتے ہیں: مطلق حسی سکون۔ ایک ایسی جگہ جو مادی کثافت، قدرتی روشنی اور مکمل خاموشی سے عبارت ہے۔",
    configHeader: "04 / 07 — سوئٹ کنفیگریشنز",
    configTitle: "فرنشڈ بمقابلہ غیر فرنشڈ اور ایڈ آنز",
    alliancesHeader: "05 / 07 — اسٹریٹجک الائنسز",
    alliancesTitle: "بنیادی ڈھانچے اور مالیاتی شراکت دار",
    investmentHeader: "06 / 07 — سرمایہ کاری کی فراست",
    investmentTitle: "میکرو اکنامک سرمایہ کاری کی فہم و فراست",
    investmentBody: "جنوبی پنجاب کے زرعی اور صنعتی خاندانوں کا سرمایہ اب تیزی سے محفوظ اور جدید اثاثوں کی طرف منتقل ہو رہا ہے۔ ہمارا ۱۴.۲٪ سالانہ متوقع منافع اسی زبردست معاشی لہر کی ترجمانی کرتا ہے۔",
    signatureHeader: "07 / 07 — افق کا نشان",
    signatureTitle: "افقِ پنجاب پر ایک مستقل دستخط",
    signatureBody: "تبریز ٹاؤن میں شمولیت محض جائیداد کی خریداری نہیں ہے۔ یہ پنجاب کے افق پر آپ کا دائمی دستخط ہے—ایک ایسا مادی ثبوت جو آپ کی دور اندیشی، اثر و رسوخ اور خاندانی وقار کا ترجمان ہے۔",
    registryTitle: "خصوصی رجسٹریشن پورٹل",
    registrySubtitle: "خصوصی دستاویزات تک رسائی کے لیے شناخت کی تصدیق لازمی ہے",
    registryPlaceholder: "اپنی شناخت یا کارپوریٹ ای ای میل درج کریں",
    registryButton: "شناخت کی تصدیق کی درخواست ارسال کریں",
    registryDiscretion: "ہمارا نمائندہ آپ کے دفتر سے انتہائی رازداری کے ساتھ رابطہ کرے گا۔",
    calculatorTitle: "سرمایہ کاری کا سیمولیٹر",
    calculatorDesc: "اپنے طویل مدتی سرمائے کا تخمینہ لگائیں اور جنوبی پنجاب کی معاشی صلاحیت کا حساب لگائیں۔",
    unitSize: "اثاثہ کا حجم",
    horizon: "سرمایہ کاری کی مدت",
    fundingSource: "سرمائے کا ذریعہ",
    projectedYield: "سالانہ متوقع شرحِ منافع (ARR)",
    accumulatedValue: "متوقع نسل در نسل اثاثہ کی مالیت",
    compareStandard: "روایتی رئیل اسٹیٹ سے زائد منافع",
    ambientAudio: "فضائل موسیقی",
    themeLabel: "بصری موڈ",
    soundOn: "موسیقی فعال ہے",
    soundOff: "خاموشی"
  },
  ar: {
    brand: "مدينة تبريز",
    brandSubtitle: "رحيم يار خان",
    explore: "استكشف الرؤية",
    visionHeader: "01 / 07 — التحول الديموغرافي",
    visionTitle: "تحول ديموغرافي في جنوب البنجاب",
    visionBody: "عبر التاريخ، اختارت الحضارة الصحراء لبناء مستقبلها. أعادت دبي صياغة ساحل الخليج. والآن تعيد مدينة تبريز صياغة مسار جنوب البنجاب. هذا ليس توسعاً لرحيم يار خان، بل هو وصولها إلى الساحة المعمارية العالمية.",
    visionQuote: "نحن لا نبني لاستيعاب التوسع الأفقي؛ بل ننحت نصبًا تذكارية عمودية حديثة لحماية الإرث الجيلي.",
    archHeader: "02 / 07 — الهندسة المعمارية",
    archTitle: "الكتلة العمودية المغليثية",
    archBody: "نظام بيئي عمودي متعدد الاستخدامات بمساحة 30 قنال تم تصميته ليس كتعارض مع تضاريس كوليستان الجافة، بل كنتيجة رياضية وهيكلية لها. شبكات مغليثية عالية التباين متكاملة مع حدائق مفتوحة.",
    archViewDrawings: "طلب رسومات الارتفاع الفنية",
    materialHeader: "03 / 07 — المادية",
    materialTitle: "الترافرتين يلتقي بالصلب الشامباني",
    materialBody: "نزيل ضوضاء العالم الخارجي لنزرع شيئاً نادراً للغاية: الصمت الحسي المطلق. مساحة محددة بالكامل بالغياب، والضوء النقي، والكثافة الطبيعية.",
    configHeader: "04 / 07 — التكوينات والإضافات",
    configTitle: "التأثيش الكامل والإضافات المخصصة",
    alliancesHeader: "05 / 07 — التحالفات الاستراتيجية",
    alliancesTitle: "البنية التحتية السيادية والشركاء الماليين",
    investmentHeader: "06 / 07 — المقاييس الاستراتيجية",
    investmentTitle: "محفظة الاكتتاب للاقتصاد الكلي",
    investmentBody: "يشهد جنوب البنجاب توطيداً كبيراً لرأس المال الزراعي. تعيد الشركات العائلية تخصيص احتياطياتها في أصول حقيقية آمنة وعالية الكثافة. تعكس توقعاتنا للعائد البالغ 14.2% تحسيناً مهيكلاً للأصول.",
    signatureHeader: "07 / 07 — التوقيع",
    signatureTitle: "بصمة دائمة على الأفق",
    signatureBody: "اختيار مدينة تبريز ليس مجرد استحواذ. إنه توقيع دائم على أفق البنجاب - تعبير مادي دائم عن المكانة والبصيرة والإرث السيادي.",
    registryTitle: "بوابة السجل الخاص",
    registrySubtitle: "مطلوب التحقق من أوراق الاعتماد للملف التنفيذي",
    registryPlaceholder: "أدخل هويتك أو البريد الإلكتروني للمؤسسة",
    registryButton: "تقديم طلب التحقق",
    registryDiscretion: "سيتصل مندوبنا بمكتبكم بمنتهى السرية والخصوصية.",
    calculatorTitle: "محاكي الاكتتاب التفاعلي",
    calculatorDesc: "نمذجة تخصيص رأس المال الجيلي وحساب مقاييس العائد المركب المحلي.",
    unitSize: "اختيار حجم الأصول",
    horizon: "فترة الاحتفاظ",
    fundingSource: "فئة رأس المال",
    projectedYield: "العائد السنوي المتوقع (ARR)",
    accumulatedValue: "تقييم الأصول الجيلية",
    compareStandard: "علاوة على العقارات التقليدية",
    ambientAudio: "المؤثرات الصوتية المحيطة",
    themeLabel: "طيف الألوان البصرية",
    soundOn: "تمكين الصوت المحيطي",
    soundOff: "كتم واجهة الصوت"
  },
  zh: {
    brand: "塔布雷斯新城",
    brandSubtitle: "拉希姆亚尔汗",
    explore: "探索未来愿景",
    visionHeader: "01 / 07 — 人口结构转型",
    visionTitle: "旁遮普省南部的时代变革",
    visionBody: "纵观历史，人类文明曾屡次选择荒漠筑造未来。迪拜重塑了海湾之滨；而今，塔布雷斯新城正重新定义旁遮普省南部的经济轨迹。这绝非拉希姆亚尔汗市的常规扩张，而是其在国际建筑舞台上的全新瞩目登场。",
    visionQuote: "我们并非为了迎合横向扩张而建，而是精雕细琢垂直的现代化纪念碑，以守护世代传承的显赫家业。",
    archHeader: "02 / 07 — 建筑美学",
    archTitle: "垂直巨石建筑群",
    archBody: "这是一座占地30卡纳尔（Kanal）的垂直多功能生态系统。它的设计设计并不是为了对抗干旱的科利斯坦荒漠，而是作为其数学与结构上的终极延伸。高对比度的一体化网格设计，与错落有致的露天花园缓冲区完美融合。",
    archViewDrawings: "索取技术立面设计图纸",
    materialHeader: "03 / 07 — 材质之魂",
    materialTitle: "洞石与香槟金钢材的融汇",
    materialBody: "我们隔绝尘世纷扰，只为培育一种无上珍贵的境界：绝对感官沉静。空间由极简留白、纯净光线和天然材质密度共同定义。",
    configHeader: "04 / 07 — 套房配置与豪华加装",
    configTitle: "精装配置与专属定制加装",
    alliancesHeader: "05 / 07 — 战略联盟",
    alliancesTitle: "主权基础设施与金融战略伙伴",
    investmentHeader: "06 / 07 — 战略指标评估",
    investmentTitle: "宏观经济承销分析组合",
    investmentBody: "旁遮普省南部正经历农业资本的重大重组与整合。众多家族企业正将备用金重新配置到安全、高密度的优质实物资产中。我们预计的14.2% ARR（年化收益率）代表了高度优化的资产配置策略。",
    signatureHeader: "07 / 07 — 世代徽章",
    signatureTitle: "屹立于地平线上的永久印记",
    signatureBody: "选择塔布雷斯新城，不仅是一次资产配置，更是您在旁遮普省大地上刻下的专属世代徽记——一份彰显显赫地位、宏大远见和主权传承的永恒实体宣言。",
    registryTitle: "专属私人注册门户",
    registrySubtitle: "查阅高管机密卷宗需进行身份验证",
    registryPlaceholder: "请输入您的身份或企业电子邮箱",
    registryButton: "提交验证申请",
    registryDiscretion: "我们的代表将以极高的保密规格，与您的专属办公室取得联系。",
    calculatorTitle: "交互式承销模拟器",
    calculatorDesc: "模拟您的家族世代资本分配方案，并精准测算本地化复利收益指标。",
    unitSize: "资产规模选择",
    horizon: "持有期限",
    fundingSource: "资本类型",
    projectedYield: "预期年化收益率 (ARR)",
    accumulatedValue: "世代资产总估值",
    compareStandard: "相较传统房地产的溢价溢出",
    ambientAudio: "环境背景声效",
    themeLabel: "视觉光谱模式",
    soundOn: "开启氛围环境音",
    soundOff: "静音界面"
  },
  es: {
    brand: "Tabraiz Town",
    brandSubtitle: "Rahim Yar Khan",
    explore: "Explore la Visión",
    visionHeader: "01 / 07 — El Cambio Demográfico",
    visionTitle: "Un Giro Demográfico en el Sur del Punjab",
    visionBody: "A lo largo de la historia, las civilizaciones han elegido el desierto para erigir su porvenir. Dubái redefinió el litoral del Golfo. Tabraiz Town redefine ahora la trayectoria del sur del Punjab. Esto no es una mera expansión de Rahim Yar Khan. Es su consagración en el panorama arquitectónico mundial.",
    visionQuote: "No construimos para albergar un crecimiento horizontal; esculpimos monumentos verticales modernos para proteger legados generacionales.",
    archHeader: "02 / 07 — Arquitectura",
    archTitle: "El Monolito Vertical",
    archBody: "Un ecosistema vertical de usos múltiples de 30 Kanals concebido no como contradicción al terreno árido de Cholistán, sino como su conclusión matemática y estructural. Retículas monolíticas de alto contraste integradas con amortiguadores de jardines al aire libre.",
    archViewDrawings: "Solicitar Planos Técnicos de Elevación",
    materialHeader: "03 / 07 — Materialidad",
    materialTitle: "Travertino y Acero Champagne",
    materialBody: "Disipamos el ruido del mundo exterior para cultivar algo infinitamente más valioso: el silencio sensorial absoluto. Espacio definido enteramente por la ausencia, la luz pura y la densidad natural.",
    configHeader: "04 / 07 — Configuraciones e Adiciones",
    configTitle: "Paridad Amueblada y Adiciones a la Medida",
    alliancesHeader: "05 / 07 — Alianzas Estratégicas",
    alliancesTitle: "Infraestructura Soberana y Socios Financieros",
    investmentHeader: "06 / 07 — Métricas Estratégicas",
    investmentTitle: "Portafolio de Suscripción Macroeconómica",
    investmentBody: "El sur de Punjab está presenciando una gran consolidación del capital agrícola. Las empresas familiares están reasignando reservas hacia activos reales seguros y de alta densidad. Nuestra proyección del 14.2% ARR representa una optimización estructurada de activos.",
    signatureHeader: "07 / 07 — La Firma",
    signatureTitle: "Una Huella Permanente en el Horizonte",
    signatureBody: "Elegir Tabraiz Town no es una adquisición ordinaria. Es una firma permanente en el horizonte de Punjab: una declaración física y perdurable de estatus, previsión y legado soberano.",
    registryTitle: "Portal de Registro Privado",
    registrySubtitle: "VERIFICACIÓN DE CREDENCIALES REQUERIDA PARA DOSSIER EJECUTIVO",
    registryPlaceholder: "Ingrese su Identidad o Correo Corporativo",
    registryButton: "Enviar Solicitud de Verificación",
    registryDiscretion: "Nuestro representante se pondrá en contacto con su oficina con absoluta discreción.",
    calculatorTitle: "Simulador Interactivo de Suscripción",
    calculatorDesc: "Modele su asignación de capital generacional y calcule métricas de rendimiento compuesto locales.",
    unitSize: "Selección de Escala de Activos",
    horizon: "Período de Retención",
    fundingSource: "Categoría de Capital",
    projectedYield: "Rendimiento Anualizado Proyectado (ARR)",
    accumulatedValue: "Valuación de Activos Generacionales",
    compareStandard: "Prima sobre Bienes Raíces Convencionales",
    ambientAudio: "Paisajes Sonoros Ambientales",
    themeLabel: "Espectro Visual",
    soundOn: "Zumbido Ambiental Activado",
    soundOff: "Silenciar Interfaz"
  },
  sk: {
    brand: "تبریز ٹاؤن",
    brandSubtitle: "رحیم یار خان",
    explore: "منصوبہ دیکھو",
    visionHeader: "01 / 07 — نویں سمت",
    visionTitle: "سرائیکی وسیب دا نواں تعمیری فخر",
    visionBody: "تاریخ گواہ ہے کہ جݙاں وی ترقی تھئی ہے، ریگستاناں وچ تھئی ہے۔ دبئی سمندر دے کنارے کوں بدل ݙتا۔ ہݨ تبریز ٹاؤن رحیم یار خان کوں پوری دنیا وچ نویں سنجاݨ ݙیسی۔ اے صرف ہک ٹاؤن کائنی، اے اساݙی ترقی دا نواں باب ہے۔",
    visionQuote: "اساں کچے تے پھیلے ہوئے مکان کائنی بݨیندے، اساں نسلیں واسطے پکے تے اچے محل نما مینار بݨیندے پئے ہائیں۔",
    archHeader: "02 / 07 — فنِ تعمیر",
    archTitle: "اچا تے پکا تعمیری شاہکار",
    archBody: "۳۰ کنال تے پھیلا ہویا اے جدید عمودی منصوبہ چولستان دی مٹی نال جڑیا ہویا ریاضی تے سائنس دا ہک انوکھا تال میل ہے۔",
    archViewDrawings: "عمارت دا نقشہ منگواؤ",
    materialHeader: "03 / 07 — مادی حسن",
    materialTitle: "تراورٹائن قدرتی پتھر تے شیمپین اسٹیل",
    materialBody: "اساں ہر قسم دے شور کوں مکا کر ہک نویں دنیا پیش کریندے پئے ہیں جتھاں سکون تے خاموشی اساݙی سنجاݨ ہوسی۔",
    configHeader: "04 / 07 — فلور پلانز",
    configTitle: "فرنشڈ مکانات تے جدید سہولیات",
    alliancesHeader: "05 / 07 — شراکت دار",
    alliancesTitle: "پکے تعمیری تے مالیاتی الائنس",
    investmentHeader: "06 / 07 — معاشی فائدہ",
    investmentTitle: "سرمایہ کاری دی فہم تے سالانہ منافع",
    investmentBody: "سرائیکی وسیب دے وݙے زمیندار تے خاندان ہݨ اپنا سرمایہ پکے تے محفوظ اثاثیاں وچ لیندے پئے ہن۔ اساݙا سالانہ ۱۴.۲٪ منافع ایں سچی معاشی ترقی دا گواہ ہے۔",
    signatureHeader: "07 / 07 — وسیب دا فخر",
    signatureTitle: "پنجاب دے افق تے مستقل دستخط",
    signatureBody: "تبریز ٹاؤن وچ سرمایہ کاری کوئی عام سودا کائنی۔ اے تہاݙی آوݨ آلی نسلیں واسطے ہک پکا فخر تے دائمی سنجاݨ ہے۔",
    registryTitle: "پرائیویٹ رجسٹریشن پورٹل",
    registrySubtitle: "رجسٹریشن واسطے شناخت دی تصدیق لازمی ہے",
    registryPlaceholder: "اپݨی شناختی ای میل درج کرو",
    registryButton: "تصدیق دی درخواست بھیجو",
    registryDiscretion: "اساݙا نمائندہ تہاݙے نال پوری رازداری نال رابطہ کریسی۔",
    calculatorTitle: "سرمایہ کاری دا حساب کتاب",
    calculatorDesc: "اپݨے سرمائے دا حساب لاؤ تے سالانہ منافع دا گراف دیکھو۔",
    unitSize: "اثاثے دا سائز",
    horizon: "سرمایہ کاری دا وقت",
    fundingSource: "سرمائے دا ذریعہ",
    projectedYield: "سالانہ منافع (ARR)",
    accumulatedValue: "نسل در نسل اثاثے دی مالیت",
    compareStandard: "عام رئیل اسٹیٹ توں زیادہ فائدہ",
    ambientAudio: "فضائی موسیقی",
    themeLabel: "بصری رنگ",
    soundOn: "موسیقی آن ہے",
    soundOff: "خاموشی"
  }
};

// High-fidelity architectural blocks data for the 3D Site Plan Map
const BLOCKS_DATA = {
  alpha: {
    id: "alpha" as const,
    name: {
      en: "Block Alpha: The Royal Pavilion",
      ur: "بلاک الفا: رائل پویلین",
      ar: "بلوك ألفا: الجناح الملكي",
      zh: "A 区：皇家阁楼",
      es: "Bloque Alpha: El Pabellón Real",
      sk: "بلاک الفا: رائل پویلین"
    },
    status: {
      en: "92% Reserved — Extremely Limited",
      ur: "۹۲ فیصد بکنگ — شدید کمیاب",
      ar: "تم حجز 92٪ - محدود للغاية",
      zh: "92% 已预订 — 极度稀缺",
      es: "92% Reservado — Extremadamente Limitado",
      sk: "۹۲٪ بکنگ — آخری موقع"
    },
    floors: 36,
    coordinates: "LAT 28.4214° N / NW Zone",
    yield: "14.6% ARR",
    priceRange: "5.5 — 18 Crore PKR",
    units: {
      en: ["Presidential Duplex Suites", "The Sovereign Grand Penthouse", "Executive Double-Height Lofts"],
      ur: ["پریزیڈنشیل ڈوپلیکس سوئٹس", "دی سوورین گرینڈ پینٹ ہاؤس", "ایگزیکٹو ڈبل ہائٹ لوفٹس"],
      ar: ["أجنحة دوبلكس رئاسية", "البنتهاوس السيادي الكبير", "لوفت تنفيذي مزدوج الارتفاع"],
      zh: ["总统复式套房", "主权大平层顶楼公寓", "双倍高度行政LOFT"],
      es: ["Suites Dúplex Presidenciales", "El Súper Penthouse Soberano", "Lofts Ejecutivos de Doble Altura"],
      sk: ["صدارتی ڈوپلیکس مکان", "شاہی پینٹ ہاؤس", "ایگزیکٹو ڈبل ہائٹ لوفٹس"]
    },
    desc: {
      en: "The absolute crown jewel of Tabraiz Town. Housing the local sovereign wealth holders, Block Alpha offers private-elevator lobbies, double-height visual windows, and dynamic desert-horizon passive cooling cavities. Each residence has a dedicated 14.6% projected ARR underwritten by McKinsey frameworks.",
      ur: "تبریز ٹاؤن کا سب سے قیمتی اور معتبر حصہ۔ مقامی امراء اور خاندانوں کے لیے مخصوص، اس بلاک میں پرائیویٹ لفٹ، ڈبل اونچائی کے شیشے، اور گرمی سے بچانے والی قدرتی گہرائی موجود ہے۔",
      ar: "جوهرة التاج في مدينة تبريز. يضم ملوك الثروة السيادية المحلية، ويوفر ردهات مصاعد خاصة، ونوافذ بصرية مزدوجة الارتفاع، وتجاويف تبريد سلبية.",
      zh: "塔布雷斯新城当之无愧的皇冠明珠。A 区专为当地显贵阶层定制，提供私人独占电梯厅、双层挑高景观幕墙及应对沙漠气候的被动式对流散热腔。在麦肯锡框架承销下，每套住宅均拥有 14.6% 的高ARR预期回报。",
      es: "La joya absoluta de la corona de Tabraiz Town. Albergando a los tenedores de riqueza soberana local, el Bloque Alpha ofrece vestíbulos de ascensor privados, ventanas visuales de doble altura y cavidades de enfriamiento pasivo.",
      sk: "تبریز ٹاؤن دا سب توں سونا تے اچا ٹاور ہے۔ ایندے وچ وݙے رئیس تے سردار رہسن۔ ہر کمرے توں چولستان دا خوبصورت منظر نظر آندے تے سدھا لفٹ اندر آندی ہے۔"
    }
  },
  beta: {
    id: "beta" as const,
    name: {
      en: "Block Beta: The Obsidian Monolith",
      ur: "بلاک بیٹا: دی اوبسیڈین مونو لیتھ",
      ar: "بلوك بيتا: الصرح الأسود",
      zh: "B 区：黑曜石巨石塔",
      es: "Bloque Beta: El Monolito de Obsidiana",
      sk: "بلاک بیٹا: دی اوبسیڈین مونو لیتھ"
    },
    status: {
      en: "65% Reserved — Accepting Inquiries",
      ur: "۶۵ فیصد بکنگ — درخواستیں کھلی ہیں",
      ar: "تم حجز 65٪ - نرحب بالاستفسارات",
      zh: "65% 已预订 — 开放承销申请",
      es: "65% Reservado — Aceptando Consultas",
      sk: "۶۵٪ بکنگ — رجسٹریشن جاری ہے"
    },
    floors: 45,
    coordinates: "LAT 28.4218° N / East Gateway",
    yield: "15.2% ARR",
    priceRange: "7.2 — 24 Crore PKR",
    units: {
      en: ["Executive Corporate Chambers", "Sky Villas with Plunge Pools", "Multi-tier Co-working Atrium"],
      ur: ["ایگزیکٹو کارپوریٹ چیمبرز", "پانی کے تالاب والے اسکائی ولاز", "ملٹی ٹیر مشترکہ ہال"],
      ar: ["غرف الشركات التنفيذية", "فيلات معلقة مع حمامات سباحة", "أتريوم العمل المشترك متعدد المستويات"],
      zh: ["行政企业首脑官邸", "带私家泳池的空中别野", "多层共享式挑高大厅"],
      es: ["Cámaras Corporativas Ejecutivas", "Villas del Cielo con Piscinas de Inmersión", "Atrio de Co-working de Múltiples Niveles"],
      sk: ["کارپوریٹ چیمبرز ٹاور", "تالاب آلے خوبصورت ولاز", "بزنس کو ورکنگ ہال"]
    },
    desc: {
      en: "The financial command center of Rahim Yar Khan. Block Beta combines professional-grade enterprise chambers with sky villas, fully wired with satellite high-speed connections and sovereign-grade biometric access shields. Its towering 45-floor silhouette represents absolute vertical dominance.",
      ur: "رحیم یار خان کا معاشی اور مالیاتی مرکز۔ بلاک بیٹا جدید ترین کارپوریٹ دفاتر اور پرتعیش ولاز کا ایسا ملاپ ہے جس میں سیٹلائٹ انٹرنیٹ اور انتہائی جدید ترین سیکیورٹی کا انتظام ہے۔",
      ar: "مركز القيادة المالية في رحيم يار خان. يجمع بلوك بيتا بين غرف المؤسسات المهنية والفيلات المعلقة، مجهزة بالكامل باتصالات الأقمار الصناعية عالية السرعة.",
      zh: "拉希姆亚尔汗市的金融指挥总部。B 区将专业级企业智脑办公舱与空中墅居完美融合，配备专线低时延卫星高速连接，辅以最高级别的生物特征识别防御盾。其45层高耸入云的雄伟轮廓彰显绝对威严。",
      es: "El centro de comando financiero de Rahim Yar Khan. El Bloque Beta combina cámaras empresariales de grado profesional con villas en el cielo, totalmente cableadas con conexiones satelitales de alta velocidad.",
      sk: "رحیم یار خان دی معیشت تے بزنس دا وݙا ہیڈ کوارٹر۔ ایندے وچ کمپیوٹرائزڈ آفس تے پول آلے وݙے ولاز ہن۔ سب توں اچا ۴۵ منزلاں دا ٹاور ہے۔"
    }
  },
  gamma: {
    id: "gamma" as const,
    name: {
      en: "Block Gamma: Travertine Heights",
      ur: "بلاک گیما: تراورٹائن ہائٹس",
      ar: "بلوك غاما: مرتفعات الترافرتين",
      zh: "C 区：洞石极光高地",
      es: "Bloque Gamma: Alturas de Travertino",
      sk: "بلاک گیما: تراورٹائن ہائٹس"
    },
    status: {
      en: "40% Reserved — Strategic Booking Open",
      ur: "۴۰ فیصد بکنگ — بکنگ کھلی ہے",
      ar: "تم حجز 40٪ - الحجز الإستراتيجي مفتوح",
      zh: "40% 已预订 — 战略名额招募中",
      es: "40% Reservado — Reserva Estratégica Abierta",
      sk: "۴۰٪ بکنگ — رجسٹریشن اوپن ہے"
    },
    floors: 28,
    coordinates: "LAT 28.4208° N / South Promenade",
    yield: "13.9% ARR",
    priceRange: "4.2 — 12 Crore PKR",
    units: {
      en: ["Generational 3-Bed Lofts", "Wellness Triplex Apartments", "The Travertine Terrace Penthouses"],
      ur: ["نسل در نسل ۳ بیڈ لوفٹس", "ویلنس ٹرپلیکس اپارٹمنٹس", "تراورٹائن ٹیرس پینٹ ہاؤسز"],
      ar: ["لوفت عائلي ذو ٣ غرف", "شقق ثلاثية للياقة البدنية", "بنتهاوس شرفات الترافرتين"],
      zh: ["世代传承三居室LOFT", "健康理疗立体三复式公寓", "洞石露台顶层奢豪华居"],
      es: ["Lofts Generacionales de 3 Recámaras", "Apartamentos Triplex de Bienestar", "Penthouses con Terrazas de Travertino"],
      sk: ["نسلی ۳ بیڈ ولاز", "صحت مند ٹرپلیکس فلیٹس", "ٹیرس پینٹ ہاؤسز"]
    },
    desc: {
      en: "Designed for family longevity, Block Gamma is encased in 45cm natural Travertine cavities for optimum micro-thermal deflection. Residents enjoy dedicated private medical recovery lounges, salt-brick wellness rooms, and expansive outdoor garden patios that look directly onto the central water canal.",
      ur: "خاندانی بقا اور صحت کو مدنظر رکھتے ہوئے بنایا گیا بلاک گیما۔ اس کی دیواریں ۴۵ سینٹی میٹر موٹے تراورٹائن سے لیس ہیں جو گرمی کو مکمل روکتی ہیں۔ اس کی تعمیر میں اعلیٰ درجے کے ولاز اور ہیلتھ کلب کی بھرپور سہولیات ہیں۔",
      ar: "تم تصميمه لراحة وطول عمر العائلات، ويتميز بلوك غاما بجدران ترافرتين بسماكة 45 سم لحماية حرارية مثالية. يستمتع السكان بردهات طبية خاصة وغرف عافية.",
      zh: "C 区专为家族基业长青而设计。整座大楼采用 45 厘米厚天然孔隙洞石腔体包覆，以实现完美的被动式隔热微气候控制。住户尊享专属健康理疗会客厅、矿盐舒压呼吸室及可俯瞰中央御河景观的空中花园露台。",
      es: "Diseñado para la longevidad familiar, el Bloque Gamma está revestido en cavidades de travertino natural de 45 cm para una óptima deflexión microtérmica. Los residentes disfrutan de salones de recuperación médica privados.",
      sk: "صحت تے سکون دا مرکز۔ ایندی موٹی دیواریں گرمی توں بچیندن۔ ایندے وچ خاندانی فلیٹس تے خوبصورت ٹیرس بݨائے گئے ہن۔"
    }
  },
  delta: {
    id: "delta" as const,
    name: {
      en: "Block Delta: The Emerald Pavilion",
      ur: "بلاک ڈیلٹا: ایمرلڈ پویلین",
      ar: "بلوك دلتا: الجناح الزمردي",
      zh: "D 区：翡翠生活艺术馆",
      es: "Bloque Delta: El Pabellón Esmeralda",
      sk: "بلاک ڈیلٹا: ایمرلڈ پویلین"
    },
    status: {
      en: "Exclusive Charter — VIP Admission Only",
      ur: "خصوصی چارٹر — وی آئی پی رجسٹریشن لازمی",
      ar: "ميثاق حصري - قبول كبار الشخصيات فقط",
      zh: "私人专享特许权 — 仅限受邀贵宾 VIP",
      es: "Estatuto Exclusivo — Admisión VIP",
      sk: "رئیساں واسطے مخصوص — وی آئی پی داخلہ"
    },
    floors: 12,
    coordinates: "LAT 28.4210° N / Central Core",
    yield: "14.8% ARR",
    priceRange: "Special Institutional Underwriting",
    units: {
      en: ["The Diplomatic Lounge Suite", "Private Cinema Salon Suites", "The Central Wellness Sanctuary"],
      ur: ["سفارتی لاؤنج سوئٹ", "نجی سینما سیلون سوئٹس", "مرکزی صحت کا مرکز"],
      ar: ["أجنحة الصالون الدبلوماسي", "أجنحة صالون السينما الخاصة", "ملتقى العافية المركزي"],
      zh: ["外交使领私人会客厅", "专享私人家庭影院套房", "中央生命美学理疗馆"],
      es: ["La Suite del Salón Diplomático", "Suites de Salón de Cine Privado", "El Santuario de Bienestar Central"],
      sk: ["سفارتی لاؤنج سوئٹ", "ذاتی سینما ہال سوئٹس", "سنٹرل ہیلتھ کلب"]
    },
    desc: {
      en: "The lifestyle heart of Tabraiz Town. Housing our indoor climate-controlled rainforest, the Michelin-star dining salons, and a private 120-seat high-fidelity cinema lobby. Built with green living walls and an integrated cascading water oasis, Block Delta serves as the ultimate sensory recovery zone for our residents.",
      ur: "تبریز ٹاؤن کے شاہانہ لائف اسٹائل کا مرکز۔ اس بلاک میں انڈور واٹر فال، دنیا کے بہترین ریستوراں، اور ایک نجی ۱۲۰ نشستوں والا شاندار سینما ہال ہے جو یہاں کے رہائشیوں کو پرتعیش تفریح فراہم کرتا ہے۔",
      ar: "قلب نمط الحياة في مدينة تبريز. يضم الغابة المطيرة الداخلية المكيفة، وصالونات الطعام الحائزة على نجوم ميشلان، وصالة سينما خاصة فائقة الدقة تتسع لـ 120 مقعداً.",
      zh: "D 区是塔布雷斯新城的生活艺术中枢。内部建有全天候恒温雨林中庭、米其林星级私厨宴会厅及拥有120席高保真包厢的私人影院沙龙。翠绿的垂直生态植生墙与层叠水系交织，为住户打造极致的感官疗愈绿洲。",
      es: "El corazón del estilo de vida de Tabraiz Town. Alberga nuestra selva tropical interior climatizada, salones de cena Michelin y un vestíbulo de cine privado de alta fidelidad con 120 asientos.",
      sk: "شاہانہ زندگی تے تفریح دا گڑھ۔ ایندے وچ آبشار، دنیا دے بہترین کھانے تے نجی وی آئی پی سینما ہال بݨایا گیا ہے تاں کہ تساں دل کھول تے زندگی دا مزہ گھنو۔"
    }
  }
};

// High-resolution photo gallery metadata combining architectural renders and heritage sites
const GALLERY_ITEMS = [
  {
    image: ASSET("images/tabraiz_hero_courtyard_night.png"),
    category: { en: "Lifestyle & Promenade", ur: "طرزِ زندگی اور سیرگاہ", ar: "نمط الحياة والممشى", zh: "生活方式与中央步行街", es: "Estilo de Vida y Paseo", sk: "زندگی دا انداز تے سیرگاہ" },
    title: { en: "The Grand Courtyard at Twilight", ur: "مرکزی صحن بوقتِ شام", ar: "الفناء الكبير عند الغسق", zh: "暮色中的中央庭院", es: "El Gran Patio al Anochecer", sk: "شام ویلے مرکزی صحن" },
    desc: {
      en: "The palm-lined central promenade between the block pairs, culminating in the illuminated grand fountain — with glass sky-bridges linking the upper retail floors overhead.",
      ur: "بلاکس کے درمیان کھجوروں سے سجی مرکزی سیرگاہ جو روشن فوارے پر ختم ہوتی ہے، اور اوپر شیشے کے پل بلاکس کو آپس میں جوڑتے ہیں۔",
      ar: "الممشى المركزي المحاط بالنخيل بين الكتل، والذي يتوج بالنافورة الكبرى المضيئة، مع جسور زجاجية تربط الطوابق العليا.",
      zh: "棕榈成荫的中央步行街贯穿各街区，尽头是灯光璀璨的中央喷泉，上方的玻璃天桥将各栋零售楼层连为一体。",
      es: "El paseo central bordeado de palmeras entre los bloques, que culmina en la gran fuente iluminada, con puentes de cristal que conectan las plantas superiores.",
      sk: "بلاکاں دے وچکار کھجوراں نال سجی مرکزی سیرگاہ، جیڑی روشن فوارے تے مکدی ہے تے اُتے شیشے دے پل بلاکاں کوں جوڑیندے ہن۔"
    },
    credit: "Harvics Design Studio",
    aspect: "aspect-[16/10]"
  },
  {
    image: ASSET("images/tabraiz_town_exterior_1783295060059.jpg"),
    category: { en: "Architectural Render", ur: "تعمیری خاکہ", ar: "تصميم معماري", zh: "建筑立面渲染", es: "Render Arquitectónico", sk: "تعمیری خاکہ" },
    title: { en: "The Sovereign Vertical Monolith", ur: "عظیم عمودی ہیئت", ar: "الصرح العمودي السيادي", zh: "主权垂直巨石塔", es: "El Monolito Vertical Soberano", sk: "اچا تے پکا ٹاور" },
    desc: {
      en: "A cinematic representation of Tabraiz Town rising majestically against the Southern Punjab sky, showing the structural core, open gardens, and light-welcoming Travertine facades.",
      ur: "تبریز ٹاؤن کی ایک خوبصورت اور فلک بوس ہیئت جو جنوبی پنجاب کے افق پر ایستادہ ہے، جس میں باغیچے اور تراورٹائن کے ستون واضح ہیں۔",
      ar: "تمثيل سينمائي لبلدة تبريز وهي ترتفع بشكل مهيب ضد سماء جنوب البنجاب، لتظهر الهيكل الإنشائي والحدائق.",
      zh: "塔布雷斯新城矗立在旁遮普省南部的天际线，气势磅礴。该图展示了超高强度钢骨、悬挑露天绿化及极具美感的大面积孔洞石外墙。",
      es: "Una representación cinematográfica de Tabraiz Town elevándose majestuosamente contra el cielo del sur de Punjab, mostrando el núcleo estructural, los jardines abiertos y las fachadas de travertino.",
      sk: "چولستان دے افق تے ایستادہ تبریز ٹاؤن دی ہک خوبصورت تعمیری تصویر، جیندے وچ باغیچے تے جدید مادی کمال واضح ہن۔"
    },
    credit: "Harvics Design Studio",
    aspect: "aspect-[3/4]"
  },
  {
    image: ASSET("images/tabraiz_town_interior_1783295077820.jpg"),
    category: { en: "Interior Architecture", ur: "اندرونی فنِ تعمیر", ar: "العمارة الداخلية", zh: "室内空间美学", es: "Arquitectura de Interiores", sk: "اندرونی بناوٹ" },
    title: { en: "The Penthouse Living Sanctuary", ur: "عظیم رہائشی کمرہ", ar: "ملاذ المعيشة في البنتهاوس", zh: "空中大平层顶楼起居馆", es: "El Santuario Residencial del Penthouse", sk: "شاہی فلیٹ دا نقشہ" },
    desc: {
      en: "An absolute study in tactile minimalism and sensory silence, featuring full-height glass panels, custom-poured Travertine tables, and indirect ambient ceiling illumination.",
      ur: "اعلیٰ درجے کی پرسکون اور نفیس اندرونی ساخت، جس میں شیشے کی بڑی دیواریں اور خوبصورت تراورٹائن کا کام کیا گیا ہے۔",
      ar: "دراسة مطلقة في البساطة الملموسة والصمت الحسي، وتتميز بألواح زجاجية كاملة الارتفاع وطاولات ترافرتين.",
      zh: "感官极简与纯粹宁静的代名词。空间拥有通高双层中空落地玻璃幕墙、手工浇注一体成型洞石茶几，以及极具高级感的无主灯微温间接天花照明。",
      es: "Un estudio absoluto en minimalismo táctil y silencio sensorial, con paneles de vidrio de altura completa, mesas de travertino vertido a medida e iluminación indirecta.",
      sk: "اندرونی فرنیچر تے خوبصورت شیشے دا کم، جیڑا تہاݙی زندگی کوں پرسکون تے شاہانہ بݨیسی۔"
    },
    credit: "IDEO Paris Partner Lab",
    aspect: "aspect-[16/10]"
  },
  {
    image: ASSET("images/tabraiz_town_materiality_1783295095964.jpg"),
    category: { en: "Materiality & Detail", ur: "مادی خوبصورتی", ar: "المادية والتفاصيل", zh: "材料肌理与细部", es: "Materialidad y Detalle", sk: "مادی خوبصورتی" },
    title: { en: "Bespoke Travertine & Champagne-Metal Cavities", ur: "قدرتی تراورٹائن اور شیمپین اسٹیل", ar: "الترافرتين المخصص وتجاويف المعدن الشامباني", zh: "定制孔洞石与香槟金防晒隔栅", es: "Travertino y Cavidades Metálicas Champagne", sk: "تراورٹائن تے شیمپین اسٹیل" },
    desc: {
      en: "Macro photography of the natural, heat-deflecting Travertine limestone paired with anodized champagne-metal screens, establishing a golden ratio of physical and thermal isolation.",
      ur: "تراورٹائن پتھر اور شیمپین اسٹیل کی زبردست ہندسی ترکیب جو گرمی کو روکنے اور خوبصورتی برقرار رکھنے کا حتمی ثبوت ہے۔",
      ar: "تصوير ماكرو لحجر الترافرتين الجيري الطبيعي العاكس للحرارة والمقترن بشاشات معدنية بلون الشامبانيا.",
      zh: "高密度抗热天然孔洞石与阳极氧化香槟金铝质网格的微距特写。二者融合不仅创造了黄金分割的视觉质感，更构筑了完美的隔热和通风微气候。",
      es: "Macro fotografía de la piedra caliza travertino natural que desvía el calor combinada con pantallas de metal champagne anodizado, estableciendo una proporción áurea de aislamiento térmico.",
      sk: "تراورٹائن پتھر تے شیمپین دھاتی جالیاں دا مائیکرو فوٹو، جیڑا گرمی کوں دور رکھݨ دا سائنسی طریقہ ہے۔"
    },
    credit: "Material Labs Europe",
    aspect: "aspect-[1/1]"
  },
  {
    image: ASSET("images/bhong_mosque_artwork_1783303379214.jpg"),
    category: { en: "Heritage Photography", ur: "قدیم ورثہ", ar: "التراث التاريخي", zh: "世界遗产摄影", es: "Fotografía de Patrimonio", sk: "تاریخی ورثہ" },
    title: { en: "Bhong Mosque Mosaic Artistry", ur: "مسجد بھونگ کی خوبصورت کاشی کاری", ar: "فنيات الفسيفساء في مسجد بهونغ", zh: "博格清真寺极奢马赛克艺术", es: "Artesanía de Mosaicos de la Mezquita de Bhong", sk: "مسجد بھونگ دی کاشی کاری" },
    desc: {
      en: "The stunning 1932 masterpiece featuring gold-leaf calligraphy and intricate Islamic tilework, the geometric muse behind our facade patterns.",
      ur: "۱۹۳۲ کا وہ لافانی شاہکار جس میں خالص سونے اور خوبصورت ٹائلز کا کام ہے، جو ہمارے ہندسی ڈیزائن کی بنیاد ہے۔",
      ar: "التحفة الفنية المذهلة لعام 1932 التي تتميز بخط ورق الذهب وبلاط إسلامي معقد، الإلهام الهندسي لواجهتنا.",
      zh: "建于 1932 年的传奇建筑丰碑，以层叠复杂的伊斯兰手工彩瓷贴面与纯金箔书法雕刻闻名遐迩，这也是塔布雷斯新城几何网格屏风最纯粹的几何灵感缪斯。",
      es: "La impresionante obra maestra de 1932 que presenta caligrafía de pan de oro y azulejos islámicos intrincados, la musa geométrica detrás de nuestros patrones de fachada.",
      sk: "مسجد بھونگ دی سونے دی خطاطی تے خوبصورت اسلامی کاشی کاری دی تصویر، جیڑی اساݙے کلچر دا حصہ ہے۔"
    },
    credit: "Aga Khan Cultural Archive",
    aspect: "aspect-[4/5]"
  },
  {
    image: ASSET("images/derawar_fort_artwork_1783303399339.jpg"),
    category: { en: "Heritage Photography", ur: "قدیم ورثہ", ar: "التراث التاريخي", zh: "历史丰碑摄影", es: "Fotografía de Patrimonio", sk: "تاریخی ورثہ" },
    title: { en: "Derawar Fort Monolithic Bastions", ur: "قلعہ ڈراور کی مضبوطی", ar: "أبراج حصن ديراور المتجانسة", zh: "德拉瓦古堡四十座巨石碉堡", es: "Bastiones Monolíticos del Fuerte de Derawar", sk: "قلعہ ڈراور دے وݙے برج" },
    desc: {
      en: "Standing strong against the harsh sun of the Cholistan Desert since the 9th Century AD, our inspiration for monolithic security and passive cooling.",
      ur: "صحرائے چولستان میں نویں صدی سے ایستادہ قلعہ ڈراور، جو ہماری تھرمل سیکیورٹی اور بیرونی مضبوطی کا بڑا منبع ہے۔",
      ar: "يقف قوياً ضد الشمس القاسية لصحراء كوليستان منذ القرن التاسع الميلادي، وهو مصدر إلهامنا للأمان المتجانس.",
      zh: "自公元 9 世纪起便傲立于科利斯坦沙漠酷烈骄阳下的德拉瓦堡垒，雄浑壮丽。它是我们实现高厚度重力围护、防沙暴侵蚀及被动式物理降温的核心灵感来源。",
      es: "Manteniéndose firme contra el sol abrasador del desierto de Cholistán desde el siglo IX d.C., nuestra inspiración para la seguridad monolítica y el enfriamiento pasivo.",
      sk: "چولستان دے تپدے صحرا وچ ۹ ویں صدی توں کھڑا قلعہ ڈراور، جیڑا ساݙی طاقت تے بہادری دی سنجاݨ ہے۔"
    },
    credit: "Cholistan Archeological Survey",
    aspect: "aspect-[16/9]"
  },
  {
    image: ASSET("images/pattan_minara_artwork_1783303419463.jpg"),
    category: { en: "Heritage Photography", ur: "قدیم ورثہ", ar: "التراث التاريخي", zh: "考古遗址摄影", es: "Fotografía de Patrimonio", sk: "تاریخی ورثہ" },
    title: { en: "Pattan Minara Buddhist Tower", ur: "پتن منارا قدیم مینار", ar: "منارة باتان البوذية", zh: "帕坦古尖塔历史印记", es: "Torre Budista de Pattan Minara", sk: "پتن منارا قدیم مینار" },
    desc: {
      en: "A 2,000-year-old linear brick monument representing continuous human habitation, architectural resilience, and structural balance in Southern Punjab.",
      ur: "دریائے سندھ کے پرانے کنارے پر دو ہزار سال سے کھڑا مٹی کا خوبصورت مینار، جو غیر متزلزل استقامت کی داستان سناتا ہے۔",
      ar: "منارة قرميدية خطية عمرها 2000 عام تمثل الاستقرار البشري المستمر والمرونة الهيكلية في جنوب البنجاب.",
      zh: "坐落在印度河故道畔，拥有逾两千年历史的佛教时期砖石遗存。它那挺拔优雅的叠涩垂直中轴线，印证了旁遮普南部悠久绵延的人类文明及极致的工程结构稳定性。",
      es: "Un monumento de ladrillo lineal de 2,000 años de antigüedad que representa la habitación humana continua y la resiliencia estructural en el sur de Punjab.",
      sk: "دریا سندھ دے کنڈے تے ۲ ہزار سال پرݨا مٹی دا مینار، جیڑا طوفانیں دے سامنے قائم کھڑے۔"
    },
    credit: "UNESCO South Asia Digital Library",
    aspect: "aspect-[3/4]"
  }
];

const faqItems = [
  {
    categoryEn: "Investment Strategy",
    categoryUr: "سرمایہ کاری حکمتِ عملی",
    qEn: "What is the projected capital appreciation rate for Tabraiz Town?",
    qUr: "تبریز ٹاؤن میں سالانہ منافع (Appreciation) کی شرح کیا ہے؟",
    aEn: "Tabraiz Town is projected to compound at an Annualized Return Rate (ARR) of over 14%, significantly outperforming the conventional regional average of 11.0%. This is driven by Rahim Yar Khan's rapid vertical spatial integration and premium Travertine material spec choices.",
    aUr: "تبریز ٹاؤن میں سالانہ منافع کا تخمینہ 14 فیصد سے زائد ہے، جو روایتی اسکیموں کی 11 فیصد اوسط سے بہت زیادہ ہے۔ یہ غیر معمولی منافع اعلیٰ تعمیری مواد اور بہترین معاشی انتظام کی وجہ سے ممکن ہے۔"
  },
  {
    categoryEn: "Construction Standards",
    categoryUr: "تعمیراتی معیار",
    qEn: "What custom engineering standards are integrated to combat Cholistan's climate?",
    qUr: "چولستان کے گرم اور مرطوب موسم سے بچاؤ کے لیے کیا انتظامات ہیں؟",
    aEn: "Each vertical monolith utilizes ultra-high-strength, sulphate-resistant DG Khan cement, Grade-60 high-deformation steel rebars, and triple-glazed low-E glass partitioning to provide absolute seismic safety and internal temperature regulation under extreme solar heat.",
    aUr: "عمارتوں کی تیاری میں سلفیٹ ریزسٹنٹ بیسٹ وے/ڈی جی خان سیمنٹ، گریڈ 60 اسٹیل اور ٹرپل گلیزڈ تھرمل شیشے کا استعمال کیا گیا ہے، جو گرمی اور زلزلوں سے مکمل تحفظ فراہم کرتے ہیں۔"
  },
  {
    categoryEn: "Lifestyle & Amenities",
    categoryUr: "طرزِ زندگی اور سہولیات",
    qEn: "What exclusive community privileges are reserved for residents?",
    qUr: "رہائشیوں کے لیے کون سی خصوصی سہولیات فراہم کی گئی ہیں؟",
    aEn: "Sovereign residents enjoy lifetime access to high-concept leisure ecosystems including a Sky-Desert fine dining bistro on a floating cantilever deck, a Dolby Atmos 4K private viewing cinema, Sufi-inspired wellness thermal pools, Turkish hammams, and fully-supervised sensory childminding zones.",
    aUr: "رہائشیوں کے لیے اسکائی ریسٹورنٹ، ڈولبی سینما ہال، صوفی ویلنس اسپا، روایتی ترکی حمام اور بچوں کے کھیلنے اور سیکھنے کے جدید زونز بالکل مفت دستیاب ہیں۔"
  },
  {
    categoryEn: "Ownership & Sovereignty",
    categoryUr: "ملکیت اور سیکیورٹی",
    qEn: "How is absolute privacy and title security guaranteed?",
    qUr: "سیکیورٹی اور رازداری کو کس طرح یقینی بنایا گیا ہے؟",
    aEn: "Every unit transfer files are secured through automated digital registries under Harvic Global Ventures' dual sovereignty protocol. Additionally, round-the-clock physical security patrols, smart-grid optical surveillance, and secure private elevators guarantee perfect security and absolute quietness.",
    aUr: "ہماری بکنگ ڈیجیٹل لیجر اور ہارسز گلوبل وینچرز کے قانون کے تحت محفوظ ہے۔ اس کے علاوہ چوبیس گھنٹے سمارٹ سرویلنس اور پرائیویٹ لفٹ ہر رہائشی کو انتہائی محفوظ اور پرسکون ماحول مہیا کرتی ہے۔"
  }
];

interface TypewriterTextProps {
  text: string;
  onComplete?: () => void;
  speedMultiplier?: number;
}

function TypewriterText({ text, onComplete, speedMultiplier = 1 }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    setDisplayedText("");
    const words = text.split(" ");
    let timer: any;

    const typeWord = () => {
      if (index < words.length) {
        setDisplayedText((prev) => (prev ? prev + " " + words[index] : words[index]));
        index++;
        const word = words[index - 1] || "";
        let delay = 25 + Math.random() * 25; // 25-50ms per word
        if (word.endsWith(".") || word.endsWith(",") || word.endsWith("?") || word.endsWith("!")) {
          delay += 150; // brief pause on punctuation for organic rhythm
        }
        timer = setTimeout(typeWord, delay * speedMultiplier);
      } else {
        if (onComplete) onComplete();
      }
    };

    typeWord();

    return () => clearTimeout(timer);
  }, [text, speedMultiplier]);

  return <span className="whitespace-pre-line leading-relaxed">{displayedText}</span>;
}

export default function App() {
  const [lang, setLang] = useState<"en" | "ur" | "ar" | "zh" | "es" | "sk">("en");
  const [theme, setTheme] = useState<"graphite" | "ivory">("graphite");
  const [activeTab, setActiveTab] = useState<string>("vision");
  const [activePage, setActivePage] = useState<string>("overview");
  const [moodboardLifestyle, setMoodboardLifestyle] = useState<string>("diplomat");
  const [moodboardResult, setMoodboardResult] = useState<string | null>(null);
  const [isMoodboardLoading, setIsMoodboardLoading] = useState<boolean>(false);

  const PAGES = [
    { id: "overview", nameEn: "Sovereign Vision", nameUr: "عمرانیاتی وژن", shortEn: "Vision", shortUr: "وژن" },
    { id: "architecture", nameEn: "Architecture & Site-Plan", nameUr: "فنِ تعمیر", shortEn: "Architecture", shortUr: "فنِ تعمیر" },
    { id: "heritage", nameEn: "Heritage & Materials", nameUr: "تاریخی ورثہ", shortEn: "Heritage", shortUr: "ورثہ" },
    { id: "intelligence", nameEn: "AI Concierge Lounge", nameUr: "اے آئی دربان", shortEn: "Concierge", shortUr: "دربان" },
    { id: "configurations", nameEn: "Suite Configurations", nameUr: "فلور پلانز", shortEn: "Suites", shortUr: "سوئٹس" },
    { id: "metrics", nameEn: "McKinsey Underwriting", nameUr: "معاشی تحفظ", shortEn: "Underwriting", shortUr: "معاشی تحفظ" },
    { id: "registry", nameEn: "Private Registry", nameUr: "خاندانی رجسٹریشن", shortEn: "Registry", shortUr: "رجسٹری" }
  ];

  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState<boolean>(false);
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState<boolean>(false);

  // AI Plot/Suite Recommender states
  const [recBudget, setRecBudget] = useState<string>("PKR 50 Lakh - 1 Crore");
  const [recPurpose, setRecPurpose] = useState<string>("investment yield");
  const [recAssetType, setRecAssetType] = useState<string>("retail shop");
  const [recResult, setRecResult] = useState<string | null>(null);
  const [isRecLoading, setIsRecLoading] = useState<boolean>(false);

  // AI Lead qualification states
  const [leadBrief, setLeadBrief] = useState<string | null>(null);
  const [isLeadBriefLoading, setIsLeadBriefLoading] = useState<boolean>(false);

  // AI Suite visual generation states
  const [suiteVisual, setSuiteVisual] = useState<string | null>(null);
  const [isSuiteVisualLoading, setIsSuiteVisualLoading] = useState<boolean>(false);

  // Narrated tour states
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const tourCancelRef = useRef<boolean>(false);
  const [registryEmail, setRegistryEmail] = useState<string>("");
  const [registrySubmitted, setRegistrySubmitted] = useState<boolean>(false);
  const [activeMaterial, setActiveMaterial] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<string>("");
  const [activeSuiteConfig, setActiveSuiteConfig] = useState<"furnished" | "unfurnished">("furnished");
  const [activeAddon, setActiveAddon] = useState<number>(0);
  const [activeAllianceTab, setActiveAllianceTab] = useState<"infrastructure" | "financing">("infrastructure");

  // Interactive Lifestyle Planner States
  const [selectedLifestyle, setSelectedLifestyle] = useState<"diplomat" | "wellness" | "generational">("diplomat");
  const [activeAmenities, setActiveAmenities] = useState<string[]>(["dining", "cinema", "spa", "gym", "lounge"]);

  // Legal & Heritage States
  const [isLegalOpen, setIsLegalOpen] = useState<boolean>(false);
  const [activeLegalTab, setActiveLegalTab] = useState<"privacy" | "cookie" | "underwriting" | "compliance" | "contact">("privacy");
  const [activeHeritage, setActiveHeritage] = useState<"bhong" | "derawar" | "pattan">("bhong");

  // Interactive 3D Cinematic Site-Plan Map States
  const [activeBlockId, setActiveBlockId] = useState<"alpha" | "beta" | "gamma" | "delta">("alpha");
  const [hoveredBlockId, setHoveredBlockId] = useState<"alpha" | "beta" | "gamma" | "delta" | null>(null);
  const [mapViewMode, setMapViewMode] = useState<"isometric" | "topdown" | "elevation">("isometric");
  const [selectedMapFloor, setSelectedMapFloor] = useState<number>(12);

  // Gallery / Lightbox States
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Synthesizer Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscsRef = useRef<OscillatorNode[]>([]);
  const gainRef = useRef<GainNode | null>(null);

  // Parallax Coordinates for Mouse Movement
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeModule02View, setActiveModule02View] = useState<"3d" | "parallax">("3d");

  // McKinsey Interactive Calculator States
  const [scale, setScale] = useState<string>("5k"); // 1k, 5k, 10k, 30k
  const [horizonYears, setHorizonYears] = useState<number>(10); // 5, 10, 20
  const [capitalSource, setCapitalSource] = useState<string>("agri"); // agri, corporate, discretionary
  const [activeUnderwritingTab, setActiveUnderwritingTab] = useState<"compounding" | "solar">("compounding");
  const [facadeMaterial, setFacadeMaterial] = useState<"travertine" | "concrete">("travertine");
  const [orientation, setOrientation] = useState<"optimized" | "suboptimal">("optimized");

  // AI-Powered and Chart States
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAiReportLoading, setIsAiReportLoading] = useState<boolean>(false);
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [aiFaqAnswer, setAiFaqAnswer] = useState<string | null>(null);
  const [isFaqLoading, setIsFaqLoading] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Advanced AI Concierge Voice & Memory States
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai", text: string, timestamp: string }>>([
    {
      sender: "ai",
      text: "Welcome to the Tabraiz Sovereign AI Delegation Lounge. I am your premium digital concierge. Ask me anything about our vertical monolith, 4-year installment structures, structural travertine facades, or Cholistan agritech hedging strategies.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [learnedIntents, setLearnedIntents] = useState<string[]>(["Initiated luxury overview session."]);

  // Intent Learning Core Helper
  const learnUserIntent = (intent: string) => {
    setLearnedIntents((prev) => {
      if (prev.includes(intent)) return prev;
      const updated = [...prev, intent];
      return updated;
    });
  };

  const t = TRANSLATIONS[lang];

  // Dynamic calculations for the McKinsey underwriting engine
  const underwritingData = useMemo(() => {
    let baseRate = 14.2; // base 14.2% ARR
    let baseMultiplier = 1.0;

    if (scale === "1k") {
      baseRate = 13.6;
      baseMultiplier = 1.5; // unit cost in PKR Crores (approx)
    } else if (scale === "5k") {
      baseRate = 14.2;
      baseMultiplier = 7.0;
    } else if (scale === "10k") {
      baseRate = 14.9;
      baseMultiplier = 13.5;
    } else if (scale === "30k") {
      baseRate = 15.6;
      baseMultiplier = 39.0;
    }

    if (horizonYears === 20) {
      baseRate += 0.8; // reward long holding
    } else if (horizonYears === 5) {
      baseRate -= 0.4;
    }

    if (capitalSource === "agri") {
      baseRate += 0.2; // agricultural tax-hedged optimization
    }

    // Compound interest: A = P(1 + r)^n
    const r = baseRate / 100;
    const initialInvestment = baseMultiplier * 10000000; // in PKR
    const finalValue = initialInvestment * Math.pow(1 + r, horizonYears);
    const gainPercentage = ((finalValue - initialInvestment) / initialInvestment) * 100;
    
    // Conventional real estate returns average ~11% ARR in Pakistan
    const conventionalValue = initialInvestment * Math.pow(1 + 0.11, horizonYears);
    const premiumAlpha = finalValue - conventionalValue;

    return {
      arr: baseRate.toFixed(1),
      initialPKR: (initialInvestment / 10000000).toFixed(1) + " Crore",
      finalPKR: (finalValue / 10000000).toFixed(1) + " Crore",
      premiumPKR: (premiumAlpha / 10000000).toFixed(1) + " Crore",
      gainMultiplier: (finalValue / initialInvestment).toFixed(2) + "x",
      basisPointsOverConventional: Math.round((r - 0.11) * 10000)
    };
  }, [scale, horizonYears, capitalSource]);

  // Dynamic growth chart data for Recharts
  const growthChartData = useMemo(() => {
    const data = [];
    const rTabraiz = parseFloat(underwritingData.arr) / 100;
    const rConventional = 0.11;
    const rAgri = 0.085;
    
    // Determine base investment value based on scale
    let baseVal = 1.5; // in Crore PKR
    if (scale === "5k") baseVal = 7.0;
    else if (scale === "10k") baseVal = 13.5;
    else if (scale === "30k") baseVal = 39.0;
    
    const totalYears = horizonYears;
    const step = totalYears <= 5 ? 1 : totalYears <= 10 ? 1 : 2;
    
    for (let yr = 0; yr <= totalYears; yr += step) {
      const valTabraiz = baseVal * Math.pow(1 + rTabraiz, yr);
      const valConventional = baseVal * Math.pow(1 + rConventional, yr);
      const valAgri = baseVal * Math.pow(1 + rAgri, yr);
      
      data.push({
        year: `Yr ${yr}`,
        "Tabraiz Town": parseFloat(valTabraiz.toFixed(2)),
        "Conventional R.E.": parseFloat(valConventional.toFixed(2)),
        "Agrarian Reserves": parseFloat(valAgri.toFixed(2))
      });
    }
    
    // Always make sure the final year is included
    if (totalYears % step !== 0) {
      const valTabraiz = baseVal * Math.pow(1 + rTabraiz, totalYears);
      const valConventional = baseVal * Math.pow(1 + rConventional, totalYears);
      const valAgri = baseVal * Math.pow(1 + rAgri, totalYears);
      
      data.push({
        year: `Yr ${totalYears}`,
        "Tabraiz Town": parseFloat(valTabraiz.toFixed(2)),
        "Conventional R.E.": parseFloat(valConventional.toFixed(2)),
        "Agrarian Reserves": parseFloat(valAgri.toFixed(2))
      });
    }
    return data;
  }, [underwritingData.arr, horizonYears, scale]);

  // Dynamic calculation for the solar energy efficiency widget
  const solarEnergyData = useMemo(() => {
    // Map scale to area (sqm)
    let areaSqm = 418; // 1-Kanal Default
    let label = "1-Kanal Commercial Suite";
    if (scale === "5k") {
      areaSqm = 2090;
      label = "5-Kanal Sky Residence";
    } else if (scale === "10k") {
      areaSqm = 4180;
      label = "10-Kanal Penthouse Monolith";
    } else if (scale === "30k") {
      areaSqm = 12540;
      label = "30-Kanal Family Estate";
    }

    const regionalTariff = 65; // PKR per kWh
    const standardConsumptionKwhPerSqmYear = 160; // HVAC + Lighting load in RYK desert region
    
    // Standard unaligned, brick/concrete building
    const baseKwhYear = areaSqm * standardConsumptionKwhPerSqmYear;
    const baseCostYear = baseKwhYear * regionalTariff;

    // Reductions:
    // Travertine facade (thermal mass insulation) saves 22%
    // Optimized orientation saves 18%
    const facadeSavingRate = facadeMaterial === "travertine" ? 0.22 : 0.0;
    const orientationSavingRate = orientation === "optimized" ? 0.18 : 0.0;
    const totalSavingRate = facadeSavingRate + orientationSavingRate;

    const actualKwhYear = baseKwhYear * (1 - totalSavingRate);
    const actualCostYear = actualKwhYear * regionalTariff;

    const annualSavingsPKR = baseCostYear - actualCostYear;
    const lifetimeSavingsPKR = annualSavingsPKR * horizonYears;

    // CO2 offset calculation: 1 kWh in Pakistan grid ~ 0.51 kg CO2.
    // Metric tons of CO2 offset annually = (Kwh savings) * 0.51 / 1000
    const annualKwhSavings = baseKwhYear * totalSavingRate;
    const annualCo2OffsetTons = (annualKwhSavings * 0.51) / 1000;
    const lifetimeCo2OffsetTons = annualCo2OffsetTons * horizonYears;

    return {
      label,
      areaSqm,
      baseKwhYear: Math.round(baseKwhYear),
      baseCostYearPKR: baseCostYear,
      actualKwhYear: Math.round(actualKwhYear),
      actualCostYearPKR: actualCostYear,
      savingRatePercentage: Math.round(totalSavingRate * 100),
      annualSavingsPKR,
      lifetimeSavingsPKR,
      annualCo2OffsetTons: parseFloat(annualCo2OffsetTons.toFixed(1)),
      lifetimeCo2OffsetTons: parseFloat(lifetimeCo2OffsetTons.toFixed(1)),
      // In Crores/Lakhs formatting
      baseCostYearFormatted: baseCostYear >= 10000000 
        ? (baseCostYear / 10000000).toFixed(2) + " Crore" 
        : (baseCostYear / 100000).toFixed(1) + " Lakh",
      actualCostYearFormatted: actualCostYear >= 10000000 
        ? (actualCostYear / 10000000).toFixed(2) + " Crore" 
        : (actualCostYear / 100000).toFixed(1) + " Lakh",
      annualSavingsFormatted: annualSavingsPKR >= 10000000 
        ? (annualSavingsPKR / 10000000).toFixed(2) + " Crore" 
        : (annualSavingsPKR / 100000).toFixed(1) + " Lakh",
      lifetimeSavingsFormatted: lifetimeSavingsPKR >= 10000000 
        ? (lifetimeSavingsPKR / 10000000).toFixed(2) + " Crore" 
        : (lifetimeSavingsPKR / 100000).toFixed(1) + " Lakh"
    };
  }, [scale, facadeMaterial, orientation, horizonYears]);

  // Real-time email validation status memo
  const emailStatus = useMemo(() => {
    if (!registryEmail) return null;
    
    // Basic email pattern regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registryEmail)) {
      return {
        isValid: false,
        isCorporate: false,
        message: lang === "en" ? "Awaiting valid corporate email format..." : "درست کارپوریٹ ای میل فارمیٹ کا انتظار ہے..."
      };
    }
    
    const domain = registryEmail.split("@")[1].toLowerCase();
    const personalDomains = [
      "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com",
      "aol.com", "zoho.com", "mail.com", "gmx.com", "yandex.com", "protonmail.com",
      "proton.me", "live.com", "msn.com"
    ];
    
    if (personalDomains.includes(domain)) {
      return {
        isValid: true,
        isCorporate: false,
        message: lang === "en" 
          ? "Personal address detected. Please utilize your institutional or corporate domain for executive clearance." 
          : "ذاتی ای میل کا پتہ چلا۔ براہ کرم اپنے ادارے کی کارپوریٹ ای میل درج کریں۔"
      };
    }
    
    return {
      isValid: true,
      isCorporate: true,
      message: lang === "en" 
        ? `Corporate Domain Recognized: @${domain}. Secure Executive Access Granted.` 
        : `کارپوریٹ ڈومین کی تصدیق ہو گئی: @${domain}۔ رسائی کی اجازت ہے۔`
    };
  }, [registryEmail, lang]);

  // High-fidelity Southern Punjab Heritage sites with 6-language translations and legacy integrations
  const heritageSites = useMemo(() => [
    {
      id: "bhong" as const,
      name: {
        en: "Bhong Mosque",
        ur: "مسجد بھونگ",
        ar: "مسجد بهونغ",
        zh: "博格清真寺",
        es: "Mezquita de Bhong",
        sk: "بھونگ مسجد"
      },
      period: "1932 — 1982 AD",
      purity: "Aga Khan Award for Architecture",
      image: ASSET("images/bhong_mosque_artwork_1783303379214.jpg"),
      coordinates: "LAT: 28.2562° N / LONG: 69.9482° E",
      desc: {
        en: "Commissioned in 1932 by Rais Ghazi Mohammad, Bhong Mosque is an architectural masterpiece that took over 50 years of dedicated artisanship to complete. Its design blends classical Islamic tilework, Persian calligraphy, and gold-leaf mosaics, earning the Aga Khan Award. Tabraiz Town honors this level of exquisite detail through our bespoke Travertine stone carving and anodized champagne-metal screen frameworks.",
        ur: "رئیس غازی محمد کی زیرِ نگرانی ۱۹۳۲ میں شروع ہونے والی یہ مسجد پچاس سال کی شبانہ روز محنت سے مکمل ہوئی۔ اس میں روایتی کاشی کاری، خالص سونے کے ملمع اور بہترین اسلامی خطاطی کا ایسا ملاپ ہے جسے عالمی آغا خان ایوارڈ سے نوازا گیا۔ تبریز ٹاؤن اسی شاہکار کاریگری کو اپنے تراورٹائن پتھر کے نفیس تراشوں میں دہراتا ہے۔",
        ar: "تم تكليف بناء مسجد بهونغ في عام 1932 من قبل رئيس غازي محمد، وهي تحفة معمارية استغرق بناؤها أكثر من 50 عاماً من الحرفية المتفانية. يجمع تصميمها بين البلاط الإسلامي الكلاسيكي، والخط الفارسي، وفسيفساء ورق الذهب، مما منحها جائزة الآغا خان للعمارة. تكرم مدينة تبريز هذا المستوى من التفاصيل الرائعة من خلال نحت حجر الترافرتين المخصص.",
        zh: "博格清真寺由 Rais Ghazi Mohammad 于 1932 年委托建造，历时 50 余载才告落成，是一座无与伦比的建筑杰作。其设计完美融合了古典伊斯兰瓷砖、波斯书法及手工金箔镶嵌，荣获著名的阿卡汗建筑奖。塔布雷斯新城以此极致工艺为精神支柱，将其融入现代香槟金网格架构中。",
        es: "Encargada en 1932 por Rais Ghazi Mohammad, la mezquita de Bhong es una obra maestra de la arquitectura que requirió más de 50 años de artesanía dedicada. Su diseño combina azulejos islámicos clásicos, caligrafía persa y mosaicos de pan de oro, ganando el Premio Aga Khan. Tabraiz Town rinde homenaje a este nivel de detalle exquisito.",
        sk: "رئیس غازی محمد دی نگرانی وچ ۱۹۳۲ وچ بݨݨ آلی اے مسجد ۵۰ سالیں دی محنت دا نتیجہ ہے۔ ایندے وچ سونے دا کم تے کاشی کاری تہاݙے دل کوں بھا ویندی ہے۔ آغا خان ایوارڈ یافتہ ایں مسجد دی خوبصورتی توں متاثر تھی کر اساں تبریز ٹاؤن بݨائے۔"
      },
      legacyConnection: {
        en: "Proportionate Tile Geometry: The 1:1.618 golden ratio grids utilized in the custom mosaic borders of Bhong Mosque are directly replicated in Tabraiz Town's facade screens, creating a rhythmic physical continuity.",
        ur: "ہندسی مماثلت: مسجد بھونگ کی کاشی کاری میں استعمال ہونے والے سنہری تناسب (1:1.618) کو تبریز ٹاؤن کے بیرونی اسکرینز میں دہرایا گیا ہے، جس سے روایتی اور جدید ہندسی حسن کا ایک حسابی تال میل پیدا ہوتا ہے۔",
        ar: "التناسق الهندسي: تم تكرار شبكات النسبة الذهبية المستخدمة في الفسيفساء الكلاسيكية لمسجد بهونغ مباشرة في شاشات واجهة مدينة تبريز.",
        zh: "几何拼贴对称：博格清真寺经典马赛克边框中所采用的 1:1.618 黄金比例网格，直接复刻在塔布雷斯新城的立面隔栅中，形成了韵律感的视觉延续。",
        es: "Geometría de Mosaico: Las retículas de proporción áurea 1:1.618 utilizadas en la mezquita se replican directamente en las pantallas de la fachada de Tabraiz Town.",
        sk: "ہندسی تال میل: مسجد بھونگ دی خوبصورت ہندسی بناوٹ کوں اساں تبریز ٹاؤن دے فرنٹ سکرین وچ سموئے ہسے تاں کہ نویں تے پراݨی تعمیری شکل ہکو سنویں لگے۔"
      }
    },
    {
      id: "derawar" as const,
      name: {
        en: "Derawar Fort",
        ur: "قلعہ ڈراور",
        ar: "حصن ديراور",
        zh: "德拉瓦堡",
        es: "Fuerte de Derawar",
        sk: "ڈراور قلعہ"
      },
      period: "9th Century AD",
      purity: "Sovereign Desert Monolith",
      image: ASSET("images/derawar_fort_artwork_1783303399339.jpg"),
      coordinates: "LAT: 28.7671° N / LONG: 71.3341° E",
      desc: {
        en: "Standing majestic in the Cholistan Desert, Derawar Fort is a massive 9th-century fortress of forty bastions visible for miles. Built with hand-baked clay bricks, its monolithic presence represents safety, dominance, and survival against the harsh desert climate. Tabraiz Town’s thick structural core and high-thermal-isolation travertine facade inherit this protective desert ethos.",
        ur: "صحرائے چولستان کے عین وسط میں کھڑا یہ قلعہ نویں صدی کا ایک ایسا فولادی وجود ہے جس کے چالیس دیوہیکل برج میلوں دور سے نظر آتے ہیں۔ مٹی کی بنی ہوئی اینٹوں سے بنے اس قلعے کا مہیب سائز صحرا میں حفاظت، خودمختاری اور بقا کی علامت ہے۔ تبریز ٹاؤن کا مضبوط کنکریٹ اسٹرکچر اسی چولستانی مضبوطی کی عکاسی کرتا ہے۔",
        ar: "يقف حصن ديراور المهيب في صحراء كوليستان، وهو حصن ضخم من القرن التاسع يضم أربعين برجاً مرئياً على بعد أميال. يمثل وجوده المتجانس الأمان والسيادة والبقاء في مواجهة المناخ الصحراوي القاسي. يرث جوهر جدران مدينة تبريز هذا الطابع الحامي.",
        zh: "德拉瓦堡耸立在辽阔的科利斯坦荒漠中，是一座公元 9 世纪的宏伟堡垒，拥有 40 个巨大的半圆形碉堡，巍峨雄伟，延绵数里。它由手工烘烤的粘土砖砌筑而成，代表了沙漠深处的绝对安全、统治力和抵御风沙的顽强生命力。塔布雷斯新城的超高强钢筋骨架，完美继承了这一越过千年的古老守护精神。",
        es: "De pie, majestuoso en el desierto de Cholistán, el fuerte de Derawar es una enorme fortaleza del siglo IX con cuarenta bastiones visibles a kilómetros de distancia. Su presencia monolítica representa la seguridad, la dominación y la supervivencia frente al clima hostil.",
        sk: "ڈراور قلعہ: چولستان دے پنڈ وچ بݨیا اے قلعہ نویں صدی دی ہک اینجھی طاقتور جا ہے جیندے چالھی وݙے برج میلیں دور توں نظر آندن۔ اے قلعہ اساݙے پرکھیں دی بہادری تے چولستان دی مٹی دی مضبوطی دی سنجاݨ ہے۔ اساں ایندی مضبوطی کوں تبریز ٹاؤن دی بنیادیں وچ شامل کیتے۔"
      },
      legacyConnection: {
        en: "Thermal Mass & Deflection: Derawar Fort's high-density baked clay walls deflect Cholistan's solar heat. Tabraiz Town mimics this using 45cm thick Travertine cavities providing natural passive cooling.",
        ur: "تپش کے خلاف مزاحمت: قلعہ ڈراور کی مٹی کی موٹی دیواریں گرمی کو اندر آنے سے روکتی ہیں۔ تبریز ٹاؤن نے اسی اصول کے تحت ۴۵ سینٹی میٹر موٹی تراورٹائن دیواریں بنائی ہیں جو قدرتی ائیر کنڈیشننگ فراہم کرتی ہیں۔",
        ar: "الكتلة الحرارية: تعكس جدران الطين الكثيفة لحصن ديراور حرارة الشمس. تحاكي مدينة تبريز ذلك باستخدام تجاويف الترافرتين بعمق 45 سم.",
        zh: "热惰性与防热流：德拉瓦堡高密度的手作粘土砖墙能够有效阻隔烈日辐射。塔布雷斯新城以此为灵感，采用 45 厘米厚空腔洞石贴面，实现了绝佳 of 自然被动式隔热散热性能。",
        es: "Masa Térmica: Las gruesas paredes de arcilla del fuerte deflectan el calor. Tabraiz Town lo imita con cavidades de travertino de 45 cm para enfriamiento pasivo.",
        sk: "گرمی توں بچاؤ: قلعہ ڈراور دی موٹی مٹی دی دیواریں تپش کوں روکن وچ مدد کریندن۔ تبریز ٹاؤن وچ وی ۴۵ سینٹی میٹر موٹی تراورٹائن دا استعمال گرمی کوں دور رکھݨ واسطے کیتا گیا ہے۔"
      }
    },
    {
      id: "pattan" as const,
      name: {
        en: "Pattan Minara",
        ur: "پتن منارا",
        ar: "منارة باتان",
        zh: "帕坦尖塔",
        es: "Pattan Minara",
        sk: "پتن منارا"
      },
      period: "2nd — 5th Century AD",
      purity: "Ancient Buddhist Civilization",
      image: ASSET("images/pattan_minara_artwork_1783303419463.jpg"),
      coordinates: "LAT: 28.3491° N / LONG: 70.2112° E",
      desc: {
        en: "An archaeological treasure on the old banks of the Indus, Pattan Minara dates back to the ancient Buddhist era of Southern Punjab. Originally a tower of mystery and spiritual reflection, its brick craftsmanship has resisted two millennia of wind and sun. Tabraiz Town’s design echoes this structural endurance and linear elegance, standing tall as a modern architectural lighthouse.",
        ur: "دریائے سندھ کے قدیم کنارے پر واقع پتن منارا جنوبی پنجاب کے بدھ مت دور کا ایک عظیم اثاثہ ہے۔ دو ہزار سال سے ایستادہ مٹی کا یہ مینار موسمی طوفانوں کے سامنے آج بھی سر اٹھائے کھڑا ہے۔ تبریز ٹاؤن کی ہندسی عمودی بناوٹ اسی غیر متزلزل استقامت اور لافانی ڈیزائن کا خراجِ عقیدت ہے۔",
        ar: "يعتبر منارة باتان كنزاً أثرياً على ضفاف نهر السند القديمة، ويعود تاريخه إلى العصر البوذي القديم في جنوب البنجاب. تمثل هذه المنارة الصمود التاريخي، وتحاكي مدينة تبريز تصميمها الأنيق كمنارة معمارية حديثة.",
        zh: "帕坦尖塔座落在昔日印度河古道之畔，是旁遮普省南部可追溯至佛教时期的考古秘宝。作为一座象征古老神秘与精神内省的砖塔，其精湛的叠涩砌砖法抵挡了整整两千载的风吹日晒。塔布雷斯新城的设计呼应了这种极致的结构耐久度与线条美学，矗立为该地区现代财富的主权灯塔。",
        es: "Un tesoro arqueológico a orillas del antiguo río Indo, Pattan Minara data de la antigua era budista del sur de Punjab. Originalmente una torre de misterio y reflexión espiritual, su artesanía en ladrillo ha resistido dos milenios. El diseño de Tabraiz Town se inspira en esta elegancia lineal.",
        sk: "قدیم دریا سندھ دے کنڈے تے واقع اے مینار بدھ مت دور دی ہک مقدس نشانی ہے جیڑی دو ہزار سال توں طوفانیں دے سامنے کھڑی ہے۔ اساں تبریز ٹاؤن کوں ایں مینار وانگوں اچا تے پکا بݨائے تاں کہ اے وسیب دی نویں سنجاݨ بݨے۔"
      },
      legacyConnection: {
        en: "Vertical Linear Axis: The prominent vertical lines and structural taper of Pattan Minara are mirrored in our modern towers, ensuring a visual silhouette that feels both historical and futuristic.",
        ur: "عمودی محور: پتن منارا کے اوپر کی طرف باریک ہوتے ہوئے خوبصورت عمودی زاویوں کو ہمارے میناروں میں دہرایا گیا ہے، جس سے ایک ایسا وجود بنتا ہے جو تاریخی اور مستقبل پسند دونوں محسوس ہوتا ہے۔",
        ar: "المحور الخطي العمودي: تنعكس الخطوط العمودية البارزة والتدريج الهيكلي لمنارة باتان في أبراجنا الحديثة.",
        zh: "垂直线性轴线：帕坦尖塔高耸的垂直线条和稳固的微锥形收分形体，巧妙映射在我们的现代化塔楼轮廓中，构成了既富历史底蕴又兼具未来感的城市天际线。",
        es: "Eje Lineal Vertical: Las prominentes líneas verticales y el estrechamiento estructural de Pattan Minara se reflejan en nuestras torres modernas.",
        sk: "اچا عمودی نقشہ: پتن منارا وانگوں سدھے تے اتیں توں باریک تھیندے ہوئے نقشے کوں اساں اپݨی جدید عمارت دے ٹاورز وچ سموئے ہیں تاں کہ تاریخ زندہ رہوے۔"
      }
    }
  ], []);

  // Audio Synth System: generate 60FPS sound drone
  const toggleAmbientSound = () => {
    if (isAudioPlaying) {
      // Fade out and stop
      if (gainRef.current && audioCtxRef.current) {
        const ct = audioCtxRef.current.currentTime;
        gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, ct);
        gainRef.current.gain.exponentialRampToValueAtTime(0.001, ct + 1.2);
        setTimeout(() => {
          oscsRef.current.forEach((o) => {
            try { o.stop(); } catch (e) {}
          });
          oscsRef.current = [];
          setIsAudioPlaying(false);
          triggerNotification(lang === "en" ? "Atmospheric audio disabled" : "فضائی خاموشی فعال ہے");
        }, 1300);
      }
    } else {
      // Initialize Audio Context and Oscillators
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // Base drone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filterNode = ctx.createBiquadFilter();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1 note (deep calm)

        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(110, ctx.currentTime); // A2 harmonic

        osc3.type = "sine";
        osc3.frequency.setValueAtTime(165, ctx.currentTime); // Fifth harmonic for premium resonant chord

        filterNode.type = "lowpass";
        filterNode.frequency.setValueAtTime(220, ctx.currentTime); // ultra low frequency

        // Subtle slow frequency modulation for dynamic wind/ambient sweep
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.08; // extremely slow sweep
        lfoGain.gain.value = 40; // modulate filter cut-off by 40Hz
        lfo.connect(lfoGain);
        lfoGain.connect(filterNode.frequency);
        lfo.start();

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        
        osc1.connect(filterNode);
        osc2.connect(filterNode);
        osc3.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(ctx.destination);

        gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 3.0); // slow cinematic fade-in

        osc1.start();
        osc2.start();
        osc3.start();

        oscsRef.current = [osc1, osc2, osc3, lfo];
        gainRef.current = gainNode;
        setIsAudioPlaying(true);
        triggerNotification(lang === "en" ? "Generative luxury drone active" : "تبریز ٹاؤن فضائی موسیقی شروع");
      } catch (e) {
        console.error("Web Audio API failed to load:", e);
      }
    }
  };

  const triggerNotification = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  // Parallax handler
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  // Handle Registry Submission with AI lead qualification
  const handleRegistrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registryEmail) return;
    setRegistrySubmitted(true);
    setIsLeadBriefLoading(true);
    setLeadBrief(null);
    triggerNotification(lang === "en" ? "Discretionary briefing scheduled" : "رازداری کے ساتھ رابطہ محفوظ کر لیا گیا ہے");
    try {
      const response = await fetch("/api/ai/qualify-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registryEmail,
          learnedIntents,
          chatHistory: chatMessages.slice(-12),
          lang
        })
      });
      const data = await response.json();
      if (!data.error && data.text) setLeadBrief(data.text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLeadBriefLoading(false);
    }
  };

  const closeRegistryPortal = () => {
    setIsRegistryOpen(false);
    setRegistrySubmitted(false);
    setRegistryEmail("");
    setLeadBrief(null);
  };

  // AI Plot/Suite Recommender request
  const fetchRecommendation = async () => {
    setIsRecLoading(true);
    setRecResult(null);
    try {
      learnUserIntent(`Ran plot recommender: budget ${recBudget}, purpose ${recPurpose}, asset ${recAssetType}`);
      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: recBudget, purpose: recPurpose, assetType: recAssetType, lang })
      });
      const data = await response.json();
      setRecResult(data.error ? data.error : data.text);
    } catch (err) {
      console.error(err);
      setRecResult(lang === "en" ? "The portfolio strategist is currently unavailable. Please retry shortly." : "پورٹ فولیو مشیر اس وقت دستیاب نہیں۔ کچھ دیر بعد کوشش کریں۔");
    } finally {
      setIsRecLoading(false);
    }
  };

  // AI Suite Visual generation request
  const fetchSuiteVisual = async () => {
    setIsSuiteVisualLoading(true);
    setSuiteVisual(null);
    try {
      const response = await fetch("/api/ai/suite-visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suiteConfig: activeSuiteConfig, lifestyle: moodboardLifestyle })
      });
      const data = await response.json();
      if (data.imageBase64) {
        setSuiteVisual(`data:${data.mimeType};base64,${data.imageBase64}`);
      } else {
        triggerNotification(data.error || (lang === "en" ? "Visualization unavailable." : "تصویر دستیاب نہیں۔"));
      }
    } catch (err) {
      console.error(err);
      triggerNotification(lang === "en" ? "Visualization engine offline." : "تصویری انجن آف لائن ہے۔");
    } finally {
      setIsSuiteVisualLoading(false);
    }
  };

  // AI-narrated cinematic site tour
  const speakTourLine = (text: string) => new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    if (lang === "ur") {
      const urVoice = voices.find(v => v.lang.startsWith("ur") || v.lang.startsWith("hi"));
      if (urVoice) utterance.voice = urVoice;
    } else {
      const enVoice = voices.find(v => v.name.includes("Google US English") || v.lang.startsWith("en"));
      if (enVoice) utterance.voice = enVoice;
    }
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });

  const stopNarratedTour = () => {
    tourCancelRef.current = true;
    window.speechSynthesis?.cancel();
    setIsTourActive(false);
  };

  const startNarratedTour = async () => {
    if (!window.speechSynthesis) {
      triggerNotification(lang === "en" ? "Voice narration not supported in this browser." : "آواز کی سہولت دستیاب نہیں ہے۔");
      return;
    }
    const steps: { page: string; en: string; ur: string }[] = [
      {
        page: "overview",
        en: "Welcome to Tabraiz Town, Rahim Yar Khan. Thirty kanals of luxury commercial vision, where tomorrow meets the desert of Southern Punjab.",
        ur: "تبریز ٹاؤن، رحیم یار خان میں خوش آمدید۔ تیس کنال پر محیط پرتعیش کمرشل منصوبہ، جہاں آنے والا کل صحرائے چولستان سے ملتا ہے۔"
      },
      {
        page: "architecture",
        en: "Seven monolithic blocks. Two hundred and eighteen shops. A thirty meter boulevard. Every line of the master plan is carved with mathematical precision.",
        ur: "سات عظیم بلاکس، دو سو اٹھارہ دکانیں اور تیس میٹر چوڑا مرکزی بلیوارڈ۔ ماسٹر پلان کی ہر لکیر ریاضیاتی درستگی سے تراشی گئی ہے۔"
      },
      {
        page: "heritage",
        en: "Italian travertine and champagne steel, standing beside the heritage of Bhong Mosque and Derawar Fort. Material purity meets Cholistan legacy.",
        ur: "اطالوی تراورٹائن اور شیمپین اسٹیل، بھونگ مسجد اور قلعہ دراوڑ کے ورثے کے پہلو میں۔ مادی پاکیزگی اور چولستانی تاریخ کا سنگم۔"
      },
      {
        page: "configurations",
        en: "Rooftop dining, a private cinema, gourmet courts and infinity pools. Configure your suite, and let our AI craft your interior signature.",
        ur: "روف ٹاپ ریسٹورنٹ، پرائیویٹ سینما، فوڈ کورٹ اور انفینیٹی پول۔ اپنا سوئٹ منتخب کریں اور اے آئی سے اپنا اندرونی ڈیزائن تیار کروائیں۔"
      },
      {
        page: "metrics",
        en: "A four year sovereign installment plan, underwritten with institutional discipline, preserving generational wealth against inflation.",
        ur: "چار سالہ آسان اقساط کا منصوبہ، ادارہ جاتی نظم کے ساتھ، جو آپ کی نسل در نسل دولت کو افراطِ زر سے محفوظ رکھتا ہے۔"
      },
      {
        page: "registry",
        en: "Tabraiz Town is not a purchase. It is a permanent signature on the horizon of Punjab. Join the private registry today.",
        ur: "تبریز ٹاؤن محض خریداری نہیں، پنجاب کے افق پر آپ کا مستقل دستخط ہے۔ آج ہی پرائیویٹ رجسٹری میں شامل ہوں۔"
      }
    ];

    setIsTourActive(true);
    tourCancelRef.current = false;
    window.speechSynthesis.cancel();
    learnUserIntent("Started the AI narrated cinematic site tour.");
    for (const step of steps) {
      if (tourCancelRef.current) break;
      setActivePage(step.page);
      window.scrollTo({ top: 0, behavior: "smooth" });
      await new Promise((r) => setTimeout(r, 900));
      if (tourCancelRef.current) break;
      await speakTourLine(lang === "ur" ? step.ur : step.en);
      await new Promise((r) => setTimeout(r, 600));
    }
    setIsTourActive(false);
  };

  // Handle AI Underwriting Report request
  const fetchAiUnderwriteReport = async () => {
    setIsAiReportLoading(true);
    setAiReport(null);
    try {
      const response = await fetch("/api/ai/underwrite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          scale,
          horizonYears,
          capitalSource,
          lang,
          arr: underwritingData.arr,
          initialPKR: underwritingData.initialPKR,
          finalPKR: underwritingData.finalPKR
        })
      });
      const data = await response.json();
      if (data.error) {
        setAiReport(`### Configuration Required\n\n${data.error}`);
      } else {
        setAiReport(data.text);
      }
    } catch (err: any) {
      console.error(err);
      setAiReport("### Underwriting Connection Offline\\n\\nFailed to establish connection with the sovereign AI underwriter. Please ensure your environment is fully configured.");
    } finally {
      setIsAiReportLoading(false);
    }
  };

  // Real-time Text-to-Speech (Vocal Synthesis)
  const speakResponse = (text: string) => {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel(); // Silences preceding audio
      const cleanText = text
        .replace(/[*#`_\-]/g, " ")
        .replace(/\[.*?\]\(.*?\)/g, " ")
        .substring(0, 350); // Premium brief vocal limit
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95; // Elegantly slower speed
      utterance.pitch = 1.0;

      // Select high-quality English or Urdu voice representation
      const voices = window.speechSynthesis.getVoices();
      if (lang === "ur") {
        const urVoice = voices.find(v => v.lang.startsWith("ur") || v.lang.startsWith("hi"));
        if (urVoice) utterance.voice = urVoice;
      } else {
        const enVoice = voices.find(v => v.name.includes("Google US English") || v.lang.startsWith("en"));
        if (enVoice) utterance.voice = enVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis error:", err);
    }
  };

  // Real-time Speech-to-Text Dictation
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      triggerNotification(lang === "en" ? "Speech recognition not supported in this browser." : "آواز کی شناخت دستیاب نہیں ہے۔");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === "ur" ? "ur-PK" : "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        triggerNotification(lang === "en" ? "Listening to your voice..." : "آپ کی آواز سنی جا رہی ہے...");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        if (resultText) {
          setUserQuestion(resultText);
          learnUserIntent("Utilized speech-to-text voice input to interact.");
          triggerNotification(lang === "en" ? `Captured: "${resultText}"` : `آواز ریکارڈ ہو گئی`);
        }
      };

      recognition.onerror = (err: any) => {
        console.error("Speech Recognition Error:", err);
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Upgraded AI FAQ Question & Thread Manager
  const handleAskFaq = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = userQuestion.trim();
    if (!query) return;

    // Append user question to chat thread
    const userMsg = {
      sender: "user" as const,
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setUserQuestion("");
    setIsFaqLoading(true);
    setAiFaqAnswer(null);

    try {
      // Append query to learned intents to preserve continuity
      learnUserIntent(`Asked question: "${query}"`);

      const response = await fetch("/api/ai/ask-faq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: query,
          lang,
          learnedIntents: [...learnedIntents, `Current Question: ${query}`]
        })
      });
      const data = await response.json();
      
      let answerText = "";
      if (data.error) {
        answerText = data.error;
      } else {
        answerText = data.text;
      }

      // Briefly keep loading to simulate deep ledger alignment calculations, then print with typewriter
      const aiMsg = {
        sender: "ai" as const,
        text: answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isTypingEffectActive: true
      };
      
      setChatMessages((prev) => [...prev, aiMsg]);
      setAiFaqAnswer(answerText);

      // Trigger automatic TTS if enabled
      if (isSpeakingEnabled) {
        speakResponse(answerText);
      }

    } catch (err: any) {
      console.error(err);
      const errText = "The sovereign AI concierge is currently attending to other delegates. Please ensure your project settings are complete.";
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai" as const,
          text: errText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isTypingEffectActive: true
        }
      ]);
      setAiFaqAnswer(errText);
    } finally {
      setIsFaqLoading(false);
    }
  };

  // Cleanup synthesizer on unmount
  useEffect(() => {
    return () => {
      oscsRef.current.forEach((o) => {
        try { o.stop(); } catch (e) {}
      });
    };
  }, []);

  // Structural Materials detail data
  const materials = [
    {
      name: "Travertine Stone",
      nameUr: "تراورٹائن قدرتی پتھر",
      desc: "Imported premium travertine stone. Formed by geothermal springs, its micro-porous texture acts as a natural cooling system, diffusing heat during Cholistan's high-summer peak.",
      descUr: "درآمد شدہ اعلیٰ ترین تراورٹائن قدرتی پتھر۔ یہ پتھر عمارت کو قدرتی طور پر ٹھنڈا رکھنے کی صلاحیت رکھتا ہے اور چولستان کی شدید گرمی میں بھی درجہ حرارت کو اعتدال پر رکھتا ہے۔",
      purity: "99.2% Pure Mineral Density",
      thermal: "Excellent Thermal Isolation Index",
      image: ASSET("images/tabraiz_town_materiality_1783295095964.jpg")
    },
    {
      name: "Brushed Champagne Metal",
      nameUr: "شیمپین دھاتی وجود",
      desc: "Anodized space-grade aluminum alloys finished in warm, low-reflection champagne tones. Highly resistant to corrosive dust storms and offering sleek, high-contrast framing.",
      descUr: "خلائی گریڈ کے اینوڈائزڈ ایلومینیم اللائے جو ہلکے شیمپین رنگوں میں ملمع شدہ ہیں۔ یہ سخت موسمی طوفانوں کے خلاف بے مثال مزاحمت فراہم کرتے ہیں۔",
      purity: "Custom Anti-corrosion Coatings",
      thermal: "Zero Oxidization Guarantee",
      image: ASSET("images/tabraiz_town_interior_1783295077820.jpg")
    },
    {
      name: "Horizon Panoramic Glass",
      nameUr: "افق پینورامک شیشہ",
      desc: "Triple-glazed acoustic-shielded low-emissivity smart glass sheets. Offers complete UV blockage and maximum clarity to frame the sweeping golden desert horizons of Rahim Yar Khan.",
      descUr: "تہرے شیشے پر مشتمل آواز کی لہروں کو روکنے والا سمارٹ الٹرا کلیئر گلاس۔ یہ سورج کی تپش کو مکمل روکتے ہوئے صحرائے چولستان کی شاموں کے دلفریب نظارے فراہم کرتا ہے۔",
      purity: "0.22 U-Value Thermal Rating",
      thermal: "Acoustic Silence Vector",
      image: ASSET("images/tabraiz_town_exterior_1783295060059.jpg")
    }
  ];

  // Dynamic Class Configuration for Color Spectrum switching
  const containerClasses = `min-h-screen transition-colors duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
    theme === "graphite" ? "bg-graphite text-ivory" : "bg-ivory text-graphite"
  }`;

  // Shared cinematic page banner keeping every page visually in sequence with the hero
  const renderPageBanner = (image: string, kicker: string, titleEn: React.ReactNode, titleUr: React.ReactNode) => (
    <section className="relative h-[52vh] min-h-[380px] w-full flex flex-col justify-end px-6 md:px-12 pb-14 overflow-hidden bg-[#1C1A17] text-[#FDFBF7]">
      <div className="absolute inset-0 w-full h-full scale-105 pointer-events-none select-none">
        <img
          src={image}
          alt=""
          className="w-full h-full object-cover opacity-80 filter brightness-75"
          referrerPolicy="no-referrer"
        />
        <div className="shimmer-wave" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1C1A17]/70 via-transparent to-[#1C1A17]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-7xl mx-auto relative z-10 space-y-4 text-left"
      >
        <div className="flex items-center space-x-3">
          <span className="w-12 h-[1px] bg-[#E3C193]"></span>
          <p className="text-xs uppercase tracking-[0.4em] font-medium text-[#E3C193] font-mono">{kicker}</p>
        </div>
        <h1 className="text-3xl md:text-6xl font-serif tracking-tight leading-[1.1] text-[#FDFBF7]">
          {lang === "en" ? titleEn : titleUr}
        </h1>
      </motion.div>
    </section>
  );

  return (
    <div className={containerClasses} id="main-frame">
      
      
      {/* Floating System Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1C1A17]/95 border border-[#E3C193]/30 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md flex items-center space-x-3 pointer-events-none"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse"></span>
            <p className="text-xs uppercase tracking-[0.15em] font-mono text-[#FDFBF7]">{notificationMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Navigator Bar (LV Digital Creative style with Frosted Glass theme) */}
      <nav className={`fixed top-0 left-0 w-full z-40 px-6 md:px-12 py-5 flex justify-between items-center transition-all duration-700 ${theme === "graphite" ? "glass-nav text-ivory" : "glass-nav-light text-graphite"}`}>
        <div 
          onClick={() => {
            setActivePage("overview");
            setTimeout(() => {
              const el = document.getElementById("hero");
              el?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}
          className="text-lg md:text-xl tracking-[0.25em] font-serif font-medium cursor-pointer brand-shimmer"
          id="brand-logo"
        >
          {lang === "en" ? "[ TABRAIZ TOWN ]" : "[ تبریز ٹاؤن ]"}
        </div>

        {/* Chapter tabs — refined named navigation */}
        <div className="hidden md:flex items-center gap-1 ml-5 border-l border-current/10 pl-5">
          {PAGES.map((page) => {
            const isActive = activePage === page.id;
            return (
              <button
                key={page.id}
                onClick={() => {
                  setActivePage(page.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`relative px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-sans font-medium transition-all duration-300 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "text-champagne"
                    : theme === "graphite"
                      ? "text-white/40 hover:text-white/85"
                      : "text-graphite/45 hover:text-graphite/85"
                }`}
                title={lang === "en" ? page.nameEn : page.nameUr}
              >
                {lang === "en" ? page.shortEn : page.shortUr}
                <span
                  className={`absolute left-3 right-3 -bottom-px h-[1px] transition-all duration-500 ${
                    isActive ? "bg-champagne opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Global Controls Grid */}
        <div className="flex items-center space-x-6 md:space-x-8">
          {/* Theme Dynamic Override */}
          <button
            onClick={() => setTheme(theme === "graphite" ? "ivory" : "graphite")}
            className={`p-2 cursor-pointer transition-colors duration-300 relative group ${theme === "graphite" ? "text-ivory hover:text-champagne" : "text-graphite hover:text-sand"}`}
            title={t.themeLabel}
            id="theme-toggle"
          >
            {theme === "graphite" ? <Sun size={15} /> : <Moon size={15} />}
            <span className={`absolute bottom-0 right-1/2 translate-x-1/2 translate-y-full text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300 py-1 uppercase tracking-wider ${theme === "graphite" ? "text-ivory" : "text-graphite"}`}>
              {theme === "graphite" ? "Ivory" : "Graphite"}
            </span>
          </button>

          {/* Generative Soundscape Synthesizer */}
          <button
            onClick={toggleAmbientSound}
            className={`p-2 cursor-pointer transition-colors duration-300 relative group flex items-center space-x-2 ${theme === "graphite" ? "text-ivory hover:text-champagne" : "text-graphite hover:text-sand"}`}
            title={t.ambientAudio}
            id="audio-toggle"
          >
            {isAudioPlaying ? (
              <Volume2 size={15} className="text-champagne animate-pulse" />
            ) : (
              <VolumeX size={15} />
            )}
            <span className="hidden md:inline text-[9px] font-mono tracking-widest uppercase opacity-40 group-hover:opacity-100 transition-opacity duration-300">
              {isAudioPlaying ? "Drone ON" : "Drone OFF"}
            </span>
          </button>

          {/* Language tabs — tiny and clean */}
          <div className="hidden lg:flex items-center gap-px bg-white/5 border border-current/10 p-px font-mono rounded">
            {[
              { code: "en", label: "EN" },
              { code: "ur", label: "UR" },
              { code: "ar", label: "AR" },
              { code: "zh", label: "ZH" },
              { code: "es", label: "ES" },
              { code: "sk", label: "SK" }
            ].map((langItem) => (
              <button
                key={langItem.code}
                onClick={() => {
                  setLang(langItem.code as any);
                  const notifications: Record<string, string> = {
                    en: "English Layout Active",
                    ur: "اردو ترتیب فعال کر دی گئی ہے",
                    ar: "تم تفعيل التنسيق العربي",
                    zh: "中文排版已激活",
                    es: "Diseño en Español activo",
                    sk: "سرائیکی ترتیب فعال تھی گئی ہے"
                  };
                  triggerNotification(notifications[langItem.code] || "Language changed");
                  learnUserIntent(`Sought layout translation in language code: ${langItem.code.toUpperCase()}`);
                }}
                className={`px-1.5 py-px text-[9px] tracking-widest transition-all duration-200 ${
                  lang === langItem.code
                    ? "bg-champagne text-graphite"
                    : theme === "graphite" ? "text-white/50 hover:text-white/90" : "text-graphite/50 hover:text-graphite/90"
                }`}
              >
                {langItem.label}
              </button>
            ))}
          </div>

          {/* Simple compact language selector button for mobile screen widths */}
          <button
            onClick={() => {
              // Rotate through the 6 languages on mobile
              const list: ("en" | "ur" | "ar" | "zh" | "es" | "sk")[] = ["en", "ur", "ar", "zh", "es", "sk"];
              const currentIndex = list.indexOf(lang);
              const nextLang = list[(currentIndex + 1) % list.length];
              setLang(nextLang);
              const notifications: Record<string, string> = {
                en: "English Active",
                ur: "اردو فعال",
                ar: "العربية نشطة",
                zh: "中文激活",
                es: "Español activo",
                sk: "سرائیکی فعال"
              };
              triggerNotification(notifications[nextLang]);
            }}
            className={`flex lg:hidden items-center space-x-1 p-2 cursor-pointer transition-colors duration-300 text-xs font-medium tracking-widest font-mono border rounded px-2.5 py-1 ${theme === "graphite" ? "text-ivory border-ivory/10 hover:border-champagne/40" : "text-graphite border-graphite/10 hover:border-sand/40"}`}
            id="lang-toggle-mobile"
          >
            <Globe size={11} />
            <span className="uppercase">{lang}</span>
          </button>

          {/* Interactive Menu Trigger */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col gap-1.5 justify-center items-end cursor-pointer group"
            aria-label="Menu"
            id="menu-trigger"
          >
            <span className={`w-6 h-[1.5px] transition-all duration-500 group-hover:w-8 group-hover:bg-champagne ${theme === "graphite" ? "bg-ivory" : "bg-graphite"}`}></span>
            <span className={`w-4 h-[1.5px] transition-all duration-500 group-hover:w-8 group-hover:bg-champagne ${theme === "graphite" ? "bg-ivory" : "bg-graphite"}`}></span>
          </button>
        </div>
      </nav>

      {/* Cinematic Fullscreen Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 w-full h-full bg-[#1C1A17]/98 z-50 flex flex-col justify-between px-8 md:px-24 py-12 text-[#FDFBF7]"
          >
            {/* Header of Overlay */}
            <div className="flex justify-between items-center border-b border-[#FDFBF7]/10 pb-6">
              <span className="text-xs uppercase tracking-[0.3em] text-[#E3C193] font-mono">
                Tabraiz Town — Rahim Yar Khan
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="cursor-pointer text-[#FDFBF7] hover:text-[#E3C193] transition-colors duration-300 p-2 border border-[#FDFBF7]/10 hover:border-[#E3C193]/30 rounded-full"
                id="close-menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Structured Navigation Columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 my-auto">
              <div className="col-span-12 md:col-span-7 space-y-4 text-left">
                {[
                  { id: "hero", en: "Prologue / The Desert Skyline", ur: "تمہید / افقِ صحرا" },
                  { id: "vision", en: "01 / The Demographic Shift", ur: "۰۱ / عمرانیاتی تبدیلی" },
                  { id: "elevation", en: "02 / The Architectural Monolith", ur: "۰۲ / عمودی طرزِ تعمیر" },
                  { id: "materiality", en: "03 / Travertine & Pure Materials", ur: "۰۳ / مادی وجود اور سنگِ تراورٹائن" },
                  { id: "configurations", en: "04 / Suite Configurations & Luxury Add-ons", ur: "۰۴ / سوئٹ کنفیگریشنز اور پرتعیش ایڈ آنز" },
                  { id: "alliances", en: "05 / Strategic Alliances & Financing", ur: "۰۵ / اسٹریٹجک الائنسز اور فنانسنگ" },
                  { id: "metrics", en: "06 / Underwriting Matrix", ur: "۰۶ / تخمینہ منافع" },
                  { id: "registry", en: "07 / Sovereign Horizon Signature", ur: "۰۷ / خاندانی بقا کا دائمی نشان" }
                ].map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIsMenuOpen(false);
                      let pageId = "overview";
                      if (item.id === "hero" || item.id === "vision") pageId = "overview";
                      else if (item.id === "elevation") pageId = "architecture";
                      else if (item.id === "materiality") pageId = "heritage";
                      else if (item.id === "configurations" || item.id === "alliances") pageId = "configurations";
                      else if (item.id === "metrics") pageId = "metrics";
                      else if (item.id === "registry") pageId = "registry";

                      setActivePage(pageId);
                      setTimeout(() => {
                        const target = document.getElementById(item.id);
                        if (target) {
                          target.scrollIntoView({ behavior: "smooth" });
                        } else {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }, 100);
                    }}
                    className="block text-base md:text-lg lg:text-xl font-serif font-light text-left hover:text-[#E3C193] hover:translate-x-1 transition-all duration-300 py-1.5 w-full border-b border-white/10 last:border-0"
                  >
                    <span className="font-mono text-[10px] text-[#D4B996] mr-3 align-middle">0{idx + 1}</span>
                    <span className="align-middle">{lang === "en" ? item.en : item.ur}</span>
                  </button>
                ))}
              </div>

              {/* McKinsey Brand Strategy Quick Facts column */}
              <div className="col-span-12 md:col-span-5 flex flex-col justify-center space-y-8 md:border-l md:border-[#FDFBF7]/10 md:pl-12 text-left">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#D4B996] font-mono">Strategic Framework</p>
                  <h4 className="text-lg font-serif text-[#FDFBF7]">"A secure regional vault of agricultural wealth capital."</h4>
                </div>
                <div className="grid grid-cols-2 gap-6 font-mono text-[11px] uppercase tracking-wider text-[#FDFBF7]/60">
                  <div>
                    <p className="text-[#E3C193]">Scale</p>
                    <p className="text-white font-medium mt-1">30-Kanal Estate</p>
                  </div>
                  <div>
                    <p className="text-[#E3C193]">Core Target</p>
                    <p className="text-white font-medium mt-1">14.2% IRR Base</p>
                  </div>
                  <div>
                    <p className="text-[#E3C193]">Sovereignty</p>
                    <p className="text-white font-medium mt-1">Absolute Privacy</p>
                  </div>
                  <div>
                    <p className="text-[#E3C193]">Structure</p>
                    <p className="text-white font-medium mt-1">Vertical Monolith</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsRegistryOpen(true);
                    }}
                    className="w-full text-center text-xs uppercase tracking-[0.2em] font-medium text-[#1C1A17] bg-[#E3C193] hover:bg-[#FDFBF7] transition-colors duration-500 py-3.5"
                  >
                    Enter Private Registry
                  </button>
                </div>
              </div>
            </div>

            {/* Footer of Overlay with Multi-Language Grid */}
            <div className="flex flex-col lg:flex-row justify-between items-center border-t border-[#FDFBF7]/10 pt-6 text-[10px] font-mono text-[#FDFBF7]/40 tracking-widest gap-4">
              <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-start">
                <span className="text-champagne font-semibold uppercase tracking-wider">Edition:</span>
                {[
                  { code: "en", label: "English" },
                  { code: "ur", label: "اردو" },
                  { code: "ar", label: "العربية" },
                  { code: "zh", label: "中文" },
                  { code: "es", label: "Español" },
                  { code: "sk", label: "سرائیکی" }
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setLang(item.code as any);
                      setIsMenuOpen(false);
                      const labels: Record<string, string> = {
                        en: "English edition activated",
                        ur: "اردو ایڈیشن فعال کر دیا گیا ہے",
                        ar: "تم تفعيل النسخة العربية",
                        zh: "中文版本已开启",
                        es: "Edición en Español activa",
                        sk: "سرائیکی ایڈیشن فعال تھی گیا ہے"
                      };
                      triggerNotification(labels[item.code]);
                    }}
                    className={`hover:text-champagne transition-all duration-300 cursor-pointer ${lang === item.code ? "text-champagne font-bold underline underline-offset-4" : ""}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="text-center lg:text-right space-y-1">
                <p>A STRATEGIC PROJECT BY HARVICS GLOBAL VENTURES S.R.O. (PRAGUE, CZECH REPUBLIC)</p>
                <p>© {new Date().getFullYear()} TABRAIZ TOWN. ALL RIGHTS RESERVED.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prologue: Cinematic Hero Section (IDEO/Apple product unveiling style) */}
      {activePage === "overview" && (
        <>
          <section
            id="hero"
        className="relative h-screen w-full flex flex-col justify-between items-center px-6 md:px-12 py-16 overflow-hidden bg-[#1C1A17] text-[#FDFBF7]"
      >
        {/* Extreme cinematic background using generated high-end architectural rendering */}
        <div className="absolute inset-0 w-full h-full scale-105 pointer-events-none filter brightness-75 select-none transition-transform duration-[12s] ease-out">
          <img
            src={ASSET("images/tabraiz_hero_aerial_dusk.png")}
            alt="Tabraiz Town Cinematic Aerial at Dusk"
            className="w-full h-full object-cover opacity-80 transition-all duration-[6s]"
            referrerPolicy="no-referrer"
          />
          <div className="shimmer-wave" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1A17]/70 via-transparent to-[#1C1A17]" />
        </div>

        {/* Top spacer */}
        <div></div>

        {/* Central Brand Statement with Frosted Glass panel */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-12 relative z-10 text-left items-center gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3">
                <span className="w-12 h-[1px] bg-[#E3C193]"></span>
                <p className="text-xs uppercase tracking-[0.4em] font-medium text-[#E3C193] font-mono">
                  {t.brandSubtitle}
                </p>
              </div>
              
              <h1 className="text-4xl md:text-7xl font-serif tracking-tight leading-[1.1] text-[#FDFBF7]">
                {lang === "en" ? (
                  <>
                    Where Tomorrow<br />
                    <span className="text-[#E3C193] font-light">Meets the Desert.</span>
                  </>
                ) : (
                  <>
                    جہاں آنے والا کل<br />
                    <span className="text-[#E3C193] font-light">صحرائے چولستان سے ملتا ہے۔</span>
                  </>
                )}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8 text-xs font-mono tracking-widest text-[#FDFBF7]/60"
            >
              <div className="flex items-center space-x-2">
                <Compass size={14} className="text-champagne animate-spin-slow" />
                <span>LAT: 28.4212° N / LONG: 70.2989° E</span>
              </div>
              <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-[#E3C193]"></div>
              <div>SOUTHERN PUNJAB, PAKISTAN</div>
            </motion.div>
          </div>

          {/* Frosted Glass Floating Panel */}
          <div className="hidden lg:flex col-span-4 justify-end">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel w-[320px] h-[460px] rounded p-10 flex flex-col justify-between relative overflow-hidden group shadow-3xl"
            >
              {/* Highlight flare effect inside glass */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none transition-transform duration-[2000ms] group-hover:translate-x-full" />
              
              <div className="space-y-6">
                <span className="text-[10px] font-mono text-champagne uppercase tracking-[0.3em] block border-b border-white/5 pb-2">
                  STRUCTURAL MANIFESTO — 001
                </span>
                <p className="text-sm font-light text-ivory/80 leading-relaxed font-sans">
                  Tabraiz Town represents a permanent premium monolith structure underwritten for multi-generational wealth preservation in Rahim Yar Khan.
                </p>
              </div>

              <div className="flex justify-between items-end border-t border-white/10 pt-6">
                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-ivory/40 uppercase block tracking-wider">Underwriter</span>
                  <span className="text-xs font-mono text-champagne font-medium">MCK-RYK-2026</span>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[8px] font-mono text-ivory/40 uppercase block tracking-wider">Discretion parity</span>
                  <span className="text-xs font-mono text-ivory font-medium">Class A+ SECURE</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll action down */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="relative z-10"
        >
          <div className="flex items-center space-x-8">
            <button
              onClick={() => {
                const el = document.getElementById("vision");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex flex-col items-center justify-center text-xs uppercase tracking-[0.25em] text-[#FDFBF7]/60 hover:text-[#E3C193] transition-colors duration-500 cursor-pointer group space-y-2 py-4"
            >
              <span>{t.explore}</span>
              <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform duration-300" />
            </button>
            <button
              onClick={() => (isTourActive ? stopNarratedTour() : startNarratedTour())}
              className="flex items-center space-x-2 text-xs uppercase tracking-[0.25em] text-[#E3C193]/80 hover:text-[#E3C193] transition-colors duration-500 cursor-pointer border border-[#E3C193]/25 hover:border-[#E3C193]/60 rounded-full px-5 py-2.5"
            >
              {isTourActive ? <Square size={11} /> : <Play size={11} />}
              <span>{isTourActive ? (lang === "en" ? "End Tour" : "ٹور ختم کریں") : (lang === "en" ? "Narrated Tour" : "صوتی ٹور")}</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* Module 01: The Core Vision & Demographic Pivot */}
      <section
        id="vision"
        className="min-h-screen w-full flex items-center justify-center px-6 md:px-12 py-32 transition-colors duration-1000 relative overflow-hidden"
      >
        {/* Glow Orb backdrops to support frosted glass visual depth */}
        {theme === "graphite" ? (
          <div className="glass-glow-orb -top-24 -left-24 opacity-75" />
        ) : (
          <div className="glass-glow-orb-light -top-24 -left-24 opacity-75" />
        )}

        <div className="w-full max-w-7xl mx-auto grid grid-cols-12 gap-y-16 md:gap-x-12 relative z-10">
          {/* Vertical indicator */}
          <div className="col-span-12 md:col-span-4 flex flex-col justify-between text-left space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.35em] text-champagne font-mono font-medium">
                {t.visionHeader}
              </p>
              <h3 className="text-2xl md:text-3xl font-serif font-extralight tracking-wide leading-tight">
                {t.visionTitle}
              </h3>
            </div>
            <div className="border-t border-champagne/20 pt-8 mt-4 hidden md:block">
              <p className="text-xs font-mono text-champagne tracking-widest uppercase mb-4">[ KEY STRATEGIC DRIVERS ]</p>
              <div className="space-y-3 text-[11px] font-mono uppercase tracking-wider opacity-60">
                <div className="flex justify-between">
                  <span>AGRITECH FLUID PIVOT</span>
                  <span className="text-champagne">▲ 18.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>GEN-WEALTH ASSET SHIELD</span>
                  <span className="text-champagne">SECURE</span>
                </div>
                <div className="flex justify-between">
                  <span>INSTITUTIONAL GRADE</span>
                  <span className="text-champagne">TIER-1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Essay Narrative with intense negative space */}
          <div className="col-span-12 md:col-span-8 md:pl-12 flex flex-col justify-center space-y-8 text-left">
            <p className="text-lg md:text-2xl font-serif leading-relaxed tracking-wide font-extralight opacity-80">
              {t.visionBody}
            </p>
            <blockquote className="border-l-2 border-champagne pl-6 py-2">
              <p className="text-sm md:text-base italic font-serif font-light text-champagne opacity-80">
                "{t.visionQuote}"
              </p>
            </blockquote>

            {/* Quick Interactive Selector of sub-chapters (IDEO UX style) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
              {[
                {
                  title: "Sovereign Preservation",
                  desc: "Securing agricultural land yield reserves against inflation peaks.",
                  stat: "+240 bps alpha"
                },
                {
                  title: "Urban Consolidation",
                  desc: "Providing Rahim Yar Khan with international tier physical security.",
                  stat: "Tier-1 Shield"
                },
                {
                  title: "Vertical Integration",
                  desc: "Maximizing land area via hyper-designed high-rise modular planning.",
                  stat: "30 Kanal Monolith"
                }
              ].map((card, idx) => (
                <div
                  key={idx}
                  className={`p-6 flex flex-col justify-between rounded shadow-sm ${
                    theme === "graphite"
                      ? "glass-panel glass-card-interactive text-ivory border-white/5"
                      : "glass-panel-light glass-card-interactive-light text-graphite border-graphite/5"
                  }`}
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-champagne">01.{idx + 1}</span>
                    <h5 className="font-serif text-sm font-semibold">{card.title}</h5>
                    <p className="text-xs opacity-60 font-light leading-relaxed">{card.desc}</p>
                  </div>
                  <div className="text-[10px] font-mono text-champagne tracking-widest uppercase mt-6 pt-2 border-t border-champagne/10">
                    {card.stat}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
        </>
      )}

      {/* Module 02: The Architectural Monolith & Elevation Parallax */}
      {activePage === "architecture" && (
        <>
          {renderPageBanner(
            ASSET("images/tabraiz_hero_boulevard_entrance.png"),
            lang === "en" ? "02 / 07 — Architecture" : "۰۲ / ۰۷ — فنِ تعمیر",
            <>Form Carved<br /><span className="text-[#E3C193] font-light">From the Desert.</span></>,
            <>صحرا سے تراشی گئی<br /><span className="text-[#E3C193] font-light">ایک عظیم ہیئت۔</span></>
          )}
          <section
            id="elevation"
        className={`w-full py-24 md:py-32 px-6 md:px-12 border-t transition-all duration-1000 relative z-10 ${
          theme === "graphite" ? "bg-ivory text-graphite border-black/5" : "bg-graphite text-ivory border-white/5"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto space-y-12">
          
          {/* Header Segment with elegant view tabs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end text-left pb-4 border-b border-current/10">
            <div className="col-span-12 md:col-span-7 space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] text-champagne font-mono font-semibold">
                {lang === "en" ? "02 / 07 — INTERACTIVE ARCHITECTURAL EXPLORER" : "۰۲ / ۰۷ — انٹرایکٹو تعمیری جائزہ"}
              </span>
              <h2 className="text-2xl md:text-4xl font-serif font-extralight tracking-wide">
                {lang === "en" ? "The Tabraiz Vertical Monolith" : "تبریز عمودی مینارِ بلند"}
              </h2>
            </div>
            
            <div className="col-span-12 md:col-span-5 flex md:justify-end gap-3 font-mono text-xs">
              <button
                onClick={() => setActiveModule02View("3d")}
                className={`px-4 py-2 border uppercase tracking-wider text-[10px] rounded transition-all duration-300 cursor-pointer ${
                  activeModule02View === "3d"
                    ? "bg-champagne border-champagne text-black font-semibold shadow-lg"
                    : "border-current/10 hover:border-current/35 text-current/80"
                }`}
              >
                {lang === "en" ? "[ 3D WebGL Monolith Model ]" : "[ تھری ڈی انٹرایکٹو ماڈل ]"}
              </button>
              <button
                onClick={() => setActiveModule02View("parallax")}
                className={`px-4 py-2 border uppercase tracking-wider text-[10px] rounded transition-all duration-300 cursor-pointer ${
                  activeModule02View === "parallax"
                    ? "bg-champagne border-champagne text-black font-semibold shadow-lg"
                    : "border-current/10 hover:border-current/35 text-current/80"
                }`}
              >
                {lang === "en" ? "[ Parallax Image Scan ]" : "[ پینورامک فوٹو سکین ]"}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeModule02View === "3d" ? (
              <motion.div
                key="3d-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="w-full"
              >
                <MonolithViewer3D theme={theme} lang={lang} />
              </motion.div>
            ) : (
              <motion.div
                key="parallax-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-12 gap-12 items-center"
              >
                {/* Left Side: Parallax Image Explorer */}
                <div className="col-span-12 lg:col-span-7 flex flex-col space-y-6 text-left">
                  <div 
                    className="relative aspect-[16/10] w-full overflow-hidden cursor-crosshair group shadow-2xl rounded-sm"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    id="parallax-frame"
                  >
                    {/* Floating micro coordinate lines with premium Frosted Glass HUD chips */}
                    <div className="absolute top-4 left-4 z-20 font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded glass-panel text-white/90 border-white/10 shadow-lg flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse"></span>
                      <span>SCAN: ACTIVE</span>
                    </div>
                    <div className="absolute top-4 right-4 z-20 font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded glass-panel text-champagne border-white/10 shadow-lg">
                      X: {(mousePosition.x * 100).toFixed(0)} // Y: {(mousePosition.y * 100).toFixed(0)}
                    </div>
                    <div className="absolute bottom-4 left-4 z-20 font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded glass-panel text-white/60 border-white/10 shadow-lg">
                      LAT: 28.4212° N
                    </div>
                    <div className="absolute bottom-4 right-4 z-20 font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded glass-panel text-white/60 border-white/10 shadow-lg">
                      LONG: 70.2989° E
                    </div>

                    {/* Dynamic mouse parallax rendering */}
                    <div 
                      className="w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
                      style={{
                        transform: `translate3d(${mousePosition.x * 20}px, ${mousePosition.y * 20}px, 0) scale(1.05)`
                      }}
                    >
                      <div className="absolute inset-0 bg-[#1C1A17]/10 group-hover:bg-transparent transition-colors duration-700 z-10" />
                      <img
                        src={ASSET("images/tabraiz_hero_boulevard_entrance.png")}
                        alt="Tabraiz Town Main Boulevard Entrance Elevation at Golden Hour"
                        className="w-full h-full object-cover select-none filter contrast-[1.05]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] font-mono tracking-widest uppercase opacity-50">
                    * Move cursor over the monolith render to examine volumetric architectural scale.
                  </p>
                </div>

                {/* Right Side: Architectural Specifications Grid */}
                <div className="col-span-12 lg:col-span-5 lg:pl-12 space-y-8 text-left">
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-champagne font-mono font-semibold">
                      {t.archHeader}
                    </p>
                    <h3 className="text-2xl md:text-3xl font-serif font-extralight tracking-wide leading-tight">
                      {t.archTitle}
                    </h3>
                  </div>
                  
                  <p className="text-sm md:text-base opacity-80 leading-relaxed font-light">
                    {t.archBody}
                  </p>

                  {/* Spec Matrix */}
                  <div className="border-t border-current/15 pt-8 space-y-6">
                    {[
                      { label: "Vertical Scale", val: "30-Kanal Master Landmass" },
                      { label: "Structural Grid", val: "Anti-seismic reinforce high-density monolith" },
                      { label: "Micro Climate Ventilation", val: "Self-regulating aerodynamic air channels" },
                      { label: "Discretion Matrix", val: "Private dedicated vertical elevator entries" }
                    ].map((spec, index) => (
                      <div key={index} className="flex justify-between items-center text-xs border-b border-current/5 pb-3 font-mono">
                        <span className="opacity-60">{spec.label}</span>
                        <span className="font-semibold text-champagne">{spec.val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setIsRegistryOpen(true)}
                      className="inline-flex items-center space-x-3 text-xs uppercase tracking-widest font-mono text-champagne hover:text-sand transition-colors duration-300 group border-b border-champagne/40 pb-1"
                    >
                      <span>{t.archViewDrawings}</span>
                      <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* Module 02b: The Interactive 3D Master Site-Plan Map — Architectural Blocks */}
      <section
        id="masterplan"
        className={`w-full py-24 md:py-32 px-6 md:px-12 border-t transition-all duration-1000 relative z-10 ${
          theme === "graphite" ? "bg-[#0F0E0D] text-ivory border-white/5" : "bg-[#F7F6F3] text-graphite border-graphite/5"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end text-left">
            <div className="col-span-12 md:col-span-8 space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] text-champagne font-mono font-semibold">
                {lang === "en" ? "02b / 07 — INTERACTIVE SITE PLAN" : "۰۲ب / ۰۷ — انٹرایکٹو سائٹ پلان"}
              </span>
              <h2 className="text-2xl md:text-4xl font-serif font-extralight tracking-wide">
                {lang === "en" ? "Interactive 3D Cinematic Site-Plan" : "انٹرایکٹو تھری ڈی سائٹ پلان"}
              </h2>
              <p className={`text-sm md:text-base font-light max-w-2xl leading-relaxed ${theme === "graphite" ? "text-ivory/70" : "text-graphite/70"}`}>
                {lang === "en" 
                  ? "Select and inspect the primary vertical residential & corporate monoliths of Tabraiz Town. Real-time underwriting, layout configurations, and reserve profiles." 
                  : "تبریز ٹاؤن کے مختلف بلند و بالا رہائشی اور تجارتی بلاکس کا فضائی اور تفصیلی معائنہ کریں۔ ریئل ٹائم بکنگ اور تفاصیل۔"}
              </p>
            </div>
            <div className="col-span-12 md:col-span-4 flex md:justify-end gap-3 font-mono text-xs">
              {(["isometric", "topdown", "elevation"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setMapViewMode(mode)}
                  className={`px-3 py-1.5 border uppercase tracking-wider text-[10px] transition-all duration-300 rounded cursor-pointer ${
                    mapViewMode === mode
                      ? "border-champagne bg-champagne text-white"
                      : theme === "graphite"
                      ? "border-white/10 hover:border-white/30 text-white/75"
                      : "border-graphite/10 hover:border-graphite/30 text-graphite/75"
                  }`}
                >
                  {mode === "isometric" && (lang === "en" ? "3D Isometric" : "تھری ڈی")}
                  {mode === "topdown" && (lang === "en" ? "2D Top-Down" : "نقشہ")}
                  {mode === "elevation" && (lang === "en" ? "Elevation Scale" : "بلندی موازنہ")}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Core: Map + HUD Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            {/* Left Column: The Interactive SVG Canvas */}
            <div className={`lg:col-span-7 rounded border p-6 flex flex-col justify-between min-h-[450px] lg:min-h-[550px] transition-all duration-700 relative overflow-hidden ${
              theme === "graphite"
                ? "bg-[#141211]/90 border-white/5 shadow-[inset_0_1px_3px_rgba(255,255,255,0.02)]"
                : "bg-white/85 border-graphite/5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]"
            }`}>
              
              {/* Floating Blueprint Coordinates overlay */}
              <div className="absolute top-4 left-4 z-10 font-mono text-[9px] uppercase tracking-widest opacity-60 flex flex-col space-y-1">
                <span>PROJECT: TABRAIZ TOWN MASTERPLAN v4.2</span>
                <span>RENDER ENGINE: HYBRID VECTOR PERSPECTIVE</span>
                <span>COORDINATES: LAT 28.4214° N / LON 70.3110° E</span>
              </div>

              {/* Dynamic SVG Container */}
              <div className="flex-1 flex items-center justify-center relative my-6">
                <svg
                  viewBox="0 0 800 500"
                  className="w-full h-full max-h-[420px] transition-transform duration-700 select-none overflow-visible"
                >
                  {/* Defs for Linear Gradients and Neon Filters */}
                  <defs>
                    {/* Grid Pattern */}
                    <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke={theme === "graphite" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"}
                        strokeWidth="1"
                      />
                    </pattern>
                    
                    {/* Block Alpha Gradients */}
                    <linearGradient id="grad-alpha-left" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#D4B996" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#D4B996" stopOpacity="0.45" />
                    </linearGradient>
                    <linearGradient id="grad-alpha-right" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#B39775" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#B39775" stopOpacity="0.55" />
                    </linearGradient>
                    <linearGradient id="grad-alpha-top" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#F5E6D3" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#D4B996" stopOpacity="0.6" />
                    </linearGradient>

                    {/* Block Beta Gradients */}
                    <linearGradient id="grad-beta-left" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#2E2B28" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#1F1D1B" stopOpacity="0.85" />
                    </linearGradient>
                    <linearGradient id="grad-beta-right" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#1F1D1B" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#121110" stopOpacity="0.95" />
                    </linearGradient>
                    <linearGradient id="grad-beta-top" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3D3935" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#22201F" stopOpacity="0.95" />
                    </linearGradient>

                    {/* Block Gamma Gradients */}
                    <linearGradient id="grad-gamma-left" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#E0D4C3" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#E0D4C3" stopOpacity="0.5" />
                    </linearGradient>
                    <linearGradient id="grad-gamma-right" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#C4B6A4" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#C4B6A4" stopOpacity="0.6" />
                    </linearGradient>
                    <linearGradient id="grad-gamma-top" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#F2E8DB" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#D9CBBA" stopOpacity="0.6" />
                    </linearGradient>

                    {/* Block Delta Gradients */}
                    <linearGradient id="grad-delta-left" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#529471" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#529471" stopOpacity="0.5" />
                    </linearGradient>
                    <linearGradient id="grad-delta-right" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#3D7356" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#3D7356" stopOpacity="0.6" />
                    </linearGradient>
                    <linearGradient id="grad-delta-top" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#69B88E" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#458562" stopOpacity="0.6" />
                    </linearGradient>

                    {/* Glow and Shadows */}
                    <filter id="neonGlowAlpha" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Grid Background Ground plane */}
                  <rect width="800" height="500" fill="url(#gridPattern)" opacity="0.6" />

                  {/* Ground Axis Circles for aesthetic architectural blueprint layout */}
                  <g opacity="0.15" stroke={theme === "graphite" ? "#FFFFFF" : "#000000"} fill="none">
                    <circle cx="400" cy="250" r="150" strokeDasharray="3,3" />
                    <circle cx="400" cy="250" r="300" strokeDasharray="5,5" />
                    <line x1="100" y1="250" x2="700" y2="250" strokeWidth="0.5" />
                    <line x1="400" y1="50" x2="400" y2="450" strokeWidth="0.5" />
                  </g>

                  {/* ========================================================= */}
                  {/* 1. 3D ISOMETRIC VIEW MODE                                 */}
                  {/* ========================================================= */}
                  {mapViewMode === "isometric" && (
                    <g transform="translate(0, 20)">
                      {/* Tower Drawing Order: Delta -> Beta -> Alpha -> Gamma (Furthest to closest) */}

                      {/* BLOCK DELTA (The Emerald Pavilion) */}
                      <g
                        onClick={() => setActiveBlockId("delta")}
                        onMouseEnter={() => setHoveredBlockId("delta")}
                        onMouseLeave={() => setHoveredBlockId(null)}
                        className="cursor-pointer group/tower transition-all duration-300"
                      >
                        {/* Selected Indicator Base ring */}
                        {activeBlockId === "delta" && (
                          <ellipse cx="400" cy="220" rx="60" ry="30" fill="none" stroke="#69B88E" strokeWidth="2" filter="url(#neonGlowAlpha)" className="animate-pulse" />
                        )}
                        {/* Hover Ground Highlight */}
                        <polygon
                          points="360,220 400,200 440,220 400,240"
                          fill={hoveredBlockId === "delta" ? "rgba(105, 184, 142, 0.15)" : "transparent"}
                          stroke="#69B88E"
                          strokeWidth="0.5"
                          className="transition-colors duration-300"
                        />
                        {/* Block 3D body */}
                        <polygon
                          points="360,220 360,130 400,150 400,240"
                          fill="url(#grad-delta-left)"
                          stroke={activeBlockId === "delta" ? "#69B88E" : hoveredBlockId === "delta" ? "#529471" : theme === "graphite" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}
                          strokeWidth={activeBlockId === "delta" ? 1.5 : 0.5}
                          className="transition-all duration-300"
                        />
                        <polygon
                          points="400,240 400,150 440,130 440,220"
                          fill="url(#grad-delta-right)"
                          stroke={activeBlockId === "delta" ? "#69B88E" : hoveredBlockId === "delta" ? "#529471" : theme === "graphite" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}
                          strokeWidth={activeBlockId === "delta" ? 1.5 : 0.5}
                          className="transition-all duration-300"
                        />
                        <polygon
                          points="360,130 400,110 440,130 400,150"
                          fill="url(#grad-delta-top)"
                          stroke={activeBlockId === "delta" ? "#69B88E" : hoveredBlockId === "delta" ? "#529471" : theme === "graphite" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
                          strokeWidth={activeBlockId === "delta" ? 1.5 : 0.5}
                        />
                        {/* Vertical Accent Ribs */}
                        <line x1="380" y1="230" x2="380" y2="140" stroke="#69B88E" strokeWidth="0.5" opacity="0.3" />
                        <line x1="420" y1="230" x2="420" y2="140" stroke="#69B88E" strokeWidth="0.5" opacity="0.3" />

                        {/* Interactive Slide indicator ring (Active only when selected) */}
                        {activeBlockId === "delta" && (
                          <polygon
                            points={`360,${220 - (selectedMapFloor / 12) * 90} 400,${240 - (selectedMapFloor / 12) * 90} 440,${220 - (selectedMapFloor / 12) * 90} 400,${200 - (selectedMapFloor / 12) * 90}`}
                            fill="none"
                            stroke="#69B88E"
                            strokeWidth="2"
                            filter="url(#neonGlowAlpha)"
                          />
                        )}

                        {/* Text Tag */}
                        <text x="400" y="255" textAnchor="middle" className="font-mono text-[9px] font-semibold tracking-wider fill-[#69B88E] opacity-90">BLOCK DELTA</text>
                      </g>


                      {/* BLOCK BETA (The Obsidian Monolith) */}
                      <g
                        onClick={() => setActiveBlockId("beta")}
                        onMouseEnter={() => setHoveredBlockId("beta")}
                        onMouseLeave={() => setHoveredBlockId(null)}
                        className="cursor-pointer group/tower transition-all duration-300"
                      >
                        {/* Selected Indicator Base ring */}
                        {activeBlockId === "beta" && (
                          <ellipse cx="580" cy="290" rx="60" ry="30" fill="none" stroke="#D4B996" strokeWidth="2" filter="url(#neonGlowAlpha)" className="animate-pulse" />
                        )}
                        {/* Hover Ground Highlight */}
                        <polygon
                          points="540,290 580,270 620,290 580,310"
                          fill={hoveredBlockId === "beta" ? "rgba(212, 185, 150, 0.1)" : "transparent"}
                          stroke="#D4B996"
                          strokeWidth="0.5"
                          className="transition-colors duration-300"
                        />
                        {/* Block 3D body */}
                        <polygon
                          points="540,290 540,80 580,100 580,310"
                          fill="url(#grad-beta-left)"
                          stroke={activeBlockId === "beta" ? "#D4B996" : hoveredBlockId === "beta" ? "#B39775" : theme === "graphite" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
                          strokeWidth={activeBlockId === "beta" ? 1.5 : 0.5}
                          className="transition-all duration-300"
                        />
                        <polygon
                          points="580,310 580,100 620,80 620,290"
                          fill="url(#grad-beta-right)"
                          stroke={activeBlockId === "beta" ? "#D4B996" : hoveredBlockId === "beta" ? "#B39775" : theme === "graphite" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
                          strokeWidth={activeBlockId === "beta" ? 1.5 : 0.5}
                          className="transition-all duration-300"
                        />
                        <polygon
                          points="540,80 580,60 620,80 580,100"
                          fill="url(#grad-beta-top)"
                          stroke={activeBlockId === "beta" ? "#D4B996" : hoveredBlockId === "beta" ? "#B39775" : theme === "graphite" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"}
                          strokeWidth={activeBlockId === "beta" ? 1.5 : 0.5}
                        />

                        {/* Subtle Horizontal Floor Line matrix */}
                        <path
                          d="M 540,240 L 580,260 L 620,240 M 540,190 L 580,210 L 620,190 M 540,140 L 580,160 L 620,140"
                          fill="none"
                          stroke={theme === "graphite" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}
                          strokeWidth="0.5"
                        />

                        {/* Interactive Slide indicator ring */}
                        {activeBlockId === "beta" && (
                          <polygon
                            points={`540,${290 - (selectedMapFloor / 45) * 210} 580,${310 - (selectedMapFloor / 45) * 210} 620,${290 - (selectedMapFloor / 45) * 210} 580,${270 - (selectedMapFloor / 45) * 210}`}
                            fill="none"
                            stroke="#D4B996"
                            strokeWidth="2"
                            filter="url(#neonGlowAlpha)"
                          />
                        )}

                        {/* Text Tag */}
                        <text x="580" y="325" textAnchor="middle" className="font-mono text-[9px] font-semibold tracking-wider fill-champagne opacity-90">BLOCK BETA</text>
                      </g>


                      {/* BLOCK ALPHA (The Royal Pavilion) */}
                      <g
                        onClick={() => setActiveBlockId("alpha")}
                        onMouseEnter={() => setHoveredBlockId("alpha")}
                        onMouseLeave={() => setHoveredBlockId(null)}
                        className="cursor-pointer group/tower transition-all duration-300"
                      >
                        {/* Selected Indicator Base ring */}
                        {activeBlockId === "alpha" && (
                          <ellipse cx="220" cy="330" rx="60" ry="30" fill="none" stroke="#D4B996" strokeWidth="2" filter="url(#neonGlowAlpha)" className="animate-pulse" />
                        )}
                        {/* Hover Ground Highlight */}
                        <polygon
                          points="180,330 220,310 260,330 220,350"
                          fill={hoveredBlockId === "alpha" ? "rgba(212, 185, 150, 0.15)" : "transparent"}
                          stroke="#D4B996"
                          strokeWidth="0.5"
                          className="transition-colors duration-300"
                        />
                        {/* Block 3D body */}
                        <polygon
                          points="180,330 180,110 220,130 220,350"
                          fill="url(#grad-alpha-left)"
                          stroke={activeBlockId === "alpha" ? "#D4B996" : hoveredBlockId === "alpha" ? "#B39775" : theme === "graphite" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
                          strokeWidth={activeBlockId === "alpha" ? 1.5 : 0.5}
                          className="transition-all duration-300"
                        />
                        <polygon
                          points="220,350 220,130 260,110 260,330"
                          fill="url(#grad-alpha-right)"
                          stroke={activeBlockId === "alpha" ? "#D4B996" : hoveredBlockId === "alpha" ? "#B39775" : theme === "graphite" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
                          strokeWidth={activeBlockId === "alpha" ? 1.5 : 0.5}
                          className="transition-all duration-300"
                        />
                        <polygon
                          points="180,110 220,90 260,110 220,130"
                          fill="url(#grad-alpha-top)"
                          stroke={activeBlockId === "alpha" ? "#D4B996" : hoveredBlockId === "alpha" ? "#B39775" : theme === "graphite" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"}
                          strokeWidth={activeBlockId === "alpha" ? 1.5 : 0.5}
                        />

                        {/* Golden grid columns to represent absolute McKinsey structural integrity */}
                        <line x1="200" y1="340" x2="200" y2="120" stroke="#D4B996" strokeWidth="0.5" opacity="0.3" />
                        <line x1="240" y1="340" x2="240" y2="120" stroke="#D4B996" strokeWidth="0.5" opacity="0.3" />

                        {/* Interactive Slide indicator ring */}
                        {activeBlockId === "alpha" && (
                          <polygon
                            points={`180,${330 - (selectedMapFloor / 36) * 220} 220,${350 - (selectedMapFloor / 36) * 220} 260,${330 - (selectedMapFloor / 36) * 220} 220,${310 - (selectedMapFloor / 36) * 220}`}
                            fill="none"
                            stroke="#D4B996"
                            strokeWidth="2"
                            filter="url(#neonGlowAlpha)"
                          />
                        )}

                        {/* Text Tag */}
                        <text x="220" y="365" textAnchor="middle" className="font-mono text-[9px] font-semibold tracking-wider fill-champagne opacity-90">BLOCK ALPHA</text>
                      </g>


                      {/* BLOCK GAMMA (The Travertine Heights) */}
                      <g
                        onClick={() => setActiveBlockId("gamma")}
                        onMouseEnter={() => setHoveredBlockId("gamma")}
                        onMouseLeave={() => setHoveredBlockId(null)}
                        className="cursor-pointer group/tower transition-all duration-300"
                      >
                        {/* Selected Indicator Base ring */}
                        {activeBlockId === "gamma" && (
                          <ellipse cx="380" cy="410" rx="60" ry="30" fill="none" stroke="#D4B996" strokeWidth="2" filter="url(#neonGlowAlpha)" className="animate-pulse" />
                        )}
                        {/* Hover Ground Highlight */}
                        <polygon
                          points="340,410 380,390 420,410 380,430"
                          fill={hoveredBlockId === "gamma" ? "rgba(212, 185, 150, 0.15)" : "transparent"}
                          stroke="#D4B996"
                          strokeWidth="0.5"
                          className="transition-colors duration-300"
                        />
                        {/* Block 3D body */}
                        <polygon
                          points="340,410 340,220 380,240 380,430"
                          fill="url(#grad-gamma-left)"
                          stroke={activeBlockId === "gamma" ? "#D4B996" : hoveredBlockId === "gamma" ? "#B39775" : theme === "graphite" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
                          strokeWidth={activeBlockId === "gamma" ? 1.5 : 0.5}
                          className="transition-all duration-300"
                        />
                        <polygon
                          points="380,430 380,240 420,220 420,410"
                          fill="url(#grad-gamma-right)"
                          stroke={activeBlockId === "gamma" ? "#D4B996" : hoveredBlockId === "gamma" ? "#B39775" : theme === "graphite" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
                          strokeWidth={activeBlockId === "gamma" ? 1.5 : 0.5}
                          className="transition-all duration-300"
                        />
                        <polygon
                          points="340,220 380,200 420,220 380,240"
                          fill="url(#grad-gamma-top)"
                          stroke={activeBlockId === "gamma" ? "#D4B996" : hoveredBlockId === "gamma" ? "#B39775" : theme === "graphite" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"}
                          strokeWidth={activeBlockId === "gamma" ? 1.5 : 0.5}
                        />

                        {/* Interactive Slide indicator ring */}
                        {activeBlockId === "gamma" && (
                          <polygon
                            points={`340,${410 - (selectedMapFloor / 28) * 190} 380,${430 - (selectedMapFloor / 28) * 190} 420,${410 - (selectedMapFloor / 28) * 190} 380,${390 - (selectedMapFloor / 28) * 190}`}
                            fill="none"
                            stroke="#D4B996"
                            strokeWidth="2"
                            filter="url(#neonGlowAlpha)"
                          />
                        )}

                        {/* Text Tag */}
                        <text x="380" y="445" textAnchor="middle" className="font-mono text-[9px] font-semibold tracking-wider fill-champagne opacity-90">BLOCK GAMMA</text>
                      </g>
                    </g>
                  )}

                  {/* ========================================================= */}
                  {/* 2. 2D TOP-DOWN ORTHOGRAPHIC MODE                          */}
                  {/* ========================================================= */}
                  {mapViewMode === "topdown" && (
                    <g transform="translate(0, 0)" className="transition-all duration-700">
                      {/* Grid Circle radar effect */}
                      <circle cx="400" cy="250" r="180" fill="none" stroke="rgba(212,185,150,0.1)" strokeWidth="1" />
                      
                      {/* Drawing Block Footprints as flat interactive buttons */}
                      {/* Block Alpha Footprint */}
                      <g onClick={() => setActiveBlockId("alpha")} className="cursor-pointer group">
                        <rect x="220" y="160" width="100" height="100" rx="10" fill={activeBlockId === "alpha" ? "rgba(212,185,150,0.25)" : "rgba(212,185,150,0.05)"} stroke="#D4B996" strokeWidth={activeBlockId === "alpha" ? "2" : "1"} />
                        <text x="270" y="215" textAnchor="middle" className="font-sans font-medium text-xs fill-current">A</text>
                        <text x="270" y="240" textAnchor="middle" className="font-mono text-[9px] opacity-60 fill-current">ALPHA NW</text>
                      </g>

                      {/* Block Beta Footprint */}
                      <g onClick={() => setActiveBlockId("beta")} className="cursor-pointer group">
                        <rect x="480" y="140" width="120" height="120" rx="15" fill={activeBlockId === "beta" ? "rgba(212,185,150,0.25)" : "rgba(212,185,150,0.05)"} stroke="#D4B996" strokeWidth={activeBlockId === "beta" ? "2" : "1"} />
                        <text x="540" y="205" textAnchor="middle" className="font-sans font-medium text-xs fill-current">B</text>
                        <text x="540" y="230" textAnchor="middle" className="font-mono text-[9px] opacity-60 fill-current">BETA EAST</text>
                      </g>

                      {/* Block Gamma Footprint */}
                      <g onClick={() => setActiveBlockId("gamma")} className="cursor-pointer group">
                        <rect x="340" y="310" width="110" height="110" rx="12" fill={activeBlockId === "gamma" ? "rgba(212,185,150,0.25)" : "rgba(212,185,150,0.05)"} stroke="#D4B996" strokeWidth={activeBlockId === "gamma" ? "2" : "1"} />
                        <text x="395" y="370" textAnchor="middle" className="font-sans font-medium text-xs fill-current">C</text>
                        <text x="395" y="395" textAnchor="middle" className="font-mono text-[9px] opacity-60 fill-current">GAMMA SOUTH</text>
                      </g>

                      {/* Block Delta Footprint */}
                      <g onClick={() => setActiveBlockId("delta")} className="cursor-pointer group">
                        <rect x="360" y="160" width="80" height="80" rx="20" fill={activeBlockId === "delta" ? "rgba(105,184,142,0.25)" : "rgba(105,184,142,0.05)"} stroke="#69B88E" strokeWidth={activeBlockId === "delta" ? "2" : "1"} />
                        <text x="400" y="205" textAnchor="middle" className="font-sans font-medium text-xs fill-current">D</text>
                        <text x="400" y="225" textAnchor="middle" className="font-mono text-[9px] opacity-60 fill-current">DELTA CORE</text>
                      </g>
                    </g>
                  )}

                  {/* ========================================================= */}
                  {/* 3. ELEVATION SCALE COMPARISON MODE                         */}
                  {/* ========================================================= */}
                  {mapViewMode === "elevation" && (
                    <g transform="translate(100, 50)" className="transition-all duration-700">
                      {/* Horizontal ground line and height limits */}
                      <line x1="0" y1="350" x2="600" y2="350" stroke={theme === "graphite" ? "white" : "black"} strokeWidth="1" />
                      <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(212,185,150,0.2)" strokeWidth="0.5" strokeDasharray="5,5" />
                      <text x="610" y="55" className="font-mono text-[8px] opacity-50 fill-current">200m (Max Elevation)</text>

                      {/* Comparative vertical bars representing blocks */}
                      
                      {/* Alpha: 36 Floors */}
                      <g onClick={() => setActiveBlockId("alpha")} className="cursor-pointer group">
                        <rect x="50" y={350 - (36/45)*280} width="60" height={(36/45)*280} fill={activeBlockId === "alpha" ? "#D4B996" : "rgba(212,185,150,0.3)"} className="transition-all duration-300" />
                        <text x="80" y="370" textAnchor="middle" className="font-mono text-[10px] fill-current">ALPHA</text>
                        <text x="80" y={340 - (36/45)*280} textAnchor="middle" className="font-mono text-[9px] font-semibold fill-champagne">36 Fl</text>
                      </g>

                      {/* Beta: 45 Floors */}
                      <g onClick={() => setActiveBlockId("beta")} className="cursor-pointer group">
                        <rect x="180" y="70" width="60" height="280" fill={activeBlockId === "beta" ? "#D4B996" : "rgba(212,185,150,0.3)"} className="transition-all duration-300" />
                        <text x="210" y="370" textAnchor="middle" className="font-mono text-[10px] fill-current">BETA</text>
                        <text x="210" y="60" textAnchor="middle" className="font-mono text-[9px] font-semibold fill-champagne">45 Fl</text>
                      </g>

                      {/* Gamma: 28 Floors */}
                      <g onClick={() => setActiveBlockId("gamma")} className="cursor-pointer group">
                        <rect x="310" y={350 - (28/45)*280} width="60" height={(28/45)*280} fill={activeBlockId === "gamma" ? "#D4B996" : "rgba(212,185,150,0.3)"} className="transition-all duration-300" />
                        <text x="340" y="370" textAnchor="middle" className="font-mono text-[10px] fill-current">GAMMA</text>
                        <text x="340" y={340 - (28/45)*280} textAnchor="middle" className="font-mono text-[9px] font-semibold fill-champagne">28 Fl</text>
                      </g>

                      {/* Delta: 12 Floors */}
                      <g onClick={() => setActiveBlockId("delta")} className="cursor-pointer group">
                        <rect x="440" y={350 - (12/45)*280} width="60" height={(12/45)*280} fill={activeBlockId === "delta" ? "#69B88E" : "rgba(105,184,142,0.3)"} className="transition-all duration-300" />
                        <text x="470" y="370" textAnchor="middle" className="font-mono text-[10px] fill-current">DELTA</text>
                        <text x="470" y={340 - (12/45)*280} textAnchor="middle" className="font-mono text-[9px] font-semibold fill-[#69B88E]">12 Fl</text>
                      </g>
                    </g>
                  )}
                </svg>
              </div>

              {/* Dynamic Bottom Compass and Map helper */}
              <div className="flex justify-between items-center text-left font-mono text-[9px] uppercase tracking-wider opacity-60">
                <div className="flex items-center space-x-2">
                  <Compass size={14} className="animate-spin-slow text-champagne" />
                  <span>ORIENT NORTH-WEST // PASSIVE WIND ORIENTATION</span>
                </div>
                <span>* CLICK BUILDING TO INSPECT SPECIFICATIONS</span>
              </div>
            </div>

            {/* Right Column: The Immersive HUD details panel */}
            <div className={`lg:col-span-5 p-8 rounded border flex flex-col justify-between text-left transition-all duration-700 relative z-10 ${
              theme === "graphite"
                ? "glass-panel-dark text-ivory border-white/5"
                : "glass-panel-light text-graphite border-graphite/5"
            }`}>
              
              {/* Core Block header */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-champagne">
                      TABRAIZ SITE COMPLIANCE PROFILE
                    </p>
                    <h3 className="text-xl md:text-2xl font-serif font-light leading-tight">
                      {BLOCKS_DATA[activeBlockId].name[lang] || BLOCKS_DATA[activeBlockId].name["en"]}
                    </h3>
                  </div>
                  <span className={`px-2.5 py-1 text-[9px] font-mono rounded uppercase tracking-wider border ${
                    activeBlockId === "delta" 
                      ? "border-[#69B88E]/30 bg-[#69B88E]/10 text-[#69B88E]" 
                      : "border-champagne/30 bg-champagne/10 text-champagne"
                  }`}>
                    {BLOCKS_DATA[activeBlockId].yield}
                  </span>
                </div>

                <p className={`text-xs font-light leading-relaxed opacity-80`}>
                  {BLOCKS_DATA[activeBlockId].desc[lang] || BLOCKS_DATA[activeBlockId].desc["en"]}
                </p>

                {/* Physical Specifications list */}
                <div className={`grid grid-cols-2 gap-4 py-4 border-t border-b ${theme === "graphite" ? "border-white/10" : "border-graphite/10"}`}>
                  <div>
                    <span className="text-[9px] font-mono text-champagne block uppercase">PHYSICAL DISPLACEMENT</span>
                    <span className="text-sm font-serif font-light">{BLOCKS_DATA[activeBlockId].floors} Storeys</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-champagne block uppercase">COORDINATE SECTOR</span>
                    <span className="text-xs font-mono font-light">{BLOCKS_DATA[activeBlockId].coordinates}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-champagne block uppercase">VALUATION HORIZON</span>
                    <span className="text-sm font-serif font-light">{BLOCKS_DATA[activeBlockId].priceRange}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-champagne block uppercase">STATUS RATING</span>
                    <span className="text-[10px] font-mono text-champagne font-semibold">{BLOCKS_DATA[activeBlockId].status[lang] || BLOCKS_DATA[activeBlockId].status["en"]}</span>
                  </div>
                </div>

                {/* Available Unit Layouts */}
                <div className="space-y-2">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-champagne">
                    {lang === "en" ? "AVAILABLE LAYOUT PLAN CONFIGURATIONS" : "دستیاب ولاز اور اپارٹمنٹس کے نقشے"}
                  </p>
                  <div className="space-y-2">
                    {(BLOCKS_DATA[activeBlockId].units[lang] || BLOCKS_DATA[activeBlockId].units["en"]).map((unit: string, idx: number) => (
                      <div key={idx} className={`p-3 text-xs font-mono flex items-center justify-between border rounded transition-all duration-300 ${
                        theme === "graphite" ? "bg-white/5 border-white/5" : "bg-graphite/5 border-graphite/5"
                      }`}>
                        <span>{unit}</span>
                        <Check size={12} className="text-champagne" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* High-tech Interactive Floor breakdown slider */}
                <div className="space-y-3 pt-3">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-champagne uppercase font-semibold">FLOOR NAVIGATOR:</span>
                    <span className="font-semibold">Storey {selectedMapFloor > BLOCKS_DATA[activeBlockId].floors ? BLOCKS_DATA[activeBlockId].floors : selectedMapFloor} of {BLOCKS_DATA[activeBlockId].floors}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={BLOCKS_DATA[activeBlockId].floors}
                    value={selectedMapFloor > BLOCKS_DATA[activeBlockId].floors ? BLOCKS_DATA[activeBlockId].floors : selectedMapFloor}
                    onChange={(e) => setSelectedMapFloor(parseInt(e.target.value))}
                    className="w-full accent-champagne cursor-pointer animate-none"
                  />
                  <div className={`p-3 text-[10px] font-mono rounded border ${
                    theme === "graphite" ? "bg-white/5 border-white/10" : "bg-graphite/5 border-graphite/10"
                  }`}>
                    <span className="text-champagne uppercase font-bold block mb-1">
                      {selectedMapFloor <= Math.ceil(BLOCKS_DATA[activeBlockId].floors / 3) && (lang === "en" ? "BASE TIER: LIFESTYLE & ATRIUM ATTRACTIONS" : "بنیادی منزلیں: جم، تفریحی کلب اور ریستوراں")}
                      {selectedMapFloor > Math.ceil(BLOCKS_DATA[activeBlockId].floors / 3) && selectedMapFloor <= Math.ceil(BLOCKS_DATA[activeBlockId].floors * 2 / 3) && (lang === "en" ? "MID TIER: PREMIUM RESIDENCES & OFFICE CAVITIES" : "درمیانی منزلیں: ایگزیکٹو دفاتر اور رہائش گاہیں")}
                      {selectedMapFloor > Math.ceil(BLOCKS_DATA[activeBlockId].floors * 2 / 3) && (lang === "en" ? "SKY TIER: EXCLUSIVE SOVEREIGN PENTHOUSES" : "اعلیٰ ترین منزلیں: شاہی پینٹ ہاؤس اور واٹر لاؤنج")}
                    </span>
                    <p className="opacity-75 leading-relaxed">
                      {selectedMapFloor <= Math.ceil(BLOCKS_DATA[activeBlockId].floors / 3) && (lang === "en" ? "Includes high-end lifestyle amenities such as our premium thermal wellness spa, private dining club, and botanical garden walkways." : "اس منزل میں جم، سوئمنگ pool، اور جدید ترین لائف اسٹائل اور آرٹ گیلری شامل ہیں۔")}
                      {selectedMapFloor > Math.ceil(BLOCKS_DATA[activeBlockId].floors / 3) && selectedMapFloor <= Math.ceil(BLOCKS_DATA[activeBlockId].floors * 2 / 3) && (lang === "en" ? "Optimal air-flow circulation and triple-glazed sound isolation shielding, ideal for high-yield professional living." : "شور سے پاک ماحول، واٹر فلٹر، اور الٹرا ایچ ڈی کھڑکیاں جو تپش سے محفوظ رکھتی ہیں۔")}
                      {selectedMapFloor > Math.ceil(BLOCKS_DATA[activeBlockId].floors * 2 / 3) && (lang === "en" ? "Breathtaking panoramic desert sunset views. Features private plunge pools, private elevator lobbies, and personal concierge services." : "بیک وقت صحرا اور نہر کا خوبصورت نظارہ، ذاتی لفٹ، اور شاہانہ چیمبرز۔")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Action Trigger */}
              <div className="pt-6">
                <button
                  onClick={() => setIsRegistryOpen(true)}
                  className="w-full py-3 bg-champagne text-white text-xs uppercase tracking-[0.2em] font-mono hover:bg-sand transition-all duration-300 rounded cursor-pointer animate-none"
                >
                  {lang === "en" ? "Secure Sovereign Reservation File" : "بلاک کی بکنگ فائل حاصل کریں"}
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>
        </>
      )}

      {/* Module 03: Materiality & Spatial Philosophy (Dual Split Sticky) */}
      {activePage === "heritage" && (
        <>
          {renderPageBanner(
            ASSET("images/derawar_fort_artwork_1783303399339.jpg"),
            lang === "en" ? "03 / 07 — Materiality & Heritage" : "۰۳ / ۰۷ — مادیت اور ورثہ",
            <>Stone, Light<br /><span className="text-[#E3C193] font-light">& Legacy.</span></>,
            <>پتھر، روشنی<br /><span className="text-[#E3C193] font-light">اور ورثہ۔</span></>
          )}
          <section
            id="materiality"
        className="min-h-screen w-full bg-graphite text-ivory relative flex flex-col lg:flex-row"
      >
        {/* Sticky Left Media Viewport */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-screen lg:sticky lg:top-0 overflow-hidden bg-[#1C1A17] flex items-center justify-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMaterial}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.65, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={materials[activeMaterial].image}
                alt={materials[activeMaterial].name}
                className="w-full h-full object-cover filter brightness-75 contrast-[1.02]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-graphite via-transparent to-transparent opacity-60" />
            </motion.div>
          </AnimatePresence>

          {/* Material Specs micro-HUD with premium Frosted Glass theme */}
          <div className="absolute bottom-8 left-8 z-10 text-left p-6 rounded glass-panel text-white border-white/10 shadow-2xl max-w-sm">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4B996] font-mono">Material Composition Spec</p>
            <h4 className="font-serif italic text-lg text-champagne font-light">
              {materials[activeMaterial].name}
            </h4>
            <div className="flex space-x-4 text-[10px] font-mono text-ivory/60 uppercase tracking-widest pt-2 mt-2 border-t border-white/10">
              <span>{materials[activeMaterial].purity}</span>
              <span>•</span>
              <span>{materials[activeMaterial].thermal}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Right Chapter Viewport */}
        <div className="w-full lg:w-1/2 px-6 md:px-16 py-24 md:py-32 space-y-24 bg-graphite text-left">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.25em] text-champagne font-mono font-medium">
              {t.materialHeader}
            </p>
            <h3 className="text-2xl md:text-4xl font-serif font-extralight tracking-wide leading-snug">
              {t.materialTitle}
            </h3>
            <p className="text-sm md:text-base opacity-60 max-w-md font-light leading-relaxed">
              {t.materialBody}
            </p>
          </div>

          {/* Interactive Material Blocks */}
          <div className="space-y-12">
            {materials.map((mat, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveMaterial(idx)}
                onClick={() => setActiveMaterial(idx)}
                className={`p-8 rounded transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer text-left ${
                  activeMaterial === idx
                    ? "glass-panel bg-champagne/10 border-champagne"
                    : "glass-panel hover:border-champagne/40"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2 max-w-md">
                    <span className="text-[11px] font-mono text-champagne">CHAPTER 03.0{idx + 1}</span>
                    <h4 className="text-xl font-serif text-ivory font-light">{lang === "en" ? mat.name : mat.nameUr}</h4>
                    <p className="text-xs md:text-sm text-ivory/75 font-light leading-relaxed pt-2">
                      {lang === "en" ? mat.desc : mat.descUr}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-champagne">
                    {idx === activeMaterial ? "[ ACTIVE ]" : `[ SELECT ]`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/5 space-y-4">
            <p className="text-xs font-mono text-champagne uppercase tracking-widest">
              [ Generational Material Ethics ]
            </p>
            <p className="text-xs opacity-50 font-light leading-relaxed max-w-md">
              Each component is chosen with absolute spatial harmony in mind. The materials interact with the intense Punjab daylight to reflect soft amber hues, ensuring the interior rooms feel calm, silent, and physically temperature-controlled.
            </p>
          </div>
        </div>
      </section>

      {/* Module 03b: The Historical Foundations — Rooted in Cholistan's Deep Heritage */}
      <section
        id="heritage"
        className={`w-full py-32 px-6 md:px-12 border-t transition-all duration-1000 relative z-10 ${
          theme === "graphite" ? "bg-[#141210] text-ivory border-white/5" : "bg-[#FAF8F5] text-graphite border-graphite/5"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto space-y-16">
          
          {/* Section Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left items-end">
            <div className="col-span-12 md:col-span-8 space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] text-champagne font-mono font-semibold block">
                {lang === "en" ? "03b / 07 — HISTORICAL FOUNDATIONS" : "۰۳ب / ۰۷ — تاریخی بنیادیں اور ورثہ"}
              </span>
              <h2 className="text-2xl md:text-4xl font-serif font-extralight tracking-wide leading-tight">
                {lang === "en" ? "Rooted in Southern Punjab's Ancient Soil" : "جنوبی پنجاب اور چولستان کے عظیم تاریخی ورثے کا تسلسل"}
              </h2>
            </div>
            <div className="col-span-12 md:col-span-4 md:text-right pb-1 font-mono text-xs text-champagne uppercase tracking-widest">
              [ {lang === "en" ? "OLD SOIL • NEW MONOLITH" : "قدیم مٹی • جدید سنگِ میل"} ]
            </div>
          </div>

          <p className="text-base md:text-xl font-serif max-w-4xl text-left leading-relaxed font-light opacity-80">
            {lang === "en"
              ? "Tabraiz Town is not an isolated architectural design; it is the spiritual successor to Rahim Yar Khan and Cholistan's monumental legacy. Our modern vertical monolith grids are inspired by the mathematical mosaics of Bhong Mosque, the monolithic mass of Derawar Fort, and the archaeological geometries of Pattan Minara."
              : "تبریز ٹاؤن کوئی ہوا میں معلق اور روایتی تعمیر نہیں ہے، بلکہ یہ رحیم یار خان اور صحرائے چولستان کے قدیم ترین اور عظیم تاریخی مقامات کا روحانی تسلسل ہے۔ ہماری عمودی تعمیر کا ہر گوشہ مسجد بھونگ کی ریاضیاتی کاشی کاری، قلعہ ڈراور کی لافانی مٹی اور پتن منارا کے قدیم ہندسی حسن سے متاثر ہے۔"}
          </p>

          {/* Site Selector Tabs */}
          <div className="flex flex-wrap gap-4 border-b pb-6 border-current/10">
            {heritageSites.map((site) => {
              const isActive = activeHeritage === site.id;
              const displayName = site.name[lang as keyof typeof site.name] || site.name["en"];
              return (
                <button
                  key={site.id}
                  onClick={() => setActiveHeritage(site.id)}
                  className={`text-xs uppercase tracking-[0.2em] font-mono py-3 px-6 border transition-all duration-500 rounded-sm cursor-pointer ${
                    isActive
                      ? "bg-champagne border-champagne text-graphite font-semibold"
                      : "border-current/10 opacity-60 hover:opacity-100"
                  }`}
                >
                  {displayName} ({site.period})
                </button>
              );
            })}
          </div>

          {/* Active Site Content (Cinema split layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
            
            {/* Left Column: Coordinates HUD & High-fidelity Render */}
            <div className="col-span-12 lg:col-span-6 space-y-4">
              <div className={`relative aspect-[3/2] w-full overflow-hidden shadow-2xl rounded border ${
                theme === "graphite" ? "border-white/10" : "border-graphite/10"
              }`}>
                {/* Micro coordinates floating overlay */}
                <div className="absolute top-4 left-4 z-20 font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded glass-panel text-white/90 border-white/10 shadow-lg flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-ping"></span>
                  <span>HISTORIC SECTOR RECONSTRUCT</span>
                </div>
                
                <AnimatePresence mode="wait">
                  {heritageSites.map((site) => {
                    if (site.id !== activeHeritage) return null;
                    return (
                      <motion.img
                        key={site.id}
                        src={site.image}
                        alt={site.name["en"]}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0 w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    );
                  })}
                </AnimatePresence>

                {/* Sub-bar coordinates */}
                <div className="absolute bottom-4 right-4 z-20 font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded glass-panel text-white/80 border-white/10 shadow-lg">
                  {heritageSites.find(s => s.id === activeHeritage)?.coordinates}
                </div>
              </div>
            </div>

            {/* Right Column: Historical Narrative & Connection */}
            <div className="col-span-12 lg:col-span-6 space-y-8 lg:pl-6">
              {heritageSites.map((site) => {
                if (site.id !== activeHeritage) return null;
                const siteName = site.name[lang as keyof typeof site.name] || site.name["en"];
                return (
                  <motion.div
                    key={site.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                      <span className="text-xs font-mono text-champagne uppercase tracking-widest block">
                        {site.purity} // {site.period}
                      </span>
                      <h4 className="text-2xl md:text-3xl font-serif font-light text-current">
                        {siteName}
                      </h4>
                    </div>

                    <p className="text-sm md:text-base font-light leading-relaxed opacity-85">
                      {site.desc[lang as keyof typeof site.desc] || site.desc["en"]}
                    </p>

                    {/* McKinsey Alignment / Structural Connection Box */}
                    <div className={`p-6 rounded border space-y-3 ${
                      theme === "graphite"
                        ? "glass-panel-dark border-white/10"
                        : "glass-panel-light border-graphite/10"
                    }`}>
                      <h5 className="text-[10px] uppercase tracking-[0.2em] font-mono text-champagne font-semibold flex items-center space-x-2">
                        <Sparkles size={12} />
                        <span>
                          {lang === "en" ? "Strategic Architectural Connection" : "مادی و تعمیری مماثلت کا ثبوت"}
                        </span>
                      </h5>
                      <p className="text-xs leading-relaxed font-light opacity-80">
                        {site.legacyConnection[lang as keyof typeof site.legacyConnection] || site.legacyConnection["en"]}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* Module 03c: The Tabraiz Anthology — High-Resolution Visual Gallery */}
      <section
        id="visual-gallery"
        className={`w-full py-24 md:py-32 px-6 md:px-12 border-t transition-all duration-1000 relative z-10 ${
          theme === "graphite" ? "bg-graphite text-ivory border-white/5" : "bg-ivory text-graphite border-graphite/5"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto space-y-16">
          
          {/* Section Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left items-end">
            <div className="col-span-12 md:col-span-8 space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-champagne font-mono font-semibold">
                {lang === "en" ? "03c / 07 — THE TABRAIZ ANTHOLOGY" : "۰۳ج / ۰۷ — تبریز انتھولوجی"}
              </p>
              <h2 className="text-2xl md:text-4xl font-serif font-extralight tracking-wide">
                {lang === "en" ? "High-Resolution Architectural & Heritage Gallery" : "مستند تعمیری اور ورثہ آرٹ گیلری"}
              </h2>
              <p className={`text-sm md:text-base font-light max-w-2xl leading-relaxed ${theme === "graphite" ? "text-ivory/70" : "text-graphite/70"}`}>
                {lang === "en"
                  ? "Explore the spatial depth and classical muses of Tabraiz Town. Hover to reveal curatorial metadata, and click to engage the immersive full-screen lightbox."
                  : "تبریز ٹاؤن کے خوبصورت تعمیری اور قدیم تاریخی ورثے کا دلکش معائنہ کریں۔ تصاویر کو بڑی سکرین پر دیکھنے کے لیے کلک کریں۔"}
              </p>
            </div>
            <div className="col-span-12 md:col-span-4 md:text-right pb-1 font-mono text-xs text-champagne uppercase tracking-widest">
              [ {lang === "en" ? "VISUAL ARCHIVE" : "بصری آرکائیو"} ]
            </div>
          </div>

          {/* Organic Masonry Photo Grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {GALLERY_ITEMS.map((item, idx) => {
              const itemTitle = item.title[lang as keyof typeof item.title] || item.title["en"];
              const itemCategory = item.category[lang as keyof typeof item.category] || item.category["en"];
              return (
                <motion.div
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={`break-inside-avoid relative overflow-hidden rounded group cursor-pointer border shadow-md transition-all duration-500 hover:shadow-2xl ${
                    theme === "graphite" ? "border-white/5 bg-[#171514]" : "border-graphite/5 bg-white"
                  }`}
                >
                  {/* Photo container with aspect-ratio */}
                  <div className={`w-full overflow-hidden relative ${item.aspect}`}>
                    <img
                      src={item.image}
                      alt={itemTitle}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105"
                    />
                    
                    {/* Artistic gradient hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-left" />
                    
                    {/* Floating zoom indicator on hover */}
                    <div className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-300 z-10">
                      <Maximize2 size={14} />
                    </div>

                    {/* Left floating category tag */}
                    <div className="absolute top-4 left-4 py-1 px-2.5 rounded text-[8px] font-mono uppercase tracking-widest bg-champagne text-graphite z-10 font-bold">
                      {itemCategory}
                    </div>

                    {/* Metadata display inside image on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-left opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-champagne/80 mb-1">
                        BY {item.credit}
                      </p>
                      <h4 className="text-base font-serif font-medium tracking-tight mb-2">
                        {itemTitle}
                      </h4>
                      <p className="text-[10px] font-mono opacity-80 uppercase tracking-widest flex items-center space-x-1">
                        <span>{lang === "en" ? "ENGAGE LIGHTBOX" : "تفصیل دیکھیں"}</span>
                        <ChevronRight size={10} />
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>
        </>
      )}

      {/* Module 03d: Sovereign Intelligence — FAQ & Live Concierge Chatbot */}
      {activePage === "intelligence" && (
        <>
          {renderPageBanner(
            ASSET("images/tabraiz_hero_courtyard_night.png"),
            lang === "en" ? "03d / 07 — Sovereign Intelligence" : "۰۳د / ۰۷ — انٹیلی جنس",
            <>Every Question,<br /><span className="text-[#E3C193] font-light">Answered with Precision.</span></>,
            <>ہر سوال کا<br /><span className="text-[#E3C193] font-light">مفصل اور درست جواب۔</span></>
          )}
          <section
            id="faq"
        className={`w-full py-24 md:py-32 px-6 md:px-12 border-t transition-all duration-1000 relative z-10 ${
          theme === "graphite" ? "bg-[#141210] text-ivory border-white/5" : "bg-[#FAF8F5] text-graphite border-graphite/5"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto space-y-16">
          
          {/* Section Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left items-end">
            <div className="col-span-12 md:col-span-8 space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-champagne font-mono font-semibold">
                {lang === "en" ? "03d / 07 — SOVEREIGN INTELLIGENCE" : "۰۳د / ۰۷ — انٹیلی جنس اور سوال و جواب"}
              </p>
              <h2 className="text-2xl md:text-4xl font-serif font-extralight tracking-wide">
                {lang === "en" ? "Frequently Answered Questions" : "عام طور پر پوچھے جانے والے سوالات"}
              </h2>
              <p className="text-xs md:text-sm font-sans font-light opacity-80 leading-relaxed max-w-xl">
                {lang === "en"
                  ? "Delve into the precise operational protocols, investment horizons, and luxury lifestyle matrices governing Tabraiz Town."
                  : "تبریز ٹاؤن کے طریقہ کار، منافع کے حصول، لائف اسٹائل اور سیکیورٹی سے متعلق تفصیلی گائیڈ لائنز۔"}
              </p>
            </div>
            <div className="col-span-12 md:col-span-4 md:text-right pb-1 font-mono text-xs text-champagne uppercase tracking-widest">
              [ {lang === "en" ? "CONCIERGE PORTAL" : "اے آئی دربار"} ]
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
            
            {/* Left Column: Accordion FAQs */}
            <div className="lg:col-span-7 space-y-4">
              {faqItems.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                const questionText = lang === "en" ? item.qEn : item.qUr;
                const answerText = lang === "en" ? item.aEn : item.aUr;
                const categoryText = lang === "en" ? item.categoryEn : item.categoryUr;
                return (
                  <div
                    key={idx}
                    className={`rounded border transition-all duration-500 overflow-hidden ${
                      theme === "graphite"
                        ? "border-white/10 bg-[#0F0E0D]"
                        : "border-graphite/10 bg-graphite/5"
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-6 text-left flex justify-between items-center space-x-4 cursor-pointer focus:outline-none"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-champagne font-semibold">
                          {categoryText}
                        </span>
                        <h4 className="text-sm md:text-base font-serif font-light">
                          {questionText}
                        </h4>
                      </div>
                      <div className={`p-1 rounded bg-current/10 transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`}>
                        <ChevronDown size={16} />
                      </div>
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className={`p-6 pt-0 text-xs md:text-sm font-light leading-relaxed border-t border-current/5 opacity-85`}>
                            {answerText}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Right Column: AI Live Concierge Q&A Chatbot */}
            <div className={`lg:col-span-5 p-6 md:p-8 rounded border shadow-xl flex flex-col justify-between relative ${
              theme === "graphite" ? "glass-panel-dark border-white/5 text-ivory" : "glass-panel-light border-graphite/5 text-graphite"
            }`}>
              <div className="space-y-6 flex flex-col h-full justify-between">
                
                {/* Header segment with Voice Translation localizer and TTS controls */}
                <div className="space-y-2 border-b border-current/10 pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2 text-champagne">
                      <Sparkles size={16} className="animate-pulse" />
                      <span className="text-[10px] font-mono uppercase tracking-[0.25em] block font-bold">
                        {lang === "en" ? "GEMINI SECURE CHAT CONCIERGE" : "جیمنی اے آئی چیمبر"}
                      </span>
                    </div>
                    
                    {/* Vocal Synthesis and STT Controls */}
                    <div className="flex items-center space-x-2 bg-current/5 p-1 rounded border border-current/10">
                      <button
                        onClick={() => {
                          setIsSpeakingEnabled(!isSpeakingEnabled);
                          triggerNotification(isSpeakingEnabled ? "Vocal concierge muted" : "Vocal concierge enabled");
                        }}
                        className={`p-1.5 rounded transition-colors duration-300 cursor-pointer ${
                          isSpeakingEnabled ? "text-champagne bg-current/10" : "opacity-50 hover:opacity-100"
                        }`}
                        title={isSpeakingEnabled ? "Mute Voice Synthesis" : "Enable Voice Synthesis"}
                      >
                        {isSpeakingEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-serif font-light text-current">
                    {lang === "en" ? "Sovereign AI Delegation Concierge" : "اے آئی مشیرِ خاص"}
                  </h3>
                  
                  {/* Dynamic Learned Session Memory indicator */}
                  <div className="pt-2">
                    <details className="group cursor-pointer">
                      <summary className="text-[9px] font-mono uppercase tracking-widest text-champagne flex items-center justify-between list-none">
                        <span className="flex items-center space-x-1 hover:underline">
                          <span>💡 {lang === "en" ? "Review Learned Intentions" : "سیکھے گئے ارادے"}</span>
                          <span className="bg-champagne/10 px-1.5 rounded text-white text-[8px] font-bold">
                            {learnedIntents.length}
                          </span>
                        </span>
                        <ChevronDown size={10} className="transition-transform duration-300 group-open:rotate-180" />
                      </summary>
                      <ul className="mt-2 p-2 bg-current/5 rounded border border-current/5 text-[9px] font-mono text-current/80 space-y-1 list-disc list-inside max-h-[100px] overflow-y-auto">
                        {learnedIntents.map((intent, i) => (
                          <li key={i} className="truncate">{intent}</li>
                        ))}
                      </ul>
                    </details>
                  </div>
                </div>

                 {/* THREADED MESSAGES VIEWPORT */}
                <div className={`my-4 p-4 rounded text-xs leading-relaxed font-light border flex-1 h-[260px] overflow-y-auto space-y-3 scrollbar-thin ${
                  theme === "graphite" ? "bg-[#0A0908] border-white/10" : "bg-white/45 border-graphite/5"
                }`}>
                  {chatMessages.map((msg: any, idx) => {
                    const isAi = msg.sender === "ai";
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col max-w-[85%] ${isAi ? "self-start text-left mr-auto" : "self-end text-right ml-auto"}`}
                      >
                        <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest mb-0.5 px-1 block">
                          {isAi ? (lang === "en" ? "Tabraiz AI Concierge" : "اے آئی مشیر") : (lang === "en" ? "Delegate" : "سرمایہ کار")} — {msg.timestamp}
                        </span>
                        <div                         className={`p-3 rounded text-xs ${
                          isAi 
                            ? (theme === "graphite" ? "bg-[#11100E] border border-white/10 text-ivory/95" : "bg-graphite/5 border border-graphite/5 text-graphite/95")
                            : "bg-champagne text-black font-normal shadow-sm"
                        }`}>
                          {isAi && msg.isTypingEffectActive ? (
                            <TypewriterText 
                              text={msg.text} 
                              onComplete={() => {
                                setChatMessages(prev => prev.map((m, i) => i === idx ? { ...m, isTypingEffectActive: false } : m));
                              }}
                            />
                          ) : (
                            <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {isFaqLoading && (
                    <div className="flex flex-col items-center justify-center py-6 space-y-2">
                      <Compass className="animate-spin text-champagne" size={18} />
                      <p className="font-mono text-[8px] uppercase tracking-widest text-champagne/70 animate-pulse">Consulting ledger algorithms...</p>
                    </div>
                  )}
                </div>

                {/* Input Controls Form with Mic Dictation integrated */}
                <form onSubmit={handleAskFaq} className="space-y-3 pt-3 border-t border-current/10">
                  <div className="relative flex items-center">
                    
                    {/* Microphone dictate button */}
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`absolute left-3 p-2 rounded transition-all duration-300 cursor-pointer ${
                        isListening 
                          ? "text-red-500 bg-red-500/10 animate-pulse border border-red-500/20" 
                          : "opacity-60 hover:opacity-100 hover:text-champagne"
                      }`}
                      title={isListening ? "Listening... Click to cancel" : "Speak to Dictate Question"}
                    >
                      <span className={`relative flex h-2.5 w-2.5 ${isListening ? "inline-block" : "hidden"}`}>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                      {!isListening && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                        </svg>
                      )}
                    </button>

                    <input
                      type="text"
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      placeholder={lang === "en" ? "Speak or type your inquiry..." : "پوچھنے کے لیے یہاں لکھیں..."}
                      className={`w-full py-3.5 pl-11 pr-11 rounded text-xs font-light tracking-wide outline-none border transition-all duration-300 focus:ring-1 focus:ring-champagne/50 ${
                        theme === "graphite"
                          ? "bg-black/40 border-white/10 text-white placeholder-ivory/35 focus:border-champagne"
                          : "bg-white/80 border-graphite/10 text-graphite placeholder-graphite/45 focus:border-champagne"
                      }`}
                    />
                    
                    {/* Send button */}
                    <button
                      type="submit"
                      disabled={isFaqLoading || !userQuestion.trim()}
                      className="absolute right-2 p-2 rounded bg-champagne text-graphite hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
                    >
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </form>

              </div>
            </div>

          </div>

        </div>
      </section>
        </>
      )}

      {/* Module 04: Suite Configurations & Luxury Add-ons */}
      {activePage === "configurations" && (
        <>
          {renderPageBanner(
            ASSET("images/tabraiz_amenity_rooftop_restaurant.png"),
            lang === "en" ? "04 / 07 — Configurations & Add-ons" : "۰۴ / ۰۷ — کنفیگریشنز اور اضافہ جات",
            <>Bespoke Living<br /><span className="text-[#E3C193] font-light">& Leisure.</span></>,
            <>حسبِ منشا طرزِ زندگی<br /><span className="text-[#E3C193] font-light">اور تفریح۔</span></>
          )}
          <section
            id="configurations"
        className={`w-full py-32 px-6 md:px-12 border-t transition-all duration-1000 relative z-10 ${
          theme === "graphite" ? "bg-graphite text-ivory border-white/5" : "bg-ivory text-graphite border-graphite/5"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto space-y-16">
          
          {/* Section Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left items-end">
            <div className="col-span-12 md:col-span-8 space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-champagne font-mono font-semibold">
                {lang === "en" ? "04 / 07 — CONFIGURATIONS & ADD-ONS" : "۰۴ / ۰۷ — کنفیگریشنز اور اضافہ جات"}
              </p>
              <h2 className="text-2xl md:text-4xl font-serif font-extralight tracking-wide">
                {lang === "en" ? "Furnished Parity & Bespoke Add-ons" : "فرنشڈ بمقابلہ غیر فرنشڈ اور ایڈ آنز"}
              </h2>
            </div>
            <div className="col-span-12 md:col-span-4 md:text-right pb-1 font-mono text-xs text-champagne uppercase tracking-widest">
              [ {lang === "en" ? "BESPOKE SPACE ARCHITECTURE" : "حسبِ منشا طرزِ تعمیر"} ]
            </div>
          </div>

          <p className="text-base md:text-xl font-serif max-w-4xl text-left leading-relaxed font-light opacity-80">
            {lang === "en"
              ? "We present dynamic spatial selections engineered for the elite. From fully integrated high-concept luxury suites hand-finished by European curators to custom structural shells ready for sovereign design signatures."
              : "ہم ایلیٹ کلاس کے لیے تیار کردہ جدید ترین مادی اور فضائی انتخاب پیش کرتے ہیں۔ ان میں یورپی ماہرین کے ملمع شدہ فرنشڈ سوئٹس اور اپنی پسند کے مطابق ڈیزائن کے لیے اوپن شیل اسٹرکچرز شامل ہیں۔"}
          </p>

          {/* Interactive Toggle for Furnished vs Unfurnished */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
            
            {/* Left Box: Comparisons */}
            <div className={`lg:col-span-5 p-8 md:p-10 rounded shadow-2xl text-left border relative z-10 flex flex-col justify-between ${
              theme === "graphite" ? "glass-panel-dark border-white/10" : "glass-panel-light border-graphite/10"
            }`}>
              <div className="space-y-6">
                <div className="flex space-x-4 border-b border-white/10 pb-4">
                  <button
                    onClick={() => setActiveSuiteConfig("furnished")}
                    className={`flex-1 py-2.5 text-center text-xs uppercase tracking-widest font-mono font-semibold border rounded transition-all duration-300 cursor-pointer ${
                      activeSuiteConfig === "furnished"
                        ? "border-champagne bg-champagne text-graphite"
                        : theme === "graphite"
                          ? "border-white/10 text-ivory/60 hover:text-white"
                          : "border-graphite/10 text-graphite/60 hover:text-graphite"
                    }`}
                  >
                    {lang === "en" ? "Furnished Option" : "فرنشڈ سوئٹس"}
                  </button>
                  <button
                    onClick={() => setActiveSuiteConfig("unfurnished")}
                    className={`flex-1 py-2.5 text-center text-xs uppercase tracking-widest font-mono font-semibold border rounded transition-all duration-300 cursor-pointer ${
                      activeSuiteConfig === "unfurnished"
                        ? "border-champagne bg-champagne text-graphite"
                        : theme === "graphite"
                          ? "border-white/10 text-ivory/60 hover:text-white"
                          : "border-graphite/10 text-graphite/60 hover:text-graphite"
                    }`}
                  >
                    {lang === "en" ? "Unfurnished" : "غیر فرنشڈ"}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSuiteConfig}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full aspect-[16/9] rounded overflow-hidden border border-white/10"
                  >
                    <img
                      src={activeSuiteConfig === "furnished"
                        ? ASSET("images/tabraiz_suite_furnished.png")
                        : ASSET("images/tabraiz_suite_unfurnished.png")}
                      alt={activeSuiteConfig === "furnished" ? "Curated Italian Living Suite" : "Sovereign Structural Shell"}
                      className="w-full h-full object-cover select-none"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </motion.div>
                </AnimatePresence>

                <div className="space-y-4">
                  <h4 className="text-xl font-serif text-champagne font-light">
                    {activeSuiteConfig === "furnished"
                      ? (lang === "en" ? "Curated Italian Living Suite" : "اطالوی طرزِ زندگی کا شاہکار")
                      : (lang === "en" ? "Sovereign Structural Shell" : "اوپن ہینڈ اسٹرکچرل شیل")}
                  </h4>
                  <p className="text-xs md:text-sm font-sans font-light leading-relaxed opacity-75">
                    {activeSuiteConfig === "furnished"
                      ? (lang === "en"
                        ? "A fully-furnished, turnkey masterpiece curated by premier Italian design studios. Featuring double-height ceilings, integrated automation systems, and high-purity Travertine finishes."
                        : "اطالوی آرکیٹیکٹس کے ہاتھ سے ڈیزائن کردہ شاہکار۔ اس میں اونچی چھتیں، خودکار برقی اور حسی نظام اور عمدہ ترین ماربل شامل ہے۔")
                      : (lang === "en"
                        ? "An open-canvas shell built with ultra-high strength cement and Grade-60 steel. Allows owners to execute their own custom physical floor plans, interior paneling, and unique lighting patterns."
                        : "اعلیٰ طاقت کی کنکریٹ اور اسٹیل سے بنی کھلی فضا۔ یہ مالکان کو اپنے منفرد تعمیراتی نقشے، ڈیزائن اور پرتعیش فنشنگ خود نافذ کرنے کی اجازت دیتا ہے۔")}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-current/10">
                  {(activeSuiteConfig === "furnished"
                    ? [
                        { label: lang === "en" ? "Furnishing Source" : "فرنیچر کا معیار", val: lang === "en" ? "Curated Milan & Florence Imports" : "درآمد شدہ اطالوی فرنیچر" },
                        { label: lang === "en" ? "Fittings & Sanitary" : "سینیٹری اور فٹنگز", val: lang === "en" ? "Grohe / Kohler Premium" : "کروہی اور کوہلر مکس" },
                        { label: lang === "en" ? "Smart Home Suite" : "خودکار اسمارٹ ہوم", val: lang === "en" ? "Schneider Smart-Grid Integrated" : "شنائیڈر الیکٹرک انٹیگریٹڈ" },
                        { label: lang === "en" ? "Flooring Material" : "فرش کا میٹریل", val: lang === "en" ? "Premium Italian White Travertine" : "رومانو وائٹ تراورٹائن" }
                      ]
                    : [
                        { label: lang === "en" ? "Structural Finish" : "تعمیراتی ڈھانچہ", val: lang === "en" ? "Core and Shell Ready" : "پلستر شدہ اوپن شیل" },
                        { label: lang === "en" ? "Base Slab" : "بیس سلیب", val: lang === "en" ? "Post-Tensioned Monolithic Slab" : "اعلیٰ طاقت کی کنکریٹ" },
                        { label: lang === "en" ? "Utility Conduits" : "بجلی اور پانی کے پائپ", val: lang === "en" ? "Schneider Grade Pre-Laid Channels" : "شنائیڈر گریڈ کی وائرنگ" },
                        { label: lang === "en" ? "Customizability Level" : "تبدیلی کی گنجائش", val: lang === "en" ? "100% Spatial Flexibility" : "سو فیصد آزادی" }
                      ]
                  ).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-mono border-b border-current/5 pb-2">
                      <span className="opacity-60">{item.label}</span>
                      <span className="font-semibold text-champagne text-right">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => setIsRegistryOpen(true)}
                  className="w-full text-center text-xs uppercase tracking-[0.2em] font-semibold text-[#1C1A17] bg-champagne hover:bg-white transition-all duration-500 py-3.5 rounded"
                >
                  {lang === "en" ? "Reserve This Configuration" : "اس کنفیگریشن کی بکنگ کریں"}
                </button>
              </div>
            </div>

            {/* Right Box: Premium Add-ons / Amenities Carousel */}
            <div className={`lg:col-span-7 p-8 md:p-12 rounded shadow-2xl border text-left flex flex-col justify-between relative ${
              theme === "graphite" ? "glass-panel-dark border-white/10" : "glass-panel-light border-graphite/10"
            }`}>
              
              <div className="space-y-8">
                <div className="border-b border-white/10 pb-4">
                  <span className="text-[10px] font-mono text-champagne uppercase tracking-[0.3em] block">
                    {lang === "en" ? "AMENITY FEATURES & LUXURY ADD-ONS" : "پرتعیش اضافہ جات اور تفریحی سہولیات"}
                  </span>
                  <h3 className="text-2xl font-serif font-light mt-1 text-champagne">
                    {lang === "en" ? "High-Concept Leisure Ecosystems" : "شاندار تفریحی سہولیات کا سنگم"}
                  </h3>
                </div>

                {/* Amenity Tabs */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 0, label: lang === "en" ? "Rooftop Restaurant" : "رواف ٹاپ ریسٹورنٹ" },
                    { id: 1, label: lang === "en" ? "Executive Cinema" : "ایگزیکٹو سینما" },
                    { id: 2, label: lang === "en" ? "Gourmet Food Court" : "فوڈ کورٹ اور لاؤنج" },
                    { id: 3, label: lang === "en" ? "Kids Play Area" : "بچوں کا پلے ایریا" },
                    { id: 4, label: lang === "en" ? "Oasis Pools & Gym" : "پول اور صحت کلب" }
                  ].map((addon) => (
                    <button
                      key={addon.id}
                      onClick={() => setActiveAddon(addon.id)}
                      className={`px-3.5 py-2 text-xs font-mono border rounded transition-all duration-300 cursor-pointer ${
                        activeAddon === addon.id
                          ? "border-champagne bg-champagne/20 text-white"
                          : theme === "graphite"
                            ? "border-white/10 text-ivory/60 hover:border-white/30"
                            : "border-graphite/15 text-graphite/60 hover:border-graphite/30"
                      }`}
                    >
                      {addon.label}
                    </button>
                  ))}
                </div>

                {/* Selected Amenity Details */}
                <div className="space-y-4 pt-4 border-t border-current/10 min-h-[160px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeAddon}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-4"
                    >
                      <div className="relative w-full aspect-[16/8] rounded overflow-hidden border border-white/10">
                        <img
                          src={[
                            ASSET("images/tabraiz_amenity_rooftop_restaurant.png"),
                            ASSET("images/tabraiz_amenity_cinema.png"),
                            ASSET("images/tabraiz_amenity_food_court.png"),
                            ASSET("images/tabraiz_amenity_kids_play.png"),
                            ASSET("images/tabraiz_amenity_pools_gym.png")
                          ][activeAddon]}
                          alt={[
                            "Rooftop Restaurant",
                            "Executive Cinema",
                            "Gourmet Food Court",
                            "Kids Play Area",
                            "Oasis Pools & Gym"
                          ][activeAddon]}
                          className="w-full h-full object-cover select-none"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                      </div>
                      <h4 className="text-xl font-serif text-white font-light">
                        {[
                          lang === "en" ? "The Sky-Desert fine dining bistro" : "صحرا کے اوپر اسکائی فائن ڈائننگ",
                          lang === "en" ? "Dolby Atmos private viewing lounge" : "ڈولبی ایٹموس پرائیویٹ مووی لاؤنج",
                          lang === "en" ? "The Sovereign gourmet culinary court" : "پرتعیش بین الاقوامی فوڈ کورٹ",
                          lang === "en" ? "Interactive sensory kidminding conservatory" : "بچوں کے سیکھنے اور کھیلنے کی محفوظ جگہ",
                          lang === "en" ? "Sufi wellness spa, Hammam & infinity pools" : "صوفی ویلنس اسپا، حمام اور انفینیٹی سوئمنگ پولز"
                        ][activeAddon]}
                      </h4>
                      <p className="text-xs md:text-sm font-light leading-relaxed opacity-85">
                        {[
                          lang === "en"
                            ? "Experience haute cuisine under the desert stars on a state-of-the-art floating cantilever deck. Features curated five-course dining and panoramic 360-degree glass partitions."
                            : "چولستان کے چمکتے ستاروں تلے فائیو اسٹار اسکائی ڈائننگ کا تجربہ۔ اس میں شیشے کے پینورامک کاک ٹیل لاؤنجز اور بہترین ماحول پیش کیا گیا ہے۔",
                          lang === "en"
                            ? "An ultra-private, acoustically isolated 4K Laser Projection screening auditorium with hand-stitched leather recliners. Reserved exclusively for residents and registered executive invitees."
                            : "اعلیٰ معیار کے چمڑے کی سیٹوں اور فور کے لیزر پروجیکٹر سے لیس پرائیویٹ سینما لاؤنج۔ یہ صرف رہائشیوں اور رجسٹرڈ وی آئی پی مہمانوں کے لیے مخصوص ہے۔",
                          lang === "en"
                            ? "A double-height central pavilion hosting elite international dining concepts, paired with dry-aged steak kitchens and a private cigar humidor lounge."
                            : "بین الاقوامی شہرت یافتہ برانڈز پر مشتمل ایک پرتعیش سینٹرل ہال، جہاں لذیذ ترین کھانوں کے ساتھ ساتھ پرائیویٹ کافی شاپس بھی موجود ہیں۔",
                          lang === "en"
                            ? "A fully-supervised, clean air-purified active learning zone. Staffed with fully qualified childminding professionals to engage future generations in sensory development."
                            : "سیکورٹی سے لیس بچوں کے کھیلنے کا ہال جہاں ماہر چائلڈ مائنڈرز بچوں کے شعور کو نکھارنے کے لیے ہمہ وقت موجود رہتے ہیں۔",
                          lang === "en"
                            ? "A modern Sufi-inspired high-tier recovery complex. Includes therapeutic cold plunges, authentic Turkish hammams, and a heated infinity-edge pool spilling over sand-sculpted gardens."
                            : "انفینیٹی ایج گرم سوئمنگ پول، روایتی ترکی گرم حمام اور اعلیٰ ترین ویلنس کلب جو جسمانی اور ذہنی سکون کا حتمی ذریعہ ہے۔"
                        ][activeAddon]}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Secure Credentials Tag */}
              <div className="flex items-center space-x-3 bg-white/5 p-4 border border-white/5 rounded mt-8">
                <Layers size={16} className="text-champagne flex-shrink-0" />
                <p className="text-[10px] font-mono text-ivory/70 leading-relaxed uppercase tracking-wider">
                  {lang === "en"
                    ? "Amenities underwritten for 99.8% structural availability and guarded by absolute privacy checks."
                    : "تمام پرتعیش سہولیات سو فیصد سیکیورٹی اور انتہائی رازداری کی نگرانی میں کام کرتی ہیں۔"}
                </p>
              </div>

            </div>

          </div>

          {/* AI Plot & Suite Recommender */}
          <div className={`mt-20 p-8 md:p-12 rounded-lg border text-left space-y-8 relative overflow-hidden ${
            theme === "graphite" ? "glass-panel-dark border-white/10 text-ivory" : "glass-panel-light border-graphite/10 text-graphite"
          }`}>
            <div className="border-b border-current/10 pb-5 space-y-2">
              <span className="text-[10px] font-mono text-champagne uppercase tracking-[0.3em] block font-semibold">
                {lang === "en" ? "AI ACQUISITION ADVISOR" : "اے آئی سرمایہ کاری مشیر"}
              </span>
              <h3 className="text-2xl md:text-3xl font-serif font-light text-champagne">
                {lang === "en" ? "Find Your Perfect Position in the Master Plan" : "ماسٹر پلان میں اپنی بہترین جگہ تلاش کریں"}
              </h3>
              <p className="text-xs md:text-sm font-light opacity-70 max-w-2xl">
                {lang === "en"
                  ? "Answer three questions and our AI strategist matches you to a specific block, floor and unit category from the actual master plan — with a personalized 4-year payment schedule."
                  : "تین سوالات کے جواب دیں اور ہمارا اے آئی مشیر آپ کو اصل ماسٹر پلان کے مطابق بلاک، فلور اور یونٹ کی سفارش کرے گا — ذاتی نوعیت کے چار سالہ اقساط پلان کے ساتھ۔"}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-4 space-y-6">
                {[
                  {
                    label: lang === "en" ? "Budget Bracket" : "بجٹ کی حد",
                    value: recBudget,
                    setter: setRecBudget,
                    options: ["PKR 25 - 50 Lakh", "PKR 50 Lakh - 1 Crore", "PKR 1 - 3 Crore", "PKR 3 Crore +"]
                  },
                  {
                    label: lang === "en" ? "Primary Purpose" : "بنیادی مقصد",
                    value: recPurpose,
                    setter: setRecPurpose,
                    options: ["investment yield", "own business use", "family residence", "hybrid investment + use"]
                  },
                  {
                    label: lang === "en" ? "Asset Type" : "اثاثے کی قسم",
                    value: recAssetType,
                    setter: setRecAssetType,
                    options: ["retail shop", "corporate office", "residential apartment", "undecided"]
                  }
                ].map((field, fIdx) => (
                  <div key={fIdx} className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-widest opacity-60 block">{field.label}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {field.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => field.setter(opt)}
                          className={`px-3 py-2 text-[11px] font-mono border rounded transition-all duration-300 text-left cursor-pointer capitalize ${
                            field.value === opt
                              ? "border-champagne bg-champagne/20 text-champagne font-bold"
                              : theme === "graphite"
                                ? "border-white/10 text-ivory/70 hover:border-white/30"
                                : "border-graphite/15 text-graphite/70 hover:border-graphite/30"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={fetchRecommendation}
                  disabled={isRecLoading}
                  className="w-full text-center text-xs uppercase tracking-[0.2em] font-semibold text-[#1C1A17] bg-champagne hover:bg-white disabled:bg-champagne/50 transition-all duration-500 py-3.5 rounded flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isRecLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>{lang === "en" ? "Matching Positions..." : "بہترین جگہ تلاش کی جا رہی ہے..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>{lang === "en" ? "Get My Recommendation" : "میری سفارش حاصل کریں"}</span>
                    </>
                  )}
                </button>
              </div>

              <div className={`lg:col-span-8 p-6 rounded border font-mono text-xs leading-relaxed min-h-[280px] relative ${
                theme === "graphite" ? "bg-black/40 border-white/5" : "bg-white/40 border-graphite/5"
              }`}>
                {isRecLoading && (
                  <div className="absolute inset-0 backdrop-blur-[2px] flex flex-col justify-center items-center space-y-4 z-10">
                    <Loader2 size={32} className="text-champagne animate-spin" />
                    <p className="text-xs uppercase tracking-widest text-champagne animate-pulse font-mono">
                      {lang === "en" ? "Analyzing 218 positions across 7 blocks..." : "سات بلاکس کی ۲۱۸ پوزیشنز کا تجزیہ جاری ہے..."}
                    </p>
                  </div>
                )}
                {recResult ? (
                  <div className="space-y-4 whitespace-pre-line text-left max-h-[420px] overflow-y-auto pr-2">
                    <p className="text-[#E3C193] text-[10px] uppercase tracking-widest font-bold border-b border-white/5 pb-2">
                      [ {lang === "en" ? "PERSONALIZED ACQUISITION BRIEF" : "ذاتی سفارشی بریف"} ]
                    </p>
                    <p className="leading-relaxed opacity-90">{recResult}</p>
                    <button
                      onClick={() => setIsRegistryOpen(true)}
                      className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#1C1A17] bg-champagne hover:bg-white transition-all duration-500 py-3 px-6 rounded cursor-pointer"
                    >
                      {lang === "en" ? "Reserve This Position" : "یہ پوزیشن محفوظ کریں"}
                    </button>
                  </div>
                ) : !isRecLoading && (
                  <div className="h-full min-h-[240px] flex flex-col justify-center text-center space-y-4 text-current/40">
                    <Compass size={36} className="mx-auto text-champagne/20" />
                    <p className="text-xs uppercase tracking-widest max-w-sm mx-auto">
                      {lang === "en"
                        ? "Your tailored block, floor and payment schedule will appear here."
                        : "آپ کے لیے منتخب بلاک، فلور اور اقساط کا شیڈول یہاں ظاہر ہوگا۔"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Community Living & Lifestyle Visualizer */}
          <div className={`mt-20 p-8 md:p-12 rounded-lg border text-left space-y-12 relative overflow-hidden ${
            theme === "graphite" ? "glass-panel-dark border-white/10 text-ivory" : "glass-panel-light border-graphite/10 text-graphite"
          }`}>
            <div className={`absolute top-0 right-0 w-80 h-80 pointer-events-none rounded-full blur-3xl opacity-30 ${
              theme === "graphite" ? "bg-champagne/10" : "bg-sand/20"
            }`}></div>

            <div className="border-b border-current/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-champagne uppercase tracking-[0.3em] block font-semibold">
                  {lang === "en" ? "INTERACTIVE EXPERIENCE HUB" : "انٹرایکٹو تجرباتی مرکز"}
                </span>
                <h3 className="text-2xl md:text-3xl font-serif font-light text-champagne">
                  {lang === "en" ? "Design Your Sovereign Daily Experience" : "اپنے روزمرہ کے پرتعیش طرزِ زندگی کا خاکہ بنائیں"}
                </h3>
                <p className="text-xs md:text-sm opacity-80 font-light max-w-2xl">
                  {lang === "en" 
                    ? "Configure your private living archetype and activate elite community amenities—including gym, Turkish hammams, and exclusive lounges—to live-simulate your bespoke day at Tabraiz Town."
                    : "اپنا ذاتی لائف اسٹائل منتخب کریں اور صحت و تفریح کی پرتعیش سہولیات (جیسے جم، حمام اور کلب) کو چالو کر کے تبریز ٹاؤن میں اپنے ایک مثالی دن کا مشاہدہ کریں۔"}
                </p>
              </div>
              <div className="flex items-center space-x-2 bg-champagne/10 px-3 py-1.5 rounded border border-champagne/20">
                <Sparkles size={14} className="text-champagne animate-pulse" />
                <span className="text-[10px] font-mono tracking-wider text-champagne uppercase font-bold">
                  {lang === "en" ? "LIVE SIMULATION" : "براہِ راست نمائش"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10">
              
              {/* Left Console: Controls */}
              <div className="lg:col-span-6 space-y-8">
                
                {/* Step 1: Core Archetype Picker */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-champagne border border-champagne/30 rounded-full w-5 h-5 flex items-center justify-center font-bold">1</span>
                    <span className="text-xs font-mono uppercase tracking-widest font-semibold opacity-90">
                      {lang === "en" ? "Select Your Resident Vibe / Archetype" : "اپنے خاندانی مزاج اور لائف اسٹائل کا انتخاب کریں"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        id: "diplomat",
                        labelEn: "The Sovereign Diplomat",
                        labelUr: "اشرافیہ نیٹ ورک",
                        descEn: "Focuses on elite business circles, fine dining and cigar lounges.",
                        descUr: "ہائی پروفائل میٹنگز، اسکائی ریسٹورنٹس اور پرائیویٹ مووی لاؤنج۔",
                        preset: ["dining", "cinema", "lounge"]
                      },
                      {
                        id: "wellness",
                        labelEn: "The Wellness Purist",
                        labelUr: "صحت اور روح کا سفر",
                        descEn: "Focuses on absolute recovery, Turkish hammams, spa and high-contrast gym workouts.",
                        descUr: "صوفی ویلنس کلب، ترکی حمام اور جدید ترین فزیکل جم۔",
                        preset: ["spa", "gym", "lounge"]
                      },
                      {
                        id: "generational",
                        labelEn: "The Legacy Family",
                        labelUr: "نسل در نسل تحفظ",
                        descEn: "Designed for generational comfort, kidminding zones and private food courts.",
                        descUr: "بچوں کا لرننگ زون، خاندانی تفریحی لاؤنج اور صحت مرکز۔",
                        preset: ["cinema", "kids", "dining", "gym"]
                      }
                    ].map((archetype) => (
                      <button
                        key={archetype.id}
                        onClick={() => {
                          setSelectedLifestyle(archetype.id as any);
                          setActiveAmenities(archetype.preset);
                        }}
                        className={`p-4 rounded border text-left transition-all duration-500 cursor-pointer flex flex-col justify-between h-36 ${
                          selectedLifestyle === archetype.id
                            ? "border-champagne bg-champagne/10 shadow-lg ring-1 ring-champagne/30"
                            : theme === "graphite"
                              ? "border-white/5 bg-white/5 hover:border-white/20"
                              : "border-graphite/5 bg-graphite/5 hover:border-graphite/20"
                        }`}
                      >
                        <div className="space-y-1">
                          <span className={`text-[11px] font-mono block font-bold ${
                            selectedLifestyle === archetype.id ? "text-champagne" : "opacity-60"
                          }`}>
                            {lang === "en" ? archetype.labelEn : archetype.labelUr}
                          </span>
                          <p className="text-[10px] leading-tight font-light opacity-70 line-clamp-3">
                            {lang === "en" ? archetype.descEn : archetype.descUr}
                          </p>
                        </div>
                        {selectedLifestyle === archetype.id && (
                          <div className="flex justify-end">
                            <span className="bg-champagne text-graphite rounded-full p-0.5"><Check size={10} strokeWidth={3} /></span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Amenity Switchboard */}
                <div className="space-y-4 pt-4 border-t border-current/10">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-champagne border border-champagne/30 rounded-full w-5 h-5 flex items-center justify-center font-bold">2</span>
                    <span className="text-xs font-mono uppercase tracking-widest font-semibold opacity-90">
                      {lang === "en" ? "Customize Community Living Modules" : "تفریحی اور صحت کی سہولیات کو آن / آف کریں"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { id: "gym", label: lang === "en" ? "Monolithic Gym & Pools" : "جدید اولمپک جم اور پولز", icon: Activity },
                      { id: "spa", label: lang === "en" ? "Sufi Turkish Spa & Hammam" : "صوفی ویلنس اسپا اور حمام", icon: Smile },
                      { id: "lounge", label: lang === "en" ? "Cigar & Elixir Club Bar" : "ایلیٹ سگار اور ایلکسر لاؤنج", icon: Coffee },
                      { id: "dining", label: lang === "en" ? "Rooftop Sky-Deck Dining" : "اسکائی ڈیک فائن ڈائننگ", icon: Utensils },
                      { id: "cinema", label: lang === "en" ? "Private Dolby Cinema Lounge" : "ڈولبی ایگزیکٹو مووی لاؤنج", icon: Tv },
                      { id: "kids", label: lang === "en" ? "Sensory Kids Conservatory" : "بچوں کا پلے اینڈ لرننگ ہال", icon: Smile }
                    ].map((amenity) => {
                      const IconComponent = amenity.icon;
                      const isActive = activeAmenities.includes(amenity.id);
                      return (
                        <button
                          key={amenity.id}
                          onClick={() => {
                            if (isActive) {
                              setActiveAmenities(activeAmenities.filter(a => a !== amenity.id));
                            } else {
                              setActiveAmenities([...activeAmenities, amenity.id]);
                            }
                          }}
                          className={`p-3.5 rounded border flex items-center space-x-3 transition-all duration-300 text-left cursor-pointer ${
                            isActive
                              ? "border-champagne bg-champagne/20 text-white"
                              : theme === "graphite"
                                ? "border-white/5 bg-white/5 text-ivory/60 hover:text-white"
                                : "border-graphite/5 bg-graphite/5 text-graphite/60 hover:text-graphite"
                          }`}
                        >
                          <div className={`p-1.5 rounded ${isActive ? "bg-champagne text-graphite" : "bg-current/10"}`}>
                            <IconComponent size={14} />
                          </div>
                          <span className="text-xs font-mono truncate">{amenity.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Interactive Yield & Metric Output */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-current/10 text-center md:text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono opacity-50 block uppercase tracking-wider">
                      {lang === "en" ? "Community Score" : "کمیونٹی اسکور"}
                    </span>
                    <span className="text-2xl font-serif font-light text-champagne block">
                      {Math.round(60 + activeAmenities.length * 6.5)}%
                    </span>
                  </div>
                  <div className="space-y-1 border-l border-current/10 pl-4">
                    <span className="text-[10px] font-mono opacity-50 block uppercase tracking-wider">
                      {lang === "en" ? "Club Synergy Level" : "کلب ممبرشپ درجہ"}
                    </span>
                    <span className="text-sm font-mono font-bold text-white uppercase tracking-widest block pt-1.5">
                      {activeAmenities.length >= 5 
                        ? (lang === "en" ? "Sovereign Gold" : "شاہی گولڈ سرکل")
                        : activeAmenities.length >= 3
                          ? (lang === "en" ? "Elite Onyx" : "ایگزیکٹو اونیکس")
                          : (lang === "en" ? "Club Silver" : "بیسک سلور")}
                    </span>
                  </div>
                  <div className="space-y-1 border-l border-current/10 pl-4">
                    <span className="text-[10px] font-mono opacity-50 block uppercase tracking-wider">
                      {lang === "en" ? "Monthly Social Hours" : "متوقع سوشل گھنٹے"}
                    </span>
                    <span className="text-2xl font-serif font-light text-champagne block">
                      {activeAmenities.length * 8} Hours
                    </span>
                  </div>
                </div>

              </div>

              {/* Right Side: The Living Blueprint (The Schedule Output) */}
              <div className={`lg:col-span-6 p-6 md:p-8 rounded-lg border flex flex-col justify-between h-full min-h-[460px] ${
                theme === "graphite" ? "bg-black/30 border-white/5" : "bg-white/50 border-graphite/5"
              }`}>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-current/10 pb-4">
                    <div className="flex items-center space-x-2">
                      <Clock size={14} className="text-champagne" />
                      <span className="text-xs font-mono uppercase tracking-[0.2em] font-semibold text-champagne">
                        {lang === "en" ? "Your Bespoke Daily Blueprint" : "آپ کا ذاتی روزمرہ کا تعمیراتی شیڈول"}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono opacity-55 uppercase tracking-widest">[ 24-HOUR ROTATION ]</span>
                  </div>

                  {/* Generated Day Timeline */}
                  <div className="space-y-5">
                    <AnimatePresence mode="popLayout">
                      {[
                        // 08:00 AM Slot
                        {
                          time: "08:00 AM",
                          titleEn: "Monolithic Fitness Activation",
                          titleUr: "اولمپک صحت اور جسمانی توانائی",
                          descEn: "Start your morning with a professional cardio workout at our high-contrast Monolithic Gym and a refreshing swim in the heated pools.",
                          descUr: "اپنے دن کا آغاز فزیکل ٹرینرز کی نگرانی میں جدید اولمپک جمنازیم میں ورزش اور پرسکون سوئمنگ پول سے کریں۔",
                          requiredAmenity: "gym"
                        },
                        // 11:00 AM Slot
                        {
                          time: "11:00 AM",
                          titleEn: "Sensory Learning Conservatory",
                          titleUr: "بچوں کی تخلیقی اور جدید تعلیم",
                          descEn: "Drop your kids at the supervised Sensory Conservatory for active learning while you focus on elite family trusts coordination.",
                          descUr: "بچے کو ماہر محافظوں کی نگرانی میں چائلڈ مائنڈنگ زون میں چھوڑیں جہاں وہ کھیل کھیل میں جدید علوم سیکھتے ہیں۔",
                          requiredAmenity: "kids"
                        },
                        // 01:00 PM Slot
                        {
                          time: "01:00 PM",
                          titleEn: "Sovereign Gourmet Culinary Court",
                          titleUr: "پرتعیش خاندانی ظہرانہ اور پکوان",
                          descEn: "Enjoy elite dining concepts and chef-curated organic meals with business partners in our double-height Central Pavilion court.",
                          descUr: "انٹرنیشنل برانڈز کے لذیذ کھانوں اور اعلیٰ ذائقوں کے ساتھ اپنے کاروباری شراکت داروں کے لیے شاندار ظہرانے کا اہتمام کریں۔",
                          requiredAmenity: "dining"
                        },
                        // 04:30 PM Slot
                        {
                          time: "04:30 PM",
                          titleEn: "Sufi Turkish Hammam & Recovery",
                          titleUr: "صوفی اسپا اور روایتی ترکی گرم حمام",
                          descEn: "Unwind your muscle tension with hot stone therapies, authentic cold plunges, and absolute spiritual silence in the Sufi recovery chambers.",
                          descUr: "دن بھر کی تھکن کو مٹانے کے لیے روایتی ترکی حمام، گرم مساج اور پرسکون معالجاتی اسپا رومز کا رخ کریں۔",
                          requiredAmenity: "spa"
                        },
                        // 06:30 PM Slot
                        {
                          time: "06:30 PM",
                          titleEn: "Sunset Cigar & Elixir Lounge (The Club Bar)",
                          titleUr: "اشرافیہ سگار اور متبادل مشروبات لاؤنز",
                          descEn: "Engage in sovereign wealth discussions in our secure Club Lounge, paired with organic elixir shots and private cigar humidors.",
                          descUr: "خصوصی برانڈڈ سگار لاؤنج میں بیٹھ کر ملک کی نامور کاروباری شخصیات کے ساتھ اہم فیصلے اور خصوصی گپ شپ کریں۔",
                          requiredAmenity: "lounge"
                        },
                        // 09:00 PM Slot
                        {
                          time: "09:00 PM",
                          titleEn: "Exclusive Private Dolby Screening",
                          titleUr: "پرائیویٹ فور کے ڈولبی مووی نائٹ",
                          descEn: "Indulge in a late-night private theatrical screening with leather reclining beds, Dolby Atmos audio, and complete acoustic isolation.",
                          descUr: "اپنے قریبی دوستوں کے ساتھ ڈولبی ساؤنڈ اور اعلیٰ کوالٹی اسکرین سے مزین مووی تھیٹر کا خصوصی تجربہ حاصل کریں۔",
                          requiredAmenity: "cinema"
                        }
                      ]
                        .filter(slot => activeAmenities.includes(slot.requiredAmenity))
                        .map((slot, index) => (
                          <motion.div
                            key={slot.time}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="flex items-start space-x-4 border-l-2 border-champagne/40 pl-4 relative text-left"
                          >
                            <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-champagne"></span>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-[10px] text-champagne bg-champagne/15 px-2 py-0.5 rounded font-bold">
                                  {slot.time}
                                </span>
                                <h4 className="text-xs font-mono font-semibold text-white">
                                  {lang === "en" ? slot.titleEn : slot.titleUr}
                                </h4>
                              </div>
                              <p className="text-[11px] font-light leading-relaxed opacity-75">
                                {lang === "en" ? slot.descEn : slot.descUr}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                    </AnimatePresence>

                    {activeAmenities.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 space-y-3"
                      >
                        <Compass className="mx-auto text-champagne/40 animate-spin" size={28} />
                        <p className="text-xs font-mono opacity-50">
                          {lang === "en" 
                            ? "Please activate at least one amenity module above to model your customized daily lifestyle blueprint."
                            : "کمیونٹی لائف اسٹائل کا ڈیزائن دیکھنے کے لیے اوپر کم از کم ایک تفریحی سہولت کو چالو کریں۔"}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 mt-8 space-y-4 text-left">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="opacity-60">{lang === "en" ? "ESTIMATED ENTRANCE ACCESSIBILITY:" : "شراکت کی نوعیت:"}</span>
                    <span className="text-champagne font-bold">{lang === "en" ? "100% UNRESTRICTED FOR CO-OWNERS" : "مالکان کے لیے مکمل مفت داخلہ"}</span>
                  </div>

                  <button
                    onClick={() => {
                      setRegistryEmail("");
                      setIsRegistryOpen(true);
                    }}
                    className="w-full text-center text-xs uppercase tracking-[0.2em] font-semibold text-[#1C1A17] bg-champagne hover:bg-white transition-all duration-500 py-4 rounded shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <UserCheck size={14} />
                    <span>
                      {lang === "en" ? "Register for Private Community Pass" : "کمیونٹی اور جم پاس کے لیے رجسٹریشن کرائیں"}
                    </span>
                  </button>
                </div>

              </div>

            </div>
          </div>

          {/* AI-powered Interior Aesthetic Moodboard Customizer */}
          <div className={`mt-16 p-8 md:p-12 rounded border shadow-2xl text-left relative overflow-hidden ${
            theme === "graphite" ? "glass-panel-dark border-white/10" : "glass-panel-light border-graphite/10"
          }`}>
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#E3C193]/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="border-b border-white/10 pb-6 mb-8">
              <div className="flex items-center space-x-2 text-champagne">
                <Sparkles size={16} className="animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-semibold">
                  {lang === "en" ? "Generative Space Design" : "جنریٹو اندرونی طرزِ تعمیر"}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-light mt-2 text-champagne">
                {lang === "en" ? "AI Interior Aesthetic Moodboard" : "اے آئی اندرونی ڈیزائن کا نقشہ"}
              </h3>
              <p className="text-xs font-mono opacity-60 uppercase mt-1 tracking-wider">
                {lang === "en" ? "Collaborating with Harvics Global Ventures & Milanese Design Studios" : "میلان اور ہارس گلوبل کے مابین مشترکہ تعمیراتی شراکت"}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4 space-y-6">
                <p className="text-sm font-sans font-light leading-relaxed opacity-80">
                  {lang === "en"
                    ? "Select a curated lifestyle mood below. Our server-side Gemini AI model will instantly draft a bespoke material specification, kelvin-mapped light balance, and hand-finished furniture guidelines for your layout."
                    : "نیچے دیے گئے لائف اسٹائلز میں سے اپنی پسندیدہ تھیم منتخب کریں۔ ہمارا اے آئی نظام اطالوی سنگِ تراورٹائن، صحرائی شعاعوں اور میٹیریلز کی ایک خوبصورت ترتیب تیار کرے گا۔"}
                </p>

                <div className="space-y-3">
                  <label className="text-xs font-mono uppercase tracking-widest opacity-60 block">
                    {lang === "en" ? "Choose Lifestyle Aesthetic:" : "لائف اسٹائل تھیم منتخب کریں:"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "diplomat", labelEn: "Diplomatic Splendor", labelUr: "سفارتی شان" },
                      { id: "wellness", labelEn: "Sufi Minimalist", labelUr: "صوفیانہ سادگی" },
                      { id: "generational", labelEn: "Desert Solitude", labelUr: "صحرائی تنہائی" },
                      { id: "byzantine", labelEn: "Byzantine Opulence", labelUr: "رومی عیش" }
                    ].map((aesthetic) => (
                      <button
                        key={aesthetic.id}
                        onClick={() => setMoodboardLifestyle(aesthetic.id)}
                        className={`px-3 py-2.5 text-xs font-mono border rounded transition-all duration-300 text-left cursor-pointer ${
                          moodboardLifestyle === aesthetic.id
                            ? "border-champagne bg-champagne/20 text-white font-bold"
                            : theme === "graphite"
                              ? "border-white/10 text-ivory/70 hover:border-white/30"
                              : "border-graphite/15 text-graphite/70 hover:border-graphite/30"
                        }`}
                      >
                        <span className="block font-semibold">{aesthetic.labelEn}</span>
                        <span className="block text-[9px] opacity-60 font-serif mt-0.5">{aesthetic.labelUr}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={async () => {
                    setIsMoodboardLoading(true);
                    setMoodboardResult(null);
                    try {
                      const res = await fetch("/api/ai/moodboard", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ suiteConfig: activeSuiteConfig, lifestyle: moodboardLifestyle, lang })
                      });
                      const data = await res.json();
                      if (data.error) {
                        setMoodboardResult(data.error);
                      } else {
                        setMoodboardResult(data.text);
                      }
                    } catch (e) {
                      setMoodboardResult("Error generating mood board. Please verify connection and retry.");
                    } finally {
                      setIsMoodboardLoading(false);
                    }
                  }}
                  disabled={isMoodboardLoading}
                  className="w-full text-center text-xs uppercase tracking-[0.2em] font-semibold text-[#1C1A17] bg-champagne hover:bg-white disabled:bg-champagne/50 transition-all duration-500 py-3.5 rounded flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isMoodboardLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>{lang === "en" ? "Synthesizing..." : "بریفنگ تیار ہو رہی ہے..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>{lang === "en" ? "Generate Aesthetic Guide" : "تعمیراتی گائیڈ حاصل کریں"}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={fetchSuiteVisual}
                  disabled={isSuiteVisualLoading}
                  className={`w-full text-center text-xs uppercase tracking-[0.2em] font-semibold border transition-all duration-500 py-3.5 rounded flex items-center justify-center space-x-2 cursor-pointer ${
                    theme === "graphite"
                      ? "border-champagne/40 text-champagne hover:bg-champagne/10 disabled:opacity-50"
                      : "border-graphite/30 text-graphite hover:bg-graphite/5 disabled:opacity-50"
                  }`}
                >
                  {isSuiteVisualLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>{lang === "en" ? "Rendering Suite..." : "تصویر تیار ہو رہی ہے..."}</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 size={14} />
                      <span>{lang === "en" ? "Visualize This Suite (AI Image)" : "سوئٹ کی اے آئی تصویر بنائیں"}</span>
                    </>
                  )}
                </button>

                {suiteVisual && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="rounded overflow-hidden border border-champagne/25 shadow-2xl"
                  >
                    <img src={suiteVisual} alt="AI generated suite visualization" className="w-full h-auto" />
                    <p className="text-[8px] font-mono uppercase tracking-widest opacity-50 px-3 py-2">
                      {lang === "en" ? "AI-generated concept visual — indicative only" : "اے آئی سے تیار کردہ تصوراتی تصویر"}
                    </p>
                  </motion.div>
                )}
              </div>

              <div className={`lg:col-span-8 p-6 rounded border font-mono text-xs leading-relaxed min-h-[250px] relative flex flex-col justify-between ${
                theme === "graphite" ? "bg-black/40 border-white/5" : "bg-white/40 border-graphite/5"
              }`}>
                {isMoodboardLoading && (
                  <div className="absolute inset-0 bg-[#1C1A17]/10 backdrop-blur-[2px] flex flex-col justify-center items-center space-y-4">
                    <Loader2 size={32} className="text-champagne animate-spin" />
                    <p className="text-xs uppercase tracking-widest text-champagne animate-pulse font-mono">
                      {lang === "en" ? "Synthesizing Design Ledger..." : "تعمیراتی ڈیٹا پروسیس کیا جا رہا ہے..."}
                    </p>
                  </div>
                )}

                {moodboardResult ? (
                  <div className="space-y-4 whitespace-pre-line text-left max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
                    <p className="text-[#E3C193] text-[10px] uppercase tracking-widest font-bold border-b border-white/5 pb-2">
                      [ {lang === "en" ? "OFFICIAL GENERATED DESIGN SPECIFICATION" : "تعمیراتی اور اندرونی ہینڈ بک"} ]
                    </p>
                    <p className="leading-relaxed opacity-90"><TypewriterText text={moodboardResult} speedMultiplier={0.6} /></p>
                  </div>
                ) : (
                  <div className="my-auto text-center space-y-4 text-white/40 py-12">
                    <Compass size={36} className="mx-auto text-champagne/20 animate-spin" style={{ animationDuration: '8s' }} />
                    <p className="text-xs uppercase tracking-widest max-w-sm mx-auto">
                      {lang === "en"
                        ? "Interactive Design Engine Offline. Choose a custom theme and generate to launch spatial simulation."
                        : "اندرونی ڈیزائن کا جنریٹو اے آئی انجن آف لائن ہے۔ تھیم منتخب کر کے ڈیزائن شروع کریں۔"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Module 05: Strategic Alliances & Infrastructure */}
      <section
        id="alliances"
        className={`w-full py-32 px-6 md:px-12 border-t transition-all duration-1000 relative z-10 ${
          theme === "graphite" ? "bg-ivory text-graphite border-graphite/5" : "bg-graphite text-ivory border-white/5"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto space-y-16">
          
          {/* Section Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left items-end">
            <div className="col-span-12 md:col-span-8 space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-champagne font-mono font-semibold">
                {lang === "en" ? "05 / 07 — STRATEGIC ALLIANCES" : "۰۵ / ۰۷ — اسٹریٹجک الائنسز"}
              </p>
              <h2 className="text-2xl md:text-4xl font-serif font-extralight tracking-wide">
                {lang === "en" ? "Sovereign Infrastructure & Financial Partners" : "بنیادی ڈھانچے اور مالیاتی شراکت دار"}
              </h2>
            </div>
            <div className="col-span-12 md:col-span-4 md:text-right pb-1 font-mono text-xs text-champagne uppercase tracking-widest">
              [ {lang === "en" ? "GOLD STATUS PARTNERSHIPS" : "مستند تعمیراتی شراکت دار"} ]
            </div>
          </div>

          <p className="text-base md:text-xl font-serif max-w-4xl text-left leading-relaxed font-light opacity-80">
            {lang === "en"
              ? "Tabraiz Town is built in strategic synergy with Pakistan's premium macro-industrial brands and elite Shariah-compliant financial institutions. Providing absolute physical integrity and financial sovereignty."
              : "تبریز ٹاؤن کی تعمیر پاکستان کے مستند تعمیراتی برانڈز اور ملک کے بہترین بینکوں کے ساتھ اسٹریٹجک تعاون سے ہو رہی ہے۔ یہ بہترین معاشی لچک اور انتہائی مضبوط بنیادوں کی ضمانت ہے۔"}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
            
            {/* Left Box: Brands & Alliances */}
            <div className={`lg:col-span-7 p-8 md:p-12 rounded shadow-2xl border text-left flex flex-col justify-between relative ${
              theme === "graphite" ? "glass-panel-light border-graphite/10" : "glass-panel-dark border-white/10"
            }`}>
              
              <div className="space-y-8">
                <div className="flex space-x-4 border-b border-white/10 pb-4">
                  <button
                    onClick={() => setActiveAllianceTab("infrastructure")}
                    className={`flex-1 py-2 text-center text-xs uppercase tracking-widest font-mono font-semibold border rounded transition-all duration-300 cursor-pointer ${
                      activeAllianceTab === "infrastructure"
                        ? "border-champagne bg-champagne text-graphite"
                        : theme === "graphite"
                          ? "border-graphite/10 text-graphite/60 hover:text-graphite"
                          : "border-white/10 text-ivory/60 hover:text-white"
                    }`}
                  >
                    {lang === "en" ? "Industrial Infrastructure" : "صنعتی انفراسٹرکچر"}
                  </button>
                  <button
                    onClick={() => setActiveAllianceTab("financing")}
                    className={`flex-1 py-2 text-center text-xs uppercase tracking-widest font-mono font-semibold border rounded transition-all duration-300 cursor-pointer ${
                      activeAllianceTab === "financing"
                        ? "border-champagne bg-champagne text-graphite"
                        : theme === "graphite"
                          ? "border-graphite/10 text-graphite/60 hover:text-graphite"
                          : "border-white/10 text-ivory/60 hover:text-white"
                    }`}
                  >
                    {lang === "en" ? "Financing & Banking" : "بینکاری اور قرض کی سہولت"}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {activeAllianceTab === "infrastructure" ? (
                    <motion.div
                      key="infrastructure"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-6"
                    >
                      {/* Grid of Industrial Partners */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 border-b border-current/10 pb-4">
                          <h4 className="text-sm font-mono text-champagne uppercase tracking-wider">Premium Structural Steel</h4>
                          <p className="text-xs font-semibold text-white">Amreli Steels & Mughal Steel</p>
                          <p className="text-[11px] opacity-75 font-light">Grade 60 high-deformation resistant steel rebars providing superior anti-seismic tensile safety factors.</p>
                        </div>
                        <div className="space-y-2 border-b border-current/10 pb-4">
                          <h4 className="text-sm font-mono text-champagne uppercase tracking-wider">Sulphate-Resistant Cement</h4>
                          <p className="text-xs font-semibold text-white">Bestway, DG Khan & Maple Leaf</p>
                          <p className="text-[11px] opacity-75 font-light">Custom industrial cement designed for Cholistan's high sand-salinity and extreme solar heat indexes.</p>
                        </div>
                        <div className="space-y-2 border-b border-current/10 pb-4">
                          <h4 className="text-sm font-mono text-champagne uppercase tracking-wider">International Electric Grid</h4>
                          <p className="text-xs font-semibold text-white">Siemens, Schneider Electric & Philips</p>
                          <p className="text-[11px] opacity-75 font-light">German and French medium-voltage sub-stations, high-efficiency transformers and customized LED architectures.</p>
                        </div>
                        <div className="space-y-2 border-b border-current/10 pb-4">
                          <h4 className="text-sm font-mono text-champagne uppercase tracking-wider">Luxury Accessories & Sanitary</h4>
                          <p className="text-xs font-semibold text-white">Grohe, Kohler & Porta Ceramics</p>
                          <p className="text-[11px] opacity-75 font-light">Bespoke European bathroom water fixtures, brassware, and high-density glazed porcelain ceramics.</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="financing"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-6"
                    >
                      {/* Grid of Banking Partners */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 border-b border-current/10 pb-4">
                          <h4 className="text-sm font-mono text-champagne uppercase tracking-wider">Meezan Bank</h4>
                          <p className="text-xs font-semibold text-white">Easy Home Shariah-Compliant</p>
                          <p className="text-[11px] opacity-75 font-light">Musharakah-based high-limit home purchase models customized with flexible quarterly returns specifically for agrarian family trusts.</p>
                        </div>
                        <div className="space-y-2 border-b border-current/10 pb-4">
                          <h4 className="text-sm font-mono text-champagne uppercase tracking-wider">Bank Alfalah</h4>
                          <p className="text-xs font-semibold text-white">Alfa Executive Mortgage Plan</p>
                          <p className="text-[11px] opacity-75 font-light">Home financing options with low markups and structured balloon payments matching annual agricultural harvesting seasons.</p>
                        </div>
                        <div className="space-y-2 border-b border-current/10 pb-4">
                          <h4 className="text-sm font-mono text-champagne uppercase tracking-wider">Habib Bank Limited (HBL)</h4>
                          <p className="text-xs font-semibold text-white">HBL Prestige Priority Mortgage</p>
                          <p className="text-[11px] opacity-75 font-light">Elite high-tier custom loans up to 15 Crore with automated wealth division services and private banker alignment.</p>
                        </div>
                        <div className="space-y-2 border-b border-current/10 pb-4">
                          <h4 className="text-sm font-mono text-champagne uppercase tracking-wider">MCB Bank</h4>
                          <p className="text-xs font-semibold text-white">Private Wealth Capital Loans</p>
                          <p className="text-[11px] opacity-75 font-light">Bespoke liquidity swaps on land preservation. Shielded transactions backed by premium localized land assets in Rahim Yar Khan.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Partner Badges row */}
              <div className="pt-8 border-t border-white/10 mt-6 grid grid-cols-4 gap-4 text-center items-center">
                {["AMRELI", "SIEMENS", "MEEZAN", "GROHE"].map((badge, idx) => (
                  <div key={idx} className="bg-white/5 py-2.5 rounded border border-white/5 font-mono text-[9px] uppercase tracking-widest text-[#E3C193] font-bold">
                    {badge}
                  </div>
                ))}
              </div>

            </div>

            {/* Right Box: Dynamic Installment plans tied to Calculator Scale state */}
            <div className={`lg:col-span-5 p-8 md:p-10 rounded shadow-2xl border text-left flex flex-col justify-between relative ${
              theme === "graphite" ? "glass-panel-light border-graphite/10" : "glass-panel-dark border-white/10"
            }`}>
              
              <div className="space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <span className="text-[10px] font-mono text-champagne uppercase tracking-[0.35em] block">
                    {lang === "en" ? "MILESTONE PAYMENTS & DEFERMENTS" : "توسیعی ادائیگیوں کا شیڈول"}
                  </span>
                  <h3 className="text-xl font-serif text-white font-light mt-1">
                    {lang === "en" ? "4-Year Sovereign Installment Plan" : "۴ سالہ توسیعی اقساط کا پلان"}
                  </h3>
                </div>

                <div className="bg-white/5 p-4 rounded border border-white/5 space-y-2">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="opacity-60">{lang === "en" ? "ACTIVE SIMULATOR SCALE:" : "فعال اثاثہ سائز:"}</span>
                    <span className="text-champagne font-bold">{underwritingData.initialPKR}</span>
                  </div>
                  <p className="text-[10px] font-mono text-ivory/50 leading-relaxed uppercase">
                    * Calculated live matching the simulator's scale above. Change scale on Simulator to instantly model installment values.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Milestones */}
                  {[
                    {
                      num: "01",
                      title: lang === "en" ? "Reservation Deposit (15%)" : "ریزرویشن ایڈوانس (15%)",
                      desc: lang === "en" ? "Secures vertical positioning and priority floor" : "سوئٹ اور فلور کی ترجیحی بکنگ کے لیے",
                      val: (scale === "1k" ? 0.225 : scale === "5k" ? 1.05 : scale === "10k" ? 2.025 : 5.85).toFixed(3) + " Crore"
                    },
                    {
                      num: "02",
                      title: lang === "en" ? "Excavation & Shoring (15%)" : "کھدائی اور فاؤنڈیشن (15%)",
                      desc: lang === "en" ? "Charged upon monolithic foundation pour" : "بنیادوں اور ڈھانچے کا کام شروع ہونے پر",
                      val: (scale === "1k" ? 0.225 : scale === "5k" ? 1.05 : scale === "10k" ? 2.025 : 5.85).toFixed(3) + " Crore"
                    },
                    {
                      num: "03",
                      title: lang === "en" ? "12 Quarterly Payments (30% total)" : "۱۲ سہ ماہی اقساط (کل 30%)",
                      desc: lang === "en" ? "Distributed structure across structural builds" : "ہر سہ ماہی پر قابلِ ادائیگی قسط",
                      val: scale === "1k" ? "3.75 Lakh / Qtr" : scale === "5k" ? "17.5 Lakh / Qtr" : scale === "10k" ? "33.75 Lakh / Qtr" : "97.5 Lakh / Qtr"
                    },
                    {
                      num: "04",
                      title: lang === "en" ? "Bespoke Interior Fitting (20%)" : "اندرونی مادی آرائش (20%)",
                      desc: lang === "en" ? "Milestone matching custom space architecture" : "فنِ تعمیر اور سینیٹری آرائش کے وقت",
                      val: (scale === "1k" ? 0.30 : scale === "5k" ? 1.40 : scale === "10k" ? 2.70 : 7.80).toFixed(2) + " Crore"
                    },
                    {
                      num: "05",
                      title: lang === "en" ? "Handover & Title Deed (20%)" : "قبضہ اور حتمی ہینڈ اوور (20%)",
                      desc: lang === "en" ? "Vested upon registered physical possession" : "رجسٹری اور قبضہ منتقل ہونے پر",
                      val: (scale === "1k" ? 0.30 : scale === "5k" ? 1.40 : scale === "10k" ? 2.70 : 7.80).toFixed(2) + " Crore"
                    }
                  ].map((milestone) => (
                    <div key={milestone.num} className="flex items-start space-x-3 border-b border-white/5 pb-3">
                      <span className="font-mono text-xs text-champagne bg-white/5 px-2 py-0.5 rounded mt-0.5">{milestone.num}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs font-mono font-semibold text-white">
                          <span>{milestone.title}</span>
                          <span className="text-champagne">{milestone.val}</span>
                        </div>
                        <p className="text-[10px] font-light opacity-60 truncate">{milestone.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              <div className="pt-6">
                <button
                  onClick={() => setIsRegistryOpen(true)}
                  className="w-full text-center text-xs uppercase tracking-[0.2em] font-semibold text-[#1C1A17] bg-champagne hover:bg-white transition-all duration-500 py-3 rounded"
                >
                  {lang === "en" ? "Initiate Customized Financing Brief" : "حسبِ منشا فنانسنگ بریفنگ شیڈول کریں"}
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>
        </>
      )}

      {/* Module 06: McKinsey Investment Underwriting & Yield Simulator */}
      {activePage === "metrics" && (
        <>
          {renderPageBanner(
            ASSET("images/tabraiz_hero_aerial_dusk.png"),
            lang === "en" ? "06 / 07 — Investment Metrics" : "۰۶ / ۰۷ — سرمایہ کاری کے اعداد و شمار",
            <>The Yield<br /><span className="text-[#E3C193] font-light">Horizon.</span></>,
            <>منافع کا<br /><span className="text-[#E3C193] font-light">افق۔</span></>
          )}
          <section
            id="metrics"
        className="min-h-screen w-full bg-ivory text-graphite px-6 md:px-12 py-32 flex items-center border-t border-graphite/5 relative"
      >
        <div className="w-full max-w-7xl mx-auto space-y-16">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left items-end">
            <div className="col-span-12 md:col-span-8 space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-champagne font-mono font-semibold">
                {t.investmentHeader}
              </p>
              <h2 className="text-2xl md:text-4xl font-serif font-extralight tracking-wide">
                {t.investmentTitle}
              </h2>
            </div>
            <div className="col-span-12 md:col-span-4 md:text-right pb-1">
              <p className="text-xs font-mono text-champagne uppercase tracking-widest">
                [ MCKINSEY REGIONAL FRAMEWORK ]
              </p>
            </div>
          </div>

          <p className="text-base md:text-xl font-serif max-w-4xl text-left leading-relaxed font-light opacity-80">
            {t.investmentBody}
          </p>

          {/* Interactive Yield Calculator Tool */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
            
            {/* Control Form Column with Frosted Glass theme */}
            <div className="lg:col-span-5 glass-panel-dark text-ivory p-8 md:p-10 rounded shadow-3xl space-y-8 text-left border border-white/5 relative z-10">
              <div className="space-y-2 border-b border-white/10 pb-4">
                <div className="flex items-center space-x-2 text-champagne">
                  <Calculator size={16} />
                  <h4 className="text-xs uppercase tracking-widest font-mono font-semibold">
                    {t.calculatorTitle}
                  </h4>
                </div>
                <p className="text-[11px] opacity-60 font-light font-sans">
                  {t.calculatorDesc}
                </p>
              </div>

              {/* Asset Scale Input */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-mono text-champagne block">
                  {t.unitSize}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "1k", label: "1-Kanal Commercial Suite", val: "1.5 Crore Base" },
                    { id: "5k", label: "5-Kanal Sky Residence", val: "7.0 Crore Base" },
                    { id: "10k", label: "10-Kanal Penthouse Monolith", val: "13.5 Crore Base" },
                    { id: "30k", label: "30-Kanal Family Estate", val: "39.0 Crore Base" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setScale(item.id)}
                      className={`p-3 text-left border rounded transition-all duration-300 cursor-pointer ${
                        scale === item.id
                          ? "border-champagne bg-champagne/20 text-white"
                          : "border-white/15 text-ivory/60 hover:border-white/30"
                      }`}
                    >
                      <p className="text-xs font-medium font-serif">{item.label}</p>
                      <p className="text-[9px] font-mono text-champagne mt-1">{item.val}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Holding Period Input */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-mono text-champagne block">
                  {t.horizon} ({horizonYears} Years)
                </label>
                <div className="flex space-x-3">
                  {[5, 10, 20].map((year) => (
                    <button
                      key={year}
                      onClick={() => setHorizonYears(year)}
                      className={`flex-1 py-2 text-center text-xs font-mono border rounded transition-all duration-300 cursor-pointer ${
                        horizonYears === year
                          ? "border-champagne bg-champagne text-graphite font-bold"
                          : "border-white/15 text-ivory/60 hover:border-white/30"
                      }`}
                    >
                      {year} Years
                    </button>
                  ))}
                </div>
              </div>

              {/* Capital Origin Input */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-mono text-champagne block">
                  {t.fundingSource}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "agri", label: "Agribusiness Reserves" },
                    { id: "corporate", label: "Corporate Treasury" },
                    { id: "discretionary", label: "Family Trust" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCapitalSource(item.id)}
                      className={`py-2 px-1 text-center text-[10px] font-mono border rounded transition-all duration-300 cursor-pointer ${
                        capitalSource === item.id
                          ? "border-champagne bg-champagne/20 text-white"
                          : "border-white/15 text-ivory/60 hover:border-white/30"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secure Credentials Tag */}
              <div className="flex items-center space-x-3 bg-white/5 p-4 border border-white/5 rounded">
                <Shield size={16} className="text-champagne flex-shrink-0" />
                <p className="text-[10px] font-mono text-ivory/70 leading-relaxed uppercase tracking-wider">
                  Calculated using verified Pakistani macroeconomic trends and regional soil capitalization curves.
                </p>
              </div>
            </div>

            {/* Visual Output Dashboard Column with dynamic Frosted Glass theme */}
            <div className={`lg:col-span-7 flex flex-col justify-between p-8 md:p-12 text-left shadow-2xl rounded space-y-8 border transition-all duration-700 relative z-10 ${
              theme === "graphite"
                ? "glass-panel-dark text-ivory border-white/5"
                : "glass-panel-light text-graphite border-graphite/5"
            }`}>
              
              {/* McKinsey Tab Switcher for Wealth Compounding vs Solar Parity */}
              <div className="flex border-b border-current/10 pb-4 justify-between items-center">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveUnderwritingTab("compounding")}
                    className={`text-xs uppercase tracking-widest font-mono pb-2 transition-all duration-300 relative cursor-pointer ${
                      activeUnderwritingTab === "compounding"
                        ? "text-champagne border-b-2 border-champagne font-bold"
                        : "opacity-50 hover:opacity-100 text-current"
                    }`}
                  >
                    {lang === "en" ? "Wealth Compounding" : "دولت میں اضافہ"}
                  </button>
                  <button
                    onClick={() => setActiveUnderwritingTab("solar")}
                    className={`text-xs uppercase tracking-widest font-mono pb-2 transition-all duration-300 relative cursor-pointer flex items-center space-x-1.5 ${
                      activeUnderwritingTab === "solar"
                        ? "text-champagne border-b-2 border-champagne font-bold"
                        : "opacity-50 hover:opacity-100 text-current"
                    }`}
                  >
                    <span>{lang === "en" ? "Solar & Architectural Parity" : "سولر اور تعمیراتی فہم"}</span>
                    <span className="bg-emerald-500/15 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded font-mono animate-pulse">40% Savings</span>
                  </button>
                </div>
                <div className="hidden sm:block text-[9px] font-mono opacity-50 uppercase tracking-widest">
                  [ Live Underwriting Engine ]
                </div>
              </div>

              {activeUnderwritingTab === "compounding" ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Projected ARR Display */}
                    <div className={`space-y-2 border-b pb-6 ${theme === "graphite" ? "border-white/10" : "border-graphite/10"}`}>
                      <p className={`text-[11px] font-mono uppercase tracking-widest ${theme === "graphite" ? "text-ivory/50" : "text-graphite/50"}`}>
                        {t.projectedYield}
                      </p>
                      <div className="flex items-baseline space-x-2">
                        <span className={`text-4xl md:text-5xl font-serif font-bold ${theme === "graphite" ? "text-champagne" : "text-graphite"}`}>
                          {underwritingData.arr}%
                        </span>
                        <span className="text-xs font-mono text-champagne uppercase font-medium">ARR Project Matrix</span>
                      </div>
                      <p className={`text-xs font-light leading-relaxed ${theme === "graphite" ? "text-ivory/60" : "text-graphite/60"}`}>
                        Outperforms local conventional horizontal housing schemes by over 200 basis points.
                      </p>
                    </div>

                    {/* Generational Asset Valuation Display */}
                    <div className={`space-y-2 border-b pb-6 ${theme === "graphite" ? "border-white/10" : "border-graphite/10"}`}>
                      <p className={`text-[11px] font-mono uppercase tracking-widest ${theme === "graphite" ? "text-ivory/50" : "text-graphite/50"}`}>
                        {t.accumulatedValue}
                      </p>
                      <div className="flex items-baseline space-x-2">
                        <span className={`text-3xl md:text-4xl font-serif font-semibold ${theme === "graphite" ? "text-ivory" : "text-graphite"}`}>
                          {underwritingData.finalPKR}
                        </span>
                      </div>
                      <p className={`text-xs font-light leading-relaxed ${theme === "graphite" ? "text-ivory/60" : "text-graphite/60"}`}>
                        Estimated valuation after {horizonYears} years holding period (Initial asset scale: {underwritingData.initialPKR}).
                      </p>
                    </div>
                  </div>

                  {/* Custom CSS Bar Charts comparing Standard to Tabraiz Town returns */}
                  <div className="space-y-6">
                    <p className={`text-xs uppercase tracking-widest font-mono mb-4 ${theme === "graphite" ? "text-ivory/50" : "text-graphite/50"}`}>
                      Comparative Growth Model (Initial Asset: {underwritingData.initialPKR})
                    </p>
                    
                    <div className="space-y-4">
                      {/* Tabraiz Town Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className={`font-semibold ${theme === "graphite" ? "text-ivory" : "text-graphite"}`}>TABRAIZ TOWN (PRO-FORMA {underwritingData.arr}% ARR)</span>
                          <span className="text-champagne font-bold">{underwritingData.finalPKR}</span>
                        </div>
                        <div className={`w-full h-3 rounded overflow-hidden ${theme === "graphite" ? "bg-white/5" : "bg-graphite/5"}`}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.2 }}
                            className="bg-champagne h-full rounded"
                          />
                        </div>
                      </div>

                      {/* Standard Lahore/RYK Horizontal Schemes Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className={theme === "graphite" ? "text-ivory/50" : "text-graphite/50"}>CONVENTIONAL REGIONAL SCHEMES (HISTORIC 11.0% ARR)</span>
                          <span className={`font-semibold ${theme === "graphite" ? "text-ivory/70" : "text-graphite/70"}`}>
                            {(parseFloat(underwritingData.initialPKR) * Math.pow(1.11, horizonYears)).toFixed(1)} Crore
                          </span>
                        </div>
                        <div className={`w-full h-3 rounded overflow-hidden ${theme === "graphite" ? "bg-white/5" : "bg-graphite/5"}`}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(11 / parseFloat(underwritingData.arr)) * 100}%` }}
                            transition={{ duration: 1.2 }}
                            className={`h-full rounded ${theme === "graphite" ? "bg-white/20" : "bg-graphite/30"}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={`p-4 flex items-center justify-between text-xs font-mono rounded ${
                      theme === "graphite"
                        ? "bg-champagne/10 border border-champagne/25 text-ivory"
                        : "bg-champagne/5 border border-champagne/15 text-graphite"
                    }`}>
                      <span className={theme === "graphite" ? "text-ivory/60" : "text-graphite/60"}>Premium Alpha Capital Gain:</span>
                      <span className={`font-bold text-sm ${theme === "graphite" ? "text-champagne" : "text-graphite"}`}>+{underwritingData.premiumPKR} PKR</span>
                    </div>
                  </div>

                  {/* Strategic McKinsey Takeaways */}
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t text-xs font-mono ${theme === "graphite" ? "border-white/10" : "border-graphite/10"}`}>
                    <div>
                      <h5 className={`font-semibold uppercase text-[10px] tracking-wider mb-1 ${theme === "graphite" ? "text-champagne" : "text-graphite"}`}>Tax Optimizations</h5>
                      <p className={`font-light leading-relaxed ${theme === "graphite" ? "text-ivory/60" : "text-graphite/60"}`}>
                        Agricultural enterprise reinvestments fully shielded via structured land-use allocation and green real estate credits.
                      </p>
                    </div>
                    <div>
                      <h5 className={`font-semibold uppercase text-[10px] tracking-wider mb-1 ${theme === "graphite" ? "text-champagne" : "text-graphite"}`}>Asset Portability</h5>
                      <p className={`font-light leading-relaxed ${theme === "graphite" ? "text-ivory/60" : "text-graphite/60"}`}>
                        High-density real assets offer simpler succession and dynamic liquidity compared to fragmented rural agricultural landholdings.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  {/* Explanation card */}
                  <div className={`p-4 rounded border text-xs leading-relaxed font-light ${
                    theme === "graphite" ? "bg-white/5 border-white/10 text-ivory/90" : "bg-graphite/5 border-graphite/10 text-graphite/90"
                  }`}>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-champagne mb-1 font-semibold">
                      {lang === "en" ? "Passive Solar & Travertine Engineering" : "غیر فعال سولر اور ٹراورٹائن انجینئرنگ"}
                    </p>
                    <p className="opacity-80">
                      {lang === "en"
                        ? "Tabraiz Town's architectural monolith incorporates a ventilated dual-wall cladding system using authentic Roman Travertine. Combined with our strict North-South axis orientation, this creates a passive thermodynamic envelope that mitigates Rahim Yar Khan's severe desert summer peaks."
                        : "تبریز ٹاؤن کے بلند و بالا سٹرکچرز میں خاص رومی سنگِ تراورٹائن (ٹراورٹائن فیساڈ) استعمال کیا گیا ہے۔ اس کی قدرتی موصلیت اور شمال جنوب سمت کی بدولت سورج کی تپش عمارت کے اندر داخل نہیں ہوتی، جس سے ائیر کنڈیشننگ کے اخراجات میں بھاری بچت ہوتی ہے۔"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Interactive Widget Controls Column */}
                    <div className="md:col-span-6 space-y-4">
                      {/* Facade Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-mono text-champagne block">
                          {lang === "en" ? "1. Building Facade System" : "۱۔ عمارت کی بیرونی دیوار"}
                        </label>
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => {
                              setFacadeMaterial("travertine");
                              learnUserIntent("Analyzed energy efficiency savings with Travertine facade.");
                            }}
                            className={`w-full p-2.5 text-left border rounded transition-all duration-300 cursor-pointer flex justify-between items-center ${
                              facadeMaterial === "travertine"
                                ? "border-champagne bg-champagne/10 text-white"
                                : "border-current/10 opacity-60 hover:opacity-100"
                            }`}
                          >
                            <div>
                              <p className="text-xs font-semibold font-serif">Ventilated Travertine Facade</p>
                              <p className="text-[8px] font-mono opacity-80 mt-0.5">High thermal mass insulation</p>
                            </div>
                            <span className="text-emerald-400 font-mono text-[9px] font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">-22% HVAC</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFacadeMaterial("concrete");
                              learnUserIntent("Simulated energy baseline with Conventional Concrete.");
                            }}
                            className={`w-full p-2.5 text-left border rounded transition-all duration-300 cursor-pointer flex justify-between items-center ${
                              facadeMaterial === "concrete"
                                ? "border-champagne bg-champagne/10 text-white"
                                : "border-current/10 opacity-60 hover:opacity-100"
                            }`}
                          >
                            <div>
                              <p className="text-xs font-semibold font-serif">Conventional Concrete Plaster</p>
                              <p className="text-[8px] font-mono opacity-80 mt-0.5">Absorbs & conducts solar heat</p>
                            </div>
                            <span className="opacity-40 font-mono text-[9px]">+0% Baseline</span>
                          </button>
                        </div>
                      </div>

                      {/* Orientation Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-mono text-champagne block">
                          {lang === "en" ? "2. Solar Orientation Alignment" : "۲۔ سورج کی سمت اور زاویہ"}
                        </label>
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => {
                              setOrientation("optimized");
                              learnUserIntent("Analyzed savings with Optimized North-South Orientation.");
                            }}
                            className={`w-full p-2.5 text-left border rounded transition-all duration-300 cursor-pointer flex justify-between items-center ${
                              orientation === "optimized"
                                ? "border-champagne bg-champagne/10 text-white"
                                : "border-current/10 opacity-60 hover:opacity-100"
                            }`}
                          >
                            <div>
                              <p className="text-xs font-semibold font-serif">North-South Core Alignment</p>
                              <p className="text-[8px] font-mono opacity-80 mt-0.5">Deflected peak midday radiation</p>
                            </div>
                            <span className="text-emerald-400 font-mono text-[9px] font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">-18% Peak</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOrientation("suboptimal");
                              learnUserIntent("Simulated energy baseline with East-West Exposure.");
                            }}
                            className={`w-full p-2.5 text-left border rounded transition-all duration-300 cursor-pointer flex justify-between items-center ${
                              orientation === "suboptimal"
                                ? "border-champagne bg-champagne/10 text-white"
                                : "border-current/10 opacity-60 hover:opacity-100"
                            }`}
                          >
                            <div>
                              <p className="text-xs font-semibold font-serif">East-West Direct Exposure</p>
                              <p className="text-[8px] font-mono opacity-80 mt-0.5">Direct solar glare on core facades</p>
                            </div>
                            <span className="opacity-40 font-mono text-[9px]">+0% Baseline</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Cost Calculations and Real-time Energy Savings */}
                    <div className="md:col-span-6 space-y-4">
                      <div className={`p-4 rounded border ${theme === "graphite" ? "bg-black/20 border-white/5 text-ivory/95" : "bg-white/40 border-graphite/5 text-graphite/95"}`}>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-champagne mb-4 font-semibold">
                          {lang === "en" ? "Model Output for: " : "حساب شدہ نتائج برائے: "}{solarEnergyData.label}
                        </p>

                        <div className="space-y-4">
                          {/* Saving percentage block */}
                          <div className="flex justify-between items-center border-b border-current/10 pb-2">
                            <span className="text-xs font-mono">{lang === "en" ? "Cumulative Energy Saving:" : "مجموعی توانائی کی بچت:"}</span>
                            <span className="text-2xl font-serif font-bold text-emerald-400">-{solarEnergyData.savingRatePercentage}%</span>
                          </div>

                          {/* Annual costs bars */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span>Standard Regional Design:</span>
                              <span className="opacity-80">{solarEnergyData.baseCostYearFormatted} PKR/Yr</span>
                            </div>
                            <div className={`w-full h-2 rounded overflow-hidden ${theme === "graphite" ? "bg-white/5" : "bg-graphite/5"}`}>
                              <div className="bg-red-500/50 h-full rounded w-full" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span className="font-semibold text-champagne">Tabraiz Architectural Parity:</span>
                              <span className="text-champagne font-bold">{solarEnergyData.actualCostYearFormatted} PKR/Yr</span>
                            </div>
                            <div className={`w-full h-2 rounded overflow-hidden ${theme === "graphite" ? "bg-white/5" : "bg-graphite/5"}`}>
                              <motion.div
                                initial={{ width: "100%" }}
                                animate={{ width: `${100 - solarEnergyData.savingRatePercentage}%` }}
                                transition={{ duration: 0.6 }}
                                className="bg-emerald-500 h-full rounded"
                              />
                            </div>
                          </div>

                          {/* Cumulative numbers over holding years */}
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-current/10">
                            <div>
                              <p className="text-[9px] font-mono opacity-50 uppercase tracking-widest">{lang === "en" ? "Annual Savings" : "سالانہ بچت"}</p>
                              <p className="text-xs sm:text-sm font-serif font-bold text-emerald-400">+{solarEnergyData.annualSavingsFormatted} PKR</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-mono opacity-50 uppercase tracking-widest">{lang === "en" ? `Savings over ${horizonYears} Yrs` : `${horizonYears} سالہ بچت`}</p>
                              <p className="text-xs sm:text-sm font-serif font-bold text-champagne">+{solarEnergyData.lifetimeSavingsFormatted} PKR</p>
                            </div>
                          </div>

                          {/* Carbon footprint offset badge */}
                          <div className="bg-emerald-500/5 border border-emerald-500/15 p-2.5 rounded flex items-center space-x-2">
                            <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                            </svg>
                            <div className="text-[9px] font-mono leading-tight">
                              <p className="text-emerald-400 uppercase tracking-wider font-bold">{lang === "en" ? "ECOLOGICAL IMPACT BONUS" : "ماحولیاتی تحفظ بونس"}</p>
                              <p className="opacity-80 mt-0.5">{lang === "en" ? `Reduces ${solarEnergyData.lifetimeCo2OffsetTons} Tons of carbon emissions over ${horizonYears} years.` : `ہولڈنگ پیریڈ کے دوران ${solarEnergyData.lifetimeCo2OffsetTons} ٹن کاربن اخراج کا خاتمہ۔`}</p>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Dynamic Recharts Growth Curve Visualization & AI Narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t border-graphite/10 relative z-10">
            {/* Chart Column */}
            <div className={`lg:col-span-7 p-6 md:p-8 rounded border shadow-xl flex flex-col justify-between ${
              theme === "graphite" ? "glass-panel-dark border-white/5 text-ivory" : "glass-panel-light border-graphite/5 text-graphite"
            }`}>
              <div className="space-y-2 mb-6">
                <span className="text-[10px] font-mono text-champagne uppercase tracking-[0.25em] block">
                  {lang === "en" ? "YIELD CURVE PROJECTIONS" : "سرمایہ کاری میں اضافے کا گراف"}
                </span>
                <h4 className="text-lg font-serif font-light text-champagne">
                  {lang === "en" ? "Generational Capital Accumulation Curve" : "نسل در نسل دولت کی منتقلی اور اضافہ"}
                </h4>
                <p className="text-xs opacity-75 leading-relaxed font-light font-sans">
                  {lang === "en"
                    ? "Interactive pro-forma compounding models comparing Tabraiz Town's premium vertical assets to standard regional horizontal schemes and agricultural land bank cash flows."
                    : "تبریز ٹاؤن کے منافع کا روایتی ہاؤسنگ اسکیموں اور زرعی زمین کے بینکنگ فنڈز سے موازنہ۔"}
                </p>
              </div>

              {/* Recharts Container */}
              <div className="w-full h-80 min-h-[320px] font-mono text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={growthChartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === "graphite" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                    <XAxis 
                      dataKey="year" 
                      stroke={theme === "graphite" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
                      tick={{ fill: theme === "graphite" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}
                    />
                    <YAxis 
                      stroke={theme === "graphite" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
                      tick={{ fill: theme === "graphite" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}
                      unit=" Cr"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === "graphite" ? "#1A1816" : "#FBFBFA",
                        border: theme === "graphite" ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                        borderRadius: "4px",
                        color: theme === "graphite" ? "#F5E6D3" : "#1C1A17"
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Tabraiz Town"
                      stroke="#E3C193"
                      strokeWidth={3}
                      dot={{ r: 4, stroke: "#E3C193", fill: "#1A1816", strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Conventional R.E."
                      stroke={theme === "graphite" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="Agrarian Reserves"
                      stroke="#458562"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Narrative Column */}
            <div className={`lg:col-span-5 p-6 md:p-8 rounded border shadow-xl flex flex-col justify-between relative ${
              theme === "graphite" ? "glass-panel-dark border-white/5 text-ivory" : "glass-panel-light border-graphite/5 text-graphite"
            }`}>
              <div className="space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-champagne">
                    <Sparkles size={16} className="animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] block font-bold">
                      {lang === "en" ? "GEMINI AI FINANCIAL CO-WRITER" : "جیمنی اے آئی فنانشل رپورٹ"}
                    </span>
                  </div>
                  <h4 className="text-lg font-serif font-light text-champagne">
                    {lang === "en" ? "Sovereign Underwriting Narrative" : "حسبِ منشا معاشی بریفنگ"}
                  </h4>
                  <p className="text-xs opacity-75 font-light font-sans">
                    {lang === "en"
                      ? "Generate a highly sophisticated McKinsey-grade underwriting memorandum analyzing your specific asset selections and wealth holding horizon."
                      : "اپنی مطلوبہ فنانسنگ، ہولڈنگ سال اور رقم کے لحاظ سے سیکنڈز میں مستند رپورٹ حاصل کریں۔"}
                  </p>
                </div>

                {/* Report Text Display Panel */}
                <div className={`flex-1 my-4 p-4 rounded overflow-y-auto max-h-[220px] text-xs font-light leading-relaxed scrollbar-thin border ${
                  theme === "graphite" ? "bg-[#0F0E0D]/60 border-white/5 text-ivory/90" : "bg-white/80 border-graphite/5 text-graphite/90"
                }`}>
                  {isAiReportLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                      <Compass className="animate-spin text-champagne" size={24} />
                      <p className="font-mono text-[10px] uppercase tracking-widest text-champagne/60">Underwriting brief compiles dynamically...</p>
                    </div>
                  ) : aiReport ? (
                    <div className="prose prose-sm prose-invert text-left prose-champagne font-sans space-y-3">
                      {aiReport.split("\n").map((line: string, idx: number) => {
                        if (line.startsWith("###")) {
                          return <h5 key={idx} className="font-serif text-sm font-semibold text-champagne mt-3">{line.replace("###", "")}</h5>;
                        } else if (line.startsWith("**")) {
                          return <p key={idx} className="font-semibold text-champagne">{line.replace(/\*\*/g, "")}</p>;
                        }
                        return <p key={idx}>{line}</p>;
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-current/40 space-y-2 font-sans">
                      <Shield className="mx-auto text-current/20" size={24} />
                      <p className="text-[11px] font-mono uppercase tracking-widest">Awaiting Sovereign Synthesis</p>
                      <p className="text-[10px]">Click the button below to generate your tailored wealth security analysis report.</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={fetchAiUnderwriteReport}
                  disabled={isAiReportLoading}
                  className="w-full text-center text-xs uppercase tracking-[0.2em] font-semibold text-[#1C1A17] bg-champagne hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 py-3 rounded-sm flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Sparkles size={14} className={isAiReportLoading ? "animate-spin" : ""} />
                  <span>
                    {isAiReportLoading
                      ? (lang === "en" ? "Synthesizing Report..." : "رپورٹ تیار ہو رہی ہے...")
                      : (lang === "en" ? "Compile McKinsey Analysis Report" : "میکنسے سیکیورٹی رپورٹ بریف کریں")}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-center pt-8 relative z-10">
            <button
              onClick={() => setIsRegistryOpen(true)}
              className={`inline-flex items-center space-x-3 text-xs uppercase tracking-widest font-mono transition-colors duration-300 group border-b pb-1 cursor-pointer ${
                theme === "graphite"
                  ? "text-ivory hover:text-champagne border-white/20 hover:border-champagne"
                  : "text-graphite hover:text-champagne border-graphite/25 hover:border-champagne"
              }`}
            >
              <span>Access Detailed Macroeconomic Underwriting Whitepaper</span>
              <ExternalLink size={12} className="group-hover:translate-y-[-2px] transition-transform duration-300" />
            </button>
          </div>
        </div>
      </section>
        </>
      )}

      {/* Module 05: The Horizon Signature & Interactive Forms */}
      {activePage === "registry" && (
        <>
          <section
            id="registry"
        className="min-h-screen w-full bg-graphite text-ivory px-6 md:px-12 py-32 flex flex-col justify-between relative overflow-hidden text-center"
      >
        {/* Subtle decorative background image */}
        <div className="absolute inset-0 w-full h-full scale-100 pointer-events-none filter brightness-50 opacity-20 select-none">
          <img
            src={ASSET("images/tabraiz_hero_boulevard_entrance.png")}
            alt="Tabraiz Town Boulevard Entrance overlay"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="shimmer-wave" />
        </div>

        {/* Top Spacer */}
        <div></div>

        <div className="w-full max-w-4xl mx-auto space-y-12 relative z-10">
          <p className="text-xs uppercase tracking-[0.35em] text-champagne font-mono font-medium">
            {t.signatureHeader}
          </p>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif font-extralight tracking-wide leading-snug max-w-3xl mx-auto">
            {lang === "en" ? (
              <>
                Tabraiz Town is not a purchase.<br />
                It is a permanent signature on the horizon of Punjab. An absolute declaration of <span className="text-champagne font-extralight">status, foresight, and legacy.</span>
              </>
            ) : (
              <>
                تبریز ٹاؤن محض ایک جائیداد کی خریداری نہیں ہے۔<br />
                یہ پنجاب کے افق پر آپ کا مستقل دستخط ہے۔ آپ کے اثر و رسوخ، دُور اندیشی اور <span className="text-champagne font-extralight">نسل در نسل وقار کا حتمی ثبوت۔</span>
              </>
            )}
          </h2>

          {/* Luxury Call-To-Action Stack (IDEO/Louis Vuitton luxury UX style) */}
          <div className="flex flex-col items-center justify-center gap-6 pt-10">
            <button
              onClick={() => setIsRegistryOpen(true)}
              className="text-xs uppercase tracking-[0.25em] text-ivory hover:text-champagne transition-colors duration-500 cursor-pointer py-3.5 px-8 border border-white/20 hover:border-champagne/60 bg-white/5 hover:bg-white/10 rounded-sm font-medium"
            >
              [ Become Part of the Vision ]
            </button>
            <button
              onClick={() => setIsRegistryOpen(true)}
              className="text-xs uppercase tracking-[0.25em] text-ivory/60 hover:text-champagne transition-colors duration-500 cursor-pointer py-2 px-4 border-b border-transparent hover:border-champagne/40"
            >
              Request a Private Site Presentation
            </button>
            <button
              onClick={() => setIsRegistryOpen(true)}
              className="text-xs uppercase tracking-[0.25em] text-ivory/60 hover:text-champagne transition-colors duration-500 cursor-pointer py-2 px-4 border-b border-transparent hover:border-champagne/40"
            >
              Download Comprehensive Executive Brief
            </button>
          </div>
        </div>

        {/* Brand Copyright, Czech compliance & Legal details */}
        <div className="relative z-10 text-center space-y-6 pt-16 border-t border-white/5 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-ivory/40 tracking-widest gap-4 border-b border-white/5 pb-6">
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <button onClick={() => { setIsLegalOpen(true); setActiveLegalTab("privacy"); }} className="hover:text-champagne transition-colors duration-300 cursor-pointer">PRIVACY POLICY</button>
              <span>•</span>
              <button onClick={() => { setIsLegalOpen(true); setActiveLegalTab("cookie"); }} className="hover:text-champagne transition-colors duration-300 cursor-pointer">COOKIE POLICY</button>
              <span>•</span>
              <button onClick={() => { setIsLegalOpen(true); setActiveLegalTab("compliance"); }} className="hover:text-champagne transition-colors duration-300 cursor-pointer">CZECH s.r.o. COMPLIANCE</button>
              <span>•</span>
              <button onClick={() => { setIsLegalOpen(true); setActiveLegalTab("contact"); }} className="hover:text-champagne transition-colors duration-300 cursor-pointer">SOVEREIGN CONTACTS</button>
            </div>
            <div>
              © {new Date().getFullYear()} TABRAIZ TOWN. ALL RIGHTS RESERVED.
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-champagne font-mono font-medium">
              A Project by Harvics Global Ventures s.r.o. (Prague, Czech Republic)
            </p>
            <p className="text-[9px] font-mono text-ivory/30 max-w-2xl mx-auto leading-relaxed uppercase tracking-widest">
              Tabraiz Town is underwritten and developed in strategic coordination with Harvics Global Ventures s.r.o. (Czech Republic Registration s.r.o. structure). All architectural models, material specifications, and pro-forma underwriting yield sheets conform to international sovereign capital standards.
            </p>
          </div>
        </div>
      </section>
        </>
      )}

      {/* Floating AI Concierge chat widget — available on every page */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-4">
        {isTourActive && (
          <button
            onClick={stopNarratedTour}
            className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#1C1A17] bg-champagne rounded-full px-4 py-2.5 shadow-2xl hover:bg-white transition-colors duration-300 cursor-pointer"
          >
            <Square size={10} />
            <span>{lang === "en" ? "Stop Narrated Tour" : "صوتی ٹور بند کریں"}</span>
          </button>
        )}
        <AnimatePresence>
          {isChatWidgetOpen && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-[min(92vw,380px)] h-[520px] rounded-lg overflow-hidden glass-panel-dark border border-white/10 shadow-2xl flex flex-col text-left"
            >
              {/* Widget header */}
              <div className="px-5 py-4 border-b border-white/10 bg-[#1C1A17]/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Sparkles size={14} className="text-champagne" />
                  <div>
                    <p className="text-[11px] font-serif text-champagne tracking-wide">
                      {lang === "en" ? "Tabraiz AI Concierge" : "تبریز اے آئی مشیر"}
                    </p>
                    <p className="text-[8px] font-mono uppercase tracking-[0.25em] text-ivory/40">
                      {lang === "en" ? "Sovereign Delegation Line" : "خصوصی رابطہ"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatWidgetOpen(false)}
                  className="p-1.5 text-ivory/50 hover:text-champagne transition-colors duration-300 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#141210]/70">
                {chatMessages.map((msg: any, idx) => {
                  const isAi = msg.sender === "ai";
                  return (
                    <div key={idx} className={`flex ${isAi ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[85%] px-3.5 py-2.5 rounded text-[11px] leading-relaxed ${
                        isAi
                          ? "bg-white/5 border border-white/10 text-ivory/85"
                          : "bg-champagne/15 border border-champagne/25 text-champagne"
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <p className="text-[8px] font-mono opacity-40 mt-1.5">{msg.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
                {isFaqLoading && (
                  <div className="flex items-center space-x-2 text-champagne/70 text-[10px] font-mono px-1">
                    <Loader2 size={12} className="animate-spin" />
                    <span>{lang === "en" ? "Concierge is composing..." : "مشیر جواب لکھ رہا ہے..."}</span>
                  </div>
                )}
              </div>

              {/* Input */}
              <form
                onSubmit={handleAskFaq}
                className="px-4 py-3 border-t border-white/10 bg-[#1C1A17]/80 flex items-center space-x-3"
              >
                <input
                  type="text"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder={lang === "en" ? "Ask about Tabraiz Town..." : "تبریز ٹاؤن کے بارے میں پوچھیں..."}
                  className="flex-1 bg-transparent text-[11px] text-ivory placeholder:text-ivory/30 focus:outline-none font-light"
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 transition-all duration-300 cursor-pointer ${
                    isListening ? "text-red-400 animate-pulse" : "text-ivory/50 hover:text-champagne"
                  }`}
                  title={lang === "en" ? "Speak your question" : "بول کر پوچھیں"}
                >
                  <Mic size={15} />
                </button>
                <button
                  type="submit"
                  disabled={isFaqLoading || !userQuestion.trim()}
                  className="p-2 text-champagne disabled:opacity-30 hover:scale-110 transition-transform duration-300 cursor-pointer"
                >
                  <ArrowRight size={15} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Launcher orb */}
        {!isChatWidgetOpen && (
          <button
            onClick={() => setIsChatWidgetOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-[#b06a2c] via-champagne to-[#8a4a1f] text-[#1C1A17] shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer border border-white/20"
            title={lang === "en" ? "Ask the Tabraiz AI Concierge" : "اے آئی مشیر سے پوچھیں"}
          >
            <MessageSquare size={22} />
          </button>
        )}
      </div>

      {/* Global delicate legal footer line — present on every page except the Registry signature page (which has its own) */}
      {activePage !== "registry" && (
        <footer
          className={`w-full px-6 md:px-12 py-6 border-t transition-colors duration-1000 ${
            theme === "graphite" ? "bg-graphite border-white/5 text-ivory/40" : "bg-ivory border-graphite/10 text-graphite/45"
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-mono uppercase tracking-[0.2em]">
            <span className="brand-shimmer font-serif text-[11px] tracking-[0.25em] normal-case">
              {lang === "en" ? "Tabraiz Town" : "تبریز ٹاؤن"}
            </span>
            <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2">
              <button
                onClick={() => { setIsLegalOpen(true); setActiveLegalTab("privacy"); }}
                className="hover:text-champagne transition-colors duration-300 cursor-pointer"
              >
                {lang === "en" ? "Privacy" : "رازداری"}
              </button>
              <span className="opacity-40">•</span>
              <button
                onClick={() => { setIsLegalOpen(true); setActiveLegalTab("cookie"); }}
                className="hover:text-champagne transition-colors duration-300 cursor-pointer"
              >
                {lang === "en" ? "Cookies" : "کوکیز"}
              </button>
              <span className="opacity-40">•</span>
              <button
                onClick={() => { setIsLegalOpen(true); setActiveLegalTab("compliance"); }}
                className="hover:text-champagne transition-colors duration-300 cursor-pointer"
              >
                {lang === "en" ? "Compliance" : "ضوابط"}
              </button>
              <span className="opacity-40">•</span>
              <button
                onClick={() => { setIsLegalOpen(true); setActiveLegalTab("contact"); }}
                className="hover:text-champagne transition-colors duration-300 cursor-pointer"
              >
                {lang === "en" ? "Contact" : "رابطہ"}
              </button>
            </div>
            <span>© {new Date().getFullYear()} TABRAIZ TOWN. {lang === "en" ? "ALL RIGHTS RESERVED." : "جملہ حقوق محفوظ ہیں۔"}</span>
          </div>
        </footer>
      )}

      {/* Discretionary Private Registry Modal / Portal (Ultra Frosted Glass Expression) */}
      <AnimatePresence>
        {isRegistryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 w-full h-full bg-[#1C1A17]/65 backdrop-blur-[24px] z-50 flex items-center justify-center px-6"
          >
            {/* Ambient image background within the modal */}
            <div className="absolute inset-0 w-full h-full pointer-events-none filter brightness-[0.25] opacity-20">
              <img
                src={ASSET("images/tabraiz_town_interior_1783295077820.jpg")}
                alt="Penthouse interior"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <button
              onClick={() => setIsRegistryOpen(false)}
              className="absolute top-8 right-8 text-xs uppercase tracking-widest text-[#FDFBF7]/60 hover:text-champagne transition-colors duration-300 py-2 px-4 cursor-pointer border border-white/10 hover:border-champagne/40 rounded-full bg-white/5 backdrop-blur-md"
              id="close-portal"
            >
              [ Close Frame ]
            </button>

            {/* Verification Content Form inside elegant frosted card */}
            <div className="w-full max-w-lg p-8 md:p-12 rounded glass-panel-dark border border-white/10 space-y-12 text-center relative z-10 shadow-3xl">
              {!registrySubmitted ? (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-12"
                >
                  <div className="space-y-3">
                    <h3 className="text-2xl md:text-3xl font-serif tracking-tight text-champagne font-light">
                      {t.registryTitle}
                    </h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#FDFBF7]/50 font-mono">
                      {t.registrySubtitle}
                    </p>
                  </div>

                   <form onSubmit={handleRegistrySubmit} className="space-y-8 text-left">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-mono text-champagne block font-semibold">
                        Verify Corporate Identity / Legal Email
                      </label>
                      <input
                        type="email"
                        required
                        value={registryEmail}
                        onChange={(e) => setRegistryEmail(e.target.value)}
                        placeholder={t.registryPlaceholder}
                        className={`w-full bg-white/5 border text-[#FDFBF7] py-4 px-6 text-center text-sm font-light tracking-wide placeholder:text-[#FDFBF7]/25 outline-none transition-all duration-500 rounded-sm ${
                          emailStatus === null
                            ? "border-white/10 focus:bg-white/10 focus:border-champagne/60"
                            : emailStatus.isValid && emailStatus.isCorporate
                              ? "border-emerald-500/80 bg-emerald-500/5 focus:bg-emerald-500/10 focus:border-emerald-400"
                              : "border-amber-500/80 bg-amber-500/5 focus:bg-amber-500/10 focus:border-amber-400"
                        }`}
                      />
                      {emailStatus && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`text-[10px] font-mono uppercase tracking-wider py-2 px-3 rounded flex items-center justify-center space-x-2 mt-2 ${
                            emailStatus.isValid && emailStatus.isCorporate
                              ? "text-emerald-400 bg-emerald-500/5 border border-emerald-500/10"
                              : "text-amber-400 bg-amber-500/5 border border-amber-500/10"
                          }`}
                        >
                          {emailStatus.isValid && emailStatus.isCorporate ? (
                            <span className="flex items-center space-x-1">
                              <span>●</span>
                              <span>{emailStatus.message}</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1">
                              <span>▲</span>
                              <span>{emailStatus.message}</span>
                            </span>
                          )}
                        </motion.div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 text-xs text-[#FDFBF7]/60">
                        <input type="checkbox" required id="consent-check" className="mt-1 accent-champagne" />
                        <label htmlFor="consent-check" className="leading-relaxed font-light font-mono text-[10px] uppercase tracking-wider cursor-pointer">
                          I authorize Tabraiz Town to process my family wealth dossier with absolute discretion and non-disclosure parity.
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={emailStatus !== null && !emailStatus.isCorporate}
                      className={`text-xs uppercase tracking-[0.2em] font-medium py-4 w-full cursor-pointer rounded-sm transition-all duration-500 font-semibold ${
                        emailStatus && !emailStatus.isCorporate
                          ? "bg-white/10 text-white/30 border border-white/5 cursor-not-allowed opacity-50"
                          : "text-[#1C1A17] bg-champagne hover:bg-[#FDFBF7] hover:translate-y-[-1px]"
                      }`}
                    >
                      {emailStatus && !emailStatus.isCorporate ? (lang === "en" ? "Corporate Domain Required" : "کارپوریٹ ڈومین لازمی ہے") : t.registryButton}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-6"
                >
                  <div className="w-16 h-16 rounded-full border border-champagne flex items-center justify-center mx-auto text-champagne animate-pulse mb-4">
                    <Lock size={24} />
                  </div>
                  <h4 className="text-xl font-serif text-champagne italic">
                    "Identity Authenticated. Private Dossier Initiated."
                  </h4>
                  <p className="text-xs font-mono text-[#FDFBF7]/60 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                    {t.registryDiscretion}
                  </p>

                  {isLeadBriefLoading && (
                    <div className="flex items-center justify-center space-x-2 text-champagne/70 text-[10px] font-mono uppercase tracking-widest">
                      <Loader2 size={12} className="animate-spin" />
                      <span>{lang === "en" ? "AI is preparing your delegation dossier..." : "اے آئی آپ کا ڈوزیئر تیار کر رہا ہے..."}</span>
                    </div>
                  )}

                  {leadBrief && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7 }}
                      className="text-left bg-white/5 border border-white/10 rounded p-5 max-h-[260px] overflow-y-auto"
                    >
                      <p className="text-[9px] font-mono text-champagne uppercase tracking-[0.25em] border-b border-white/10 pb-2 mb-3">
                        [ {lang === "en" ? "SOVEREIGN DELEGATION DOSSIER" : "خصوصی ڈوزیئر"} ]
                      </p>
                      <p className="text-[11px] font-light text-ivory/85 leading-relaxed whitespace-pre-line">{leadBrief}</p>
                    </motion.div>
                  )}

                  <button
                    onClick={closeRegistryPortal}
                    className="text-xs uppercase tracking-[0.2em] text-ivory/60 hover:text-champagne transition-colors duration-300 cursor-pointer border-b border-transparent hover:border-champagne/40 pb-1 mt-4"
                  >
                    {lang === "en" ? "Close Portal" : "پورٹل بند کریں"}
                  </button>

                  <div className="w-32 bg-white/10 h-[1px] mx-auto overflow-hidden mt-6">
                    <div className="bg-champagne h-full animate-progress" style={{ width: "100%" }} />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Immersive Full-Screen Lightbox Modal for Photo Gallery */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 w-full h-full bg-[#0A0908]/98 z-50 flex flex-col justify-between p-6 md:p-12 text-[#FDFBF7]"
          >
            {/* Top Navigation Bar of Lightbox */}
            <div className="flex justify-between items-center z-10 border-b border-white/10 pb-4">
              <div className="text-left">
                <span className="text-[10px] font-mono text-champagne uppercase tracking-[0.25em]">
                  {GALLERY_ITEMS[lightboxIndex].category[lang as keyof typeof GALLERY_ITEMS[typeof lightboxIndex]["category"]] || GALLERY_ITEMS[lightboxIndex].category["en"]}
                </span>
                <p className="text-xs font-mono opacity-60">
                  {lang === "en" ? "FRAME" : "فریم"} {lightboxIndex + 1} / {GALLERY_ITEMS.length} • BY {GALLERY_ITEMS[lightboxIndex].credit}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-3 font-mono text-xs">
                <button
                  onClick={() => setIsRegistryOpen(true)}
                  className="hidden md:inline-flex items-center space-x-2 py-1.5 px-4 bg-champagne text-graphite rounded hover:bg-white transition-colors duration-300 font-bold uppercase tracking-wider"
                >
                  <Lock size={12} />
                  <span>{lang === "en" ? "REQUEST ARCHIVE" : "حصولِ تصویر"}</span>
                </button>

                <button
                  onClick={() => setLightboxIndex(null)}
                  className="p-2 border border-white/10 hover:border-champagne hover:text-champagne transition-colors duration-300 rounded-full cursor-pointer"
                  title="Close Lightbox (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Core Image Viewer with navigation triggers */}
            <div className="flex-1 flex items-center justify-center relative my-4">
              
              {/* Left trigger */}
              <button
                onClick={() => setLightboxIndex((lightboxIndex - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length)}
                className="absolute left-2 md:left-6 p-3 md:p-4 border border-white/5 hover:border-champagne hover:bg-white/5 text-white hover:text-champagne transition-all duration-300 rounded-full z-10 cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Main Photo container */}
              <motion.div
                key={lightboxIndex}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-4xl max-h-[60vh] md:max-h-[70vh] overflow-hidden rounded relative shadow-2xl"
              >
                <img
                  src={GALLERY_ITEMS[lightboxIndex].image}
                  alt="Full resolution architectural render"
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[60vh] md:max-h-[70vh] object-contain mx-auto"
                />
              </motion.div>

              {/* Right trigger */}
              <button
                onClick={() => setLightboxIndex((lightboxIndex + 1) % GALLERY_ITEMS.length)}
                className="absolute right-2 md:right-6 p-3 md:p-4 border border-white/5 hover:border-champagne hover:bg-white/5 text-white hover:text-champagne transition-all duration-300 rounded-full z-10 cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Bottom Metadata Panel */}
            <div className="max-w-3xl mx-auto text-center space-y-3 z-10">
              <h3 className="text-xl md:text-3xl font-serif font-light text-champagne tracking-tight">
                {GALLERY_ITEMS[lightboxIndex].title[lang as keyof typeof GALLERY_ITEMS[typeof lightboxIndex]["title"]] || GALLERY_ITEMS[lightboxIndex].title["en"]}
              </h3>
              <p className="text-xs md:text-sm font-light leading-relaxed opacity-80 max-w-2xl mx-auto">
                {GALLERY_ITEMS[lightboxIndex].desc[lang as keyof typeof GALLERY_ITEMS[typeof lightboxIndex]["desc"]] || GALLERY_ITEMS[lightboxIndex].desc["en"]}
              </p>
              
              <div className="pt-2 flex justify-center items-center space-x-6 text-[10px] font-mono text-white/50 uppercase tracking-widest">
                <span>{lang === "en" ? "RESOLUTION: 8K ULTRA-HD" : "ریزولوشن: ایٹ کے الٹرا ایچ ڈی"}</span>
                <span>•</span>
                <span>{lang === "en" ? "COLOR-SPACE: DCI-P3" : "کلر اسپیس: ڈی سی آئی پی تھری"}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comprehensive Multilingual Legal, Cookie, Contact & Compliance Modal */}
      <AnimatePresence>
        {isLegalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 w-full h-full bg-[#1C1A17]/70 backdrop-blur-[24px] z-50 flex items-center justify-center px-6"
          >
            {/* Modal Card wrapper */}
            <div className="w-full max-w-4xl rounded border border-white/10 glass-panel-dark text-white p-6 md:p-10 flex flex-col md:grid md:grid-cols-12 gap-8 max-h-[85vh] overflow-hidden relative shadow-3xl">
              
              {/* Close Button */}
              <button
                onClick={() => setIsLegalOpen(false)}
                className="absolute top-4 right-4 md:top-6 md:right-6 text-xs uppercase tracking-widest text-[#FDFBF7]/60 hover:text-champagne transition-colors duration-300 py-1 px-3 cursor-pointer border border-white/10 hover:border-champagne/40 rounded-full bg-white/5"
              >
                [ {lang === "en" ? "Close" : "بند کریں"} ]
              </button>

              {/* Left Column: Navigation Tabs */}
              <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-6 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible text-left">
                <div className="mb-4 hidden md:block">
                  <p className="text-[10px] font-mono text-champagne uppercase tracking-[0.2em] font-semibold">
                    {lang === "en" ? "Legal Compliance Matrix" : "قانونی دستاویزات"}
                  </p>
                  <p className="text-[8px] font-mono opacity-40 uppercase tracking-wider">
                    Harvics Global Ventures s.r.o.
                  </p>
                </div>

                {[
                  { id: "privacy", en: "Privacy Policy", ur: "رازداری کی پالیسی" },
                  { id: "cookie", en: "Cookie Policy", ur: "کوکی پالیسی" },
                  { id: "compliance", en: "Czech s.r.o. Compliance", ur: "یورپی قانونی تعمیل" },
                  { id: "contact", en: "Sovereign Contacts", ur: "رابطہ نمبرز" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveLegalTab(tab.id as any)}
                    className={`whitespace-nowrap px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-left transition-all duration-300 rounded cursor-pointer ${
                      activeLegalTab === tab.id
                        ? "bg-champagne text-graphite font-bold"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {lang === "en" ? tab.en : tab.ur}
                  </button>
                ))}
              </div>

              {/* Right Column: Multilingual Contents */}
              <div className="md:col-span-8 overflow-y-auto pr-2 text-left space-y-6 max-h-[50vh] md:max-h-[60vh]">
                
                {activeLegalTab === "privacy" && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-serif text-champagne font-light">
                      {lang === "en" ? "Generational Privacy Statement & Non-Disclosure" : "رازداری اور معلومات کے تحفظ کا حلف نامہ"}
                    </h4>
                    
                    {/* Multilingual translations */}
                    <div className="space-y-4 text-xs font-light leading-relaxed text-white/80 font-sans">
                      <p>
                        <strong>[ENGLISH]</strong> Tabraiz Town operates on a strict non-disclosure framework designed to protect the capital assets, identities, and family trusts of our residents. We do not sell, rent, or distribute personal identity files. All demographic underwriting data remains sandboxed within our encrypted private registry.
                      </p>
                      <p>
                        <strong>[URDU]</strong> تبریز ٹاؤن اپنے معزز خریداروں کی معلومات، اثاثوں اور خاندانی ٹرسٹ کی رازداری کے تحفظ کے لیے تاحیات پرعزم ہے۔ آپ کی نجی شناخت یا خاندانی دولت کے ریکارڈز کو کسی بھی بیرونی ادارے کے ساتھ قطعاً شیئر نہیں کیا جائے گا۔ تمام ڈیٹا جدید ترین رازداری کے قوانین کے مطابق محفوظ کیا جاتا ہے۔
                      </p>
                      <p>
                        <strong>[ARABIC]</strong> تعمل مدينة تبريز ضمن إطار عمل صارم لعدم الإفصاح مصمم لحماية الأصول الرأسمالية والهويات والائتمانات العائلية لسكاننا. نحن لا نبيع أو نوزع ملفات الهوية الشخصية.
                      </p>
                      <p>
                        <strong>[CHINESE]</strong> 塔布雷斯新城（Tabraiz Town）遵循极其严苛的保密条款，致力于保障业主、企业及家族信托的财产隐私与绝对声誉安全。我们严禁出售、转让或公开任何个人身份和金融档案。
                      </p>
                      <p>
                        <strong>[SPANISH]</strong> Tabraiz Town opera bajo un estricto marco de confidencialidad diseñado para proteger los activos de capital, las identidades y los fideicomisos familiares de nuestros residentes.
                      </p>
                      <p>
                        <strong>[SARAIKI]</strong> تبریز ٹاؤن تہاݙی دولت، جائیداد تے خاندان دی رازداری دا تاحیات ضامن ہے۔ تہاݙے ناں یا رجسٹریشن دی معلومات کوں انتہائی خفیہ رکھیا ویسی تاں کہ تہاݙا مانڑ تے وقار ہمیشہ قائم رہے۔
                      </p>
                    </div>
                  </div>
                )}

                {activeLegalTab === "cookie" && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-serif text-champagne font-light">
                      {lang === "en" ? "Tactile Cookie Policy & Technical Preferences" : "کوکی پالیسی اور سیکیورٹی کوکیز کا استعمال"}
                    </h4>
                    <div className="space-y-4 text-xs font-light leading-relaxed text-white/80">
                      <p>
                        <strong>[ENGLISH]</strong> We utilize low-impact technical cookies to remember your visual spectrum selections (Graphite or Ivory), audio preferences, and language editions. These cookies contain zero tracking codes and exist purely to ensure a seamless curatorial experience.
                      </p>
                      <p>
                        <strong>[URDU]</strong> ہم اس ویب سائٹ پر صرف بنیادی کوکیز کا استعمال کرتے ہیں تا کہ آپ کی پسندیدہ زبان، آڈیو آن یا آف اور لائٹ یا ڈارک تھیم کا انتخاب یاد رکھا جا سکے۔ ان کوکیز میں کوئی بھی بیرونی ٹریکنگ سافٹ ویئر شامل نہیں ہے۔
                      </p>
                      <p>
                        <strong>[ARABIC]</strong> نحن نستخدم ملفات تعريف الارتباط الفنية منخفضة التأثير لتذكر تفضيلات الطيف البصري (الجرافيت أو العاج)، وتفضيلات الصوت، والإصدارات اللغوية.
                      </p>
                      <p>
                        <strong>[CHINESE]</strong> 本数字平台仅使用极简的必要技术性 Cookie，用以记录您对视觉光谱（石墨黑或象牙白）、环境声学以及语言版本的选择偏好。该等数据绝对安全，不包含任何第三方广告或行为追踪代码。
                      </p>
                      <p>
                        <strong>[SPANISH]</strong> Utilizamos cookies técnicas de bajo impacto para recordar sus selecciones de espectro visual (grafito o marfil), preferencias de audio y ediciones de idioma.
                      </p>
                      <p>
                        <strong>[SARAIKI]</strong> اساں ایں ویب سائٹ تے تہاݙی زبان، آڈیو تے تھیم دی سیٹنگ کوں یاد رکھݨ واسطے سادہ کوکیز دا استعمال کریندے ہیں تاں کہ تہاݙا اگلا وزٹ تہاݙی مرضی دے مطابق ہووے۔
                      </p>
                    </div>
                  </div>
                )}

                {activeLegalTab === "compliance" && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-serif text-champagne font-light">
                      {lang === "en" ? "Harvics Global Ventures s.r.o. Compliance Statement" : "ہاروکس گلوبل وینچرز یورپی تعمیل نامہ"}
                    </h4>
                    <div className="space-y-4 text-xs font-light leading-relaxed text-white/80">
                      <p>
                        <strong>[ENGLISH]</strong> Tabraiz Town is underwritten and developed in corporate coordination with Harvics Global Ventures s.r.o., registered under company registration laws of Prague, Czech Republic. Our pro-forma financial models, asset audits, and real estate investment frameworks comply with European capital standards.
                      </p>
                      <p>
                        <strong>[URDU]</strong> تبریز ٹاؤن کو ہاروکس گلوبل وینچرز s.r.o. (پراگ، جمہوریہ چیک) کی فنانشل پارٹنرشپ اور اسٹریٹجک نگرانی میں تیار کیا جا رہا ہے۔ ہمارے تمام معاشی تخمینے، سرمایہ کاری آڈٹس اور فنانسنگ بریفز یورپی یونین کے مالیاتی قوانین کی مکمل مطابقت میں تیار کیے گئے ہیں۔
                      </p>
                      <p>
                        <strong>[ARABIC]</strong> يتم تمويل وتطوير مدينة تبريز بالتنسيق مع شركة Harvics Global Ventures s.r.o.، المسجلة في براغ، جمهورية التشيك.
                      </p>
                      <p>
                        <strong>[CHINESE]</strong> 塔布雷斯新城项目在欧洲知名投资集团 Harvics Global Ventures s.r.o.（捷克共和国布拉格注册企业）的战略协调与资本背书下联合开发。所有的资产估值、风险控制以及预期收益精算完全符合欧盟主权资本合规标准。
                      </p>
                      <p>
                        <strong>[SPANISH]</strong> Tabraiz Town se desarrolla en coordinación corporativa con Harvics Global Ventures s.r.o., registrada bajo las leyes de Praga, República Checa.
                      </p>
                      <p>
                        <strong>[SARAIKI]</strong> تبریز ٹاؤن پراگ (جمہوریہ چیک) دی نامور کمپنی ہاروکس گلوبل وینچرز s.r.o. دی شراکت داری نال بݨدا پئے۔ ایندے سارے فنانشل پلان یورپی قوانین دے مطابق ہن۔
                      </p>
                    </div>
                  </div>
                )}

                {activeLegalTab === "contact" && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-serif text-champagne font-light">
                      {lang === "en" ? "Sovereign Concierge & International Offices" : "رابطہ برائے سفارتی و نجی معاملات"}
                    </h4>
                    <div className="space-y-4 text-xs font-light leading-relaxed text-white/80 font-mono">
                      <div className="p-4 border border-white/5 rounded bg-white/5">
                        <p className="text-champagne font-bold uppercase mb-1">EUROPEAN HEADQUARTERS:</p>
                        <p>Harvics Global Ventures s.r.o.</p>
                        <p>Rybná 716/24, Staré Město, 110 00 Prague 1, Czech Republic</p>
                        <p>Email: legal@harvicsglobal.cz / compliance@harvicsglobal.cz</p>
                      </div>
                      
                      <div className="p-4 border border-white/5 rounded bg-white/5">
                        <p className="text-champagne font-bold uppercase mb-1">SOUTHERN PUNJAB EXECUTIVE SUITE:</p>
                        <p>Tabraiz Town Development Offices, Canal Road, Rahim Yar Khan, Pakistan</p>
                        <p>Direct Hotlines: +92 68 5882201 / +92 68 5882202</p>
                        <p>Email: registry@tabraiztown.com / concierge@tabraiztown.com</p>
                      </div>

                      <div className="p-4 border border-white/5 rounded bg-white/5 font-sans">
                        <p className="text-champagne font-bold font-mono uppercase mb-1">SARAIKI COMMUNITY REPRESENTATION:</p>
                        <p className="text-xs">جنوبی پنجاب دے وسنیک بھراواں کیتے ساݙا خصوصی نمائندہ سارا وقت دستیاب ہے۔ تساں کݙہیں وی فون کر تے مشورہ گھن سڳدے ہو۔</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
