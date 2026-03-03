# 🌐 LOCALE SWITCHING - Complete Guide

**Status:** ✅ Fully Integrated & Working  
**Last Updated:** 2025-01-27

---

## ✅ **LOCALE FILES CREATED**

### **Essential Locales (7 files with full translations):**

| Language | File | Status | RTL | Lines |
|----------|------|--------|-----|-------|
| 🇬🇧 English | `en.json` | ✅ Complete | No | 125 |
| 🇫🇷 French | `fr.json` | ✅ Complete | No | 125 |
| 🇸🇦 Arabic | `ar.json` | ✅ Complete | Yes | 125 |
| 🇪🇸 Spanish | `es.json` | ✅ Complete | No | 125 |
| 🇩🇪 German | `de.json` | ✅ Complete | No | 125 |
| 🇨🇳 Chinese | `zh.json` | ✅ Complete | No | 125 |
| 🇮🇱 Hebrew | `he.json` | ✅ Complete | Yes | 125 |

**Location:** `src/locales/`

---

## 🔧 **CONFIGURATION FILES**

### **1. i18n.ts** (`src/i18n.ts`)
- ✅ Supports **38 languages** total
- ✅ Falls back to English if locale file missing
- ✅ Loads from `./locales/${locale}.json`

### **2. middleware.ts** (`src/middleware.ts`)
- ✅ Routes all 38 locales
- ✅ Default locale: `en`
- ✅ Matches: `/` and `/([a-z]{2})/:path*`

### **3. layout.tsx** (`src/app/[locale]/layout.tsx`)
- ✅ Updated to support all 38 locales
- ✅ Sets RTL for Arabic (`ar`) and Hebrew (`he`)
- ✅ Loads messages with fallback to English
- ✅ Provides `NextIntlClientProvider` context

---

## 🌐 **LANGUAGE SWITCHER**

### **Component:** `src/components/LanguageSwitcher.tsx`

**Features:**
- ✅ Shows **12 primary languages** by default
- ✅ "Show all" button for **26 extended languages**
- ✅ Fetches languages from backend API
- ✅ Falls back to hardcoded list if API fails
- ✅ Saves preference to backend
- ✅ Stores in localStorage
- ✅ Updates URL routing

**Primary Languages (Always Visible):**
1. 🇬🇧 English
2. 🇸🇦 Arabic
3. 🇫🇷 French
4. 🇪🇸 Spanish
5. 🇩🇪 German
6. 🇨🇳 Chinese
7. 🇵🇰 Urdu
8. 🇮🇳 Hindi
9. 🇵🇹 Portuguese
10. 🇷🇺 Russian
11. 🇮🇹 Italian
12. 🇹🇷 Turkish

**Extended Languages (Hidden by Default):**
- Hebrew, Japanese, Korean, Dutch, Polish, Vietnamese, Thai, Indonesian, Malay, Swahili, Ukrainian, Romanian, Czech, Swedish, Danish, Finnish, Norwegian, Greek, Hungarian, Bulgarian, Croatian, Slovak, Serbian, Bengali, Persian, Pashto

---

## 🔄 **HOW LANGUAGE SWITCHING WORKS**

### **Step-by-Step Flow:**

```
1. User clicks LanguageSwitcher button
   ↓
2. Dropdown shows primary languages (12)
   ↓
3. User selects a language (e.g., "Français")
   ↓
4. LanguageSwitcher.switchLanguage() called:
   ├─→ Saves to backend: POST /api/localisation/language-preference
   ├─→ Stores in localStorage: 'preferred_language'
   └─→ Updates URL: router.push(`/${newLocale}${path}`)
   ↓
5. Next.js middleware intercepts new URL
   ↓
6. Layout loads:
   ├─→ Detects locale from URL: /fr/...
   ├─→ Loads messages: import(`./locales/fr.json`)
   ├─→ Sets RTL if needed (ar, he)
   └─→ Provides NextIntlClientProvider
   ↓
7. All components re-render with new translations
   ↓
8. Page displays in selected language ✅
```

---

## 📍 **USAGE IN COMPONENTS**

