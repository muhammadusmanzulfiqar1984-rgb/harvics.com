# 🌐 HARVICS LOCALIZATION ARCHITECTURE - Complete Interlinking Map

**Last Updated:** 2025-01-27  
**Status:** ✅ Fully Integrated & Interlinked

---

## 📊 **COMPLETE LOCALIZATION FLOW**

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTION LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  Header Component (src/components/Header.tsx)                   │
│  ├─ LanguageSwitcher Component (Primary UI)                     │
│  │  ├─ Shows 12 primary languages (like Zara)                   │
│  │  ├─ "Show all" button for 26 extended languages              │
│  │  └─ Flag icons + native names                                │
│  │                                                               │
│  └─ CountrySelector Component                                    │
│     └─ Country selection (works with language)                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LOCALIZATION LAYER                    │
├─────────────────────────────────────────────────────────────────┤
│  1. LanguageSwitcher.tsx                                         │
│     ├─ Fetches languages from: /api/localisation/languages      │
│     ├─ Saves preference to: /api/localisation/language-preference│
│     ├─ Updates URL: /{locale}/...                                │
│     └─ Stores in localStorage                                   │
│                                                                  │
│  2. next-intl Integration                                        │
│     ├─ middleware.ts: Routes /en/, /ar/, /fr/, etc.            │
│     ├─ i18n.ts: Loads locale messages                           │
│     ├─ [locale]/layout.tsx: Provides locale context             │
│     └─ useTranslations() hook: Used in all components          │
│                                                                  │
│  3. Translation Files (src/locales/)                            │
│     ├─ en.json, ar.json, fr.json, es.json, de.json, zh.json...  │
│     └─ 38 language files total                                  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API CLIENT LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  src/lib/api.ts (ApiClient class)                               │
│  ├─ getSupportedLanguages()                                     │
│  │  └─ GET /api/localisation/languages                          │
│  │                                                               │
│  └─ saveLanguagePreference(languageCode, countryCode)          │
│     └─ POST /api/localisation/language-preference              │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  backend/src/modules/localisation/localisation.controller.ts    │
│  ├─ GET /api/localisation/languages                             │
│  │  └─ Returns 38 languages with flags, native names, RTL      │
│  │                                                               │
│  └─ POST /api/localisation/language-preference                  │
│     └─ Saves user language preference                           │
│                                                                  │
│  backend/src/routes.ts                                           │
│  ├─ Public route: /api/localisation/languages (no auth)        │
│  └─ Protected route: /api/localisation/* (requires auth)        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 **WHERE LOCALIZATION IS APPLIED**

### **1. Header Component** (`src/components/Header.tsx`)
**Location:** Top navigation bar (desktop & mobile)

**Integration:**
- ✅ Imports `LanguageSwitcher` component
- ✅ Uses `useTranslations('navigation')` for menu items
- ✅ Uses `useLocale()` for URL routing
- ✅ Shows language switcher next to country selector

**Lines:**
- Line 7: `import LanguageSwitcher from './LanguageSwitcher'`
- Line 24: `const locale = useLocale()`
- Line 23: `const t = useTranslations('navigation')`
- Lines 282-290: Desktop language switcher
- Lines 315-321: Mobile language switcher

---

### **2. LanguageSwitcher Component** (`src/components/LanguageSwitcher.tsx`)
**Location:** Embedded in Header

**Features:**
- ✅ Fetches languages from backend API
- ✅ Shows 12 primary languages (like Zara)
- ✅ "Show all" button for 26 extended languages
- ✅ Saves preference to backend
- ✅ Updates URL routing
- ✅ Stores in localStorage

**API Calls:**
- `apiClient.getSupportedLanguages()` → `/api/localisation/languages`
- `apiClient.saveLanguagePreference()` → `/api/localisation/language-preference`

---

### **3. All Pages** (`src/app/[locale]/`)
**Location:** Every page in the app

**Integration:**
- ✅ URL structure: `/{locale}/page-name`
- ✅ Examples:
  - `/en/` - English homepage
  - `/ar/` - Arabic homepage
  - `/fr/dashboard/company` - French CRM dashboard
  - `/es/products` - Spanish products page

**Files:**
- `src/app/[locale]/page.tsx` - Homepage
- `src/app/[locale]/dashboard/[persona]/page.tsx` - CRM dashboard
- `src/app/[locale]/products/page.tsx` - Products page
- `src/app/[locale]/about/page.tsx` - About page

---

### **4. Translation Usage** (All Components)
**Location:** Throughout the entire app

**Components using translations:**
- ✅ `Header.tsx` - Navigation menu
- ✅ `Footer.tsx` - Footer links
- ✅ `EnterpriseCRM.tsx` - CRM dashboard tabs
- ✅ `CreativeHero.tsx` - Hero section
- ✅ `ProductShowcase.tsx` - Product descriptions
- ✅ All other components using `useTranslations()`

**Example:**
```typescript
const t = useTranslations('navigation')
return <span>{t('home')}</span> // Shows translated "Home"
```

---

### **5. Middleware** (`src/middleware.ts`)
**Location:** Runs before every request

**Function:**
- ✅ Detects locale from URL (`/en/`, `/ar/`, etc.)
- ✅ Redirects to correct locale if missing
- ✅ Supports 38 languages

---

### **6. Layout** (`src/app/[locale]/layout.tsx`)
**Location:** Wraps all pages

**Function:**
- ✅ Loads translation files (`en.json`, `ar.json`, etc.)
- ✅ Sets RTL for Arabic/Hebrew
- ✅ Provides `NextIntlClientProvider` context
- ✅ Falls back to English if translation missing

---

## 🔄 **HOW EVERYTHING INTERLINKS**

### **Flow 1: User Changes Language**

```
1. User clicks LanguageSwitcher in Header
   ↓
2. LanguageSwitcher.tsx:
   - Calls apiClient.saveLanguagePreference(languageCode, countryCode)
   - Updates localStorage
   - Changes URL: router.push(`/${newLocale}${path}`)
   ↓
3. Backend API (/api/localisation/language-preference):
   - Receives POST request
   - Validates language code
   - Returns success
   ↓
4. Next.js middleware.ts:
   - Detects new locale in URL
   - Routes to correct page
   ↓
5. Layout ([locale]/layout.tsx):
   - Loads translation file (e.g., fr.json)
   - Provides to all child components
   ↓
6. All Components:
   - useTranslations() hook gets new translations
   - Page re-renders in new language
```

---

### **Flow 2: Page Load with Locale**

```
1. User visits /fr/products
   ↓
2. middleware.ts:
   - Detects locale: "fr"
   - Routes to [locale]/products/page.tsx
   ↓
3. Layout ([locale]/layout.tsx):
   - Loads src/locales/fr.json
   - Sets dir="ltr" (or "rtl" for Arabic/Hebrew)
   - Provides NextIntlClientProvider
   ↓
4. Page Component:
   - Uses useTranslations('products')
   - Renders French translations
   ↓
5. Header Component:
   - LanguageSwitcher shows "Français" as selected
   - All menu items in French
```

---

### **Flow 3: Language Switcher Initialization**

```
1. Page loads
   ↓
2. LanguageSwitcher.tsx useEffect:
   - Calls apiClient.getSupportedLanguages()
   ↓
3. Backend API (/api/localisation/languages):
   - Returns 38 languages with metadata
   ↓
4. LanguageSwitcher:
   - Shows 12 primary languages
   - Hides 26 extended languages
   - Displays current locale from URL
```

---

## 📍 **SPECIFIC INTEGRATION POINTS**

### **Frontend ↔ Backend Connection**

| Frontend Component | Backend Endpoint | Purpose |
|-------------------|-----------------|---------|
| `LanguageSwitcher.tsx` | `GET /api/localisation/languages` | Fetch available languages |
| `LanguageSwitcher.tsx` | `POST /api/localisation/language-preference` | Save user preference |
| `Header.tsx` | Uses `useLocale()` | Get current locale from URL |
| All Components | Uses `useTranslations()` | Get translated strings |

---

### **Translation File Structure**

```
src/locales/
├── en.json          ← English (default)
├── ar.json          ← Arabic (RTL)
├── fr.json          ← French
├── es.json          ← Spanish
├── de.json          ← German
├── zh.json          ← Chinese
├── he.json          ← Hebrew (RTL)
├── hi.json          ← Hindi
├── pt.json          ← Portuguese
├── ru.json          ← Russian
└── ... (28 more languages)
```

**Structure:**
```json
{
  "navigation": {
    "home": "Home",
    "products": "Products",
    "about": "About"
  },
  "crm": {
    "tabs": {
      "orders": "Orders",
      "inventory": "Inventory"
    }
  }
}
```

---

## 🎯 **KEY INTERLINKING FEATURES**

### **1. Language + Country Integration**
- ✅ LanguageSwitcher saves both `languageCode` and `countryCode`
- ✅ CountrySelector works alongside LanguageSwitcher
- ✅ Both stored in localStorage
- ✅ Both sent to backend API

### **2. URL-Based Routing**
- ✅ Every page: `/{locale}/page-name`
- ✅ Language change updates URL
- ✅ Direct URL access works (e.g., `/ar/products`)
- ✅ Middleware handles routing automatically

### **3. RTL Support**
- ✅ Arabic (`ar`) and Hebrew (`he`) automatically use RTL
- ✅ Layout sets `dir="rtl"` for these languages
- ✅ CSS automatically flips layout

### **4. Fallback System**
- ✅ If translation missing → falls back to English
- ✅ If API fails → uses fallback languages list
- ✅ If locale file missing → uses English file

---

## 🚀 **HOW TO USE / TEST**

### **Test Language Switching:**
1. Open website: `http://localhost:3000/en/`
2. Click language switcher in header
3. Select "Français"
4. URL changes to: `http://localhost:3000/fr/`
5. Page reloads in French

### **Test Direct URL:**
1. Visit: `http://localhost:3000/ar/products`
2. Page loads in Arabic (RTL)
3. Language switcher shows "العربية" selected

### **Test API:**
```bash
# Get languages
curl http://localhost:4000/api/localisation/languages

# Save preference
curl -X POST http://localhost:4000/api/localisation/language-preference \
  -H "Content-Type: application/json" \
  -d '{"languageCode": "fr", "countryCode": "fr"}'
```

---

## ✅ **SUMMARY: WHERE LOCALIZATION IS APPLIED**

| Location | Component/File | What It Does |
|----------|---------------|--------------|
| **Header** | `Header.tsx` | Shows LanguageSwitcher, uses translations |
| **Language Selector** | `LanguageSwitcher.tsx` | Main UI for language selection |
| **All Pages** | `[locale]/*` | URL-based locale routing |
| **All Components** | `useTranslations()` | Get translated strings |
| **Routing** | `middleware.ts` | Handles locale in URL |
| **Layout** | `[locale]/layout.tsx` | Loads translation files |
| **API Client** | `api.ts` | Connects to backend |
| **Backend** | `localisation.controller.ts` | Provides language data |

---

## 🔗 **INTERLINKING STATUS: ✅ COMPLETE**

**All components are fully interlinked:**
- ✅ Frontend ↔ Backend API
- ✅ Language Switcher ↔ URL Routing
- ✅ Translations ↔ All Components
- ✅ Country ↔ Language Integration
- ✅ RTL Support ↔ Layout System

**Everything works together seamlessly!** 🎉