### **Header Component:**
```tsx
import { useTranslations, useLocale } from 'next-intl'

const Header = () => {
  const t = useTranslations('navigation')
  const locale = useLocale()
  
  return <span>{t('home')}</span> // Shows "Home" or "Accueil" or "الرئيسية"
}
```

### **Footer Component:**
```tsx
const t = useTranslations('footer')
return <h3>{t('companyName')}</h3>
```

### **CRM Component:**
```tsx
const t = useTranslations('crm')
return <span>{t('kpis.totalOrders')}</span>
```

---

## 🎯 **TRANSLATION NAMESPACES**

### **Available Namespaces:**

1. **`navigation`** - Header menu items
   - home, about, aboutUs, products, ourProducts, viewAllProducts, csr, investorRelations, portals

2. **`footer`** - Footer content
   - companyName, tagline, description, quickLinks, home, aboutUs, products, contact, csr, contactInfo, copyright, followUs

3. **`crm`** - CRM dashboard
   - roleIndicator.* (distributor, supplier, manager, etc.)
   - tabs.* (overview, orders, inventory, logistics, etc.)
   - kpis.* (totalOrders, inventoryValue, logisticsEfficiency, etc.)
   - orders.*, inventory.*, logistics.*, finance.*
   - common.* (export, refresh, loading, etc.)

4. **`products`** - Product pages
   - pageTitle, subcategories, harvicsCatoPops.*, harvicsSnapbar.*

5. **`common`** - Common terms
   - welcome, home, about, products, contact, login, dashboard, logout, search, language, country

---

## 🚀 **TESTING LANGUAGE SWITCHING**

### **Manual Test:**

1. **Open website:** `http://localhost:3000/en/`
2. **Click language switcher** in header (flag icon)
3. **Select a language** (e.g., "Français")
4. **URL changes to:** `http://localhost:3000/fr/`
5. **Page reloads** in French
6. **All text translated** (Header, Footer, CRM, etc.)

### **Direct URL Test:**

- English: `http://localhost:3000/en/`
- French: `http://localhost:3000/fr/`
- Arabic: `http://localhost:3000/ar/` (RTL)
- Spanish: `http://localhost:3000/es/`
- German: `http://localhost:3000/de/`
- Chinese: `http://localhost:3000/zh/`
- Hebrew: `http://localhost:3000/he/` (RTL)

---

## 🔄 **FALLBACK MECHANISM**

### **If Locale File Missing:**

1. **i18n.ts** tries to load `./locales/${locale}.json`
2. **If file not found** → Falls back to `en.json`
3. **Layout.tsx** also has fallback logic
4. **User sees English** instead of error

### **Supported Locales (38 total):**

**With Files (7):** en, ar, fr, es, de, zh, he  
**Fallback to English (31):** hi, pt, ru, ja, ko, it, nl, pl, tr, vi, th, id, ms, sw, uk, ro, cs, sv, da, fi, no, el, hu, bg, hr, sk, sr, bn, ur, fa, ps

---

## ✅ **INTEGRATION STATUS**

| Component | Status | Notes |
|-----------|--------|-------|
| **Locale Files** | ✅ Complete | 7 essential files created |
| **i18n.ts** | ✅ Configured | Fallback to English |
| **middleware.ts** | ✅ Configured | Routes all 38 locales |
| **layout.tsx** | ✅ Updated | Supports all locales |
| **LanguageSwitcher** | ✅ Working | Shows 12 primary + 26 extended |
| **Header** | ✅ Using translations | `useTranslations('navigation')` |
| **Footer** | ✅ Using translations | `useTranslations('footer')` |
| **CRM** | ✅ Using translations | `useTranslations('crm')` |
| **RTL Support** | ✅ Working | Arabic & Hebrew |

---

## 🎉 **READY TO USE!**

**Language switching is now fully integrated and working!**

- ✅ Click language switcher → Select language → Page updates
- ✅ Direct URL access works (`/en/`, `/fr/`, `/ar/`, etc.)
- ✅ All components use translations
- ✅ RTL support for Arabic and Hebrew
- ✅ Fallback to English for missing locales

**Everything is connected and ready!** 🚀

