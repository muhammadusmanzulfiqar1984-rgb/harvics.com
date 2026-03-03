# 🧪 How to Check Everything - Complete Testing Guide

This guide will help you verify all the fixes made to localization, tabs, and alignment.

## 📋 Quick Checklist

### ✅ 1. Localization Testing

#### Test All Languages on Key Pages:

**English (en):**
- ✅ http://localhost:3000/en (Home)
- ✅ http://localhost:3000/en/about
- ✅ http://localhost:3000/en/contact
- ✅ http://localhost:3000/en/products
- ✅ http://localhost:3000/en/csr
- ✅ http://localhost:3000/en/portals

**French (fr):**
- ✅ http://localhost:3000/fr (Home)
- ✅ http://localhost:3000/fr/about
- ✅ http://localhost:3000/fr/contact
- ✅ http://localhost:3000/fr/products
- ✅ http://localhost:3000/fr/csr
- ✅ http://localhost:3000/fr/portals

**Arabic (ar):**
- ✅ http://localhost:3000/ar (Should show RTL layout)

**Spanish (es), German (de), Chinese (zh), Hebrew (he):**
- ✅ Check if pages load without errors

#### What to Check:
- [ ] Language switcher in header works
- [ ] All navigation links use correct locale (`/en/...` or `/fr/...`)
- [ ] Footer links use correct locale
- [ ] No hardcoded English text visible
- [ ] All buttons and labels are translated
- [ ] Forms have translated labels and placeholders

### ✅ 2. Tab Functionality Testing

#### Localization Dashboard:
1. Go to: http://localhost:3000/en/localization-dashboard
2. Click on any country card (e.g., Pakistan, UAE)
3. Check tabs:
   - [ ] **Overview** tab - Shows analysis data
   - [ ] **Heatmap** tab - Click and wait for data to load
   - [ ] **White Spaces** tab - Click and wait for data to load
4. Verify:
   - [ ] Tabs are properly aligned
   - [ ] Active tab has golden background
   - [ ] Tab content switches correctly
   - [ ] Icons display correctly (📊 🗺️ 📍)

#### Enterprise CRM Dashboard:
1. Go to: http://localhost:3000/en/dashboard/company
2. Check main tabs (should scroll horizontally on mobile):
   - [ ] **Overview** - Shows KPIs and summaries
   - [ ] **Orders** - Shows order data
   - [ ] **Inventory** - Shows inventory data with sub-tabs
   - [ ] **Logistics** - Shows logistics data
   - [ ] **Finance** - Shows finance data with sub-tabs (Overview, AR, AP, GL, Cash)
   - [ ] **CRM** - Shows customer data
   - [ ] **HR** - Shows HR data
   - [ ] **Executive** - Shows executive dashboard

3. Check sub-tabs:
   - [ ] Finance sub-tabs are aligned and work
   - [ ] Inventory sub-tabs are aligned and work

### ✅ 3. Alignment & Layout Testing

#### Responsive Design:
Test on different screen sizes:
- [ ] Mobile (375px width) - Tabs should wrap or scroll
- [ ] Tablet (768px width) - Layout should adjust
- [ ] Desktop (1024px+) - Full layout visible

#### Check Alignment:
- [ ] All tabs are aligned horizontally
- [ ] Tab content is properly indented
- [ ] No overlapping elements
- [ ] Text is readable at all sizes
- [ ] Buttons are properly sized and spaced

### ✅ 4. Component Testing

#### Header Component:
- [ ] Language switcher works
- [ ] Navigation dropdowns work
- [ ] Mobile menu works
- [ ] All links include locale

#### Footer Component:
- [ ] All links include locale
- [ ] Social media links work
- [ ] Text is properly translated

#### Home Page Components:
- [ ] CreativeHero - Welcome text translated
- [ ] CreativeProductShowcase - Product names translated
- [ ] ContactSection - Contact info translated

### ✅ 5. Form Testing

#### Contact Page Form:
1. Go to: http://localhost:3000/fr/contact
2. Check:
   - [ ] All labels are in French
   - [ ] Placeholders are in French
   - [ ] Button text is in French

### ✅ 6. Browser Console Testing

Open browser DevTools (F12) and check:
- [ ] No console errors
- [ ] No 404 errors for missing translations
- [ ] No hydration errors
- [ ] Network requests are successful

## 🚀 Quick Test Script

Run this in your browser console while on any page:

```javascript
// Check if all localization is working
console.log('=== Localization Check ===');
const hardcodedText = ['Home', 'About', 'Products', 'Contact'];
const pageText = document.body.innerText;
hardcodedText.forEach(text => {
  if (pageText.includes(text) && !pageText.includes('/' + text.toLowerCase())) {
    console.warn('Possible hardcoded text:', text);
  }
});

// Check tab functionality
console.log('=== Tab Check ===');
const tabs = document.querySelectorAll('[class*="tab"]');
console.log('Found tabs:', tabs.length);
tabs.forEach(tab => {
  if (tab.onclick) {
    console.log('✅ Tab has click handler:', tab.textContent);
  }
});
```

## 📱 Manual Testing Steps

### Step 1: Start Development Server
```bash
cd "/Users/shahtabraiz/Desktop/Harvics BOT/harviclocales-main"
npm run dev
```

### Step 2: Open Browser
Navigate to: http://localhost:3000

### Step 3: Test Language Switcher
1. Click language switcher in header
2. Switch to French
3. Verify URL changes to `/fr/...`
4. Check that content is in French

### Step 4: Test Each Page
1. Home (`/`)
2. About (`/about`)
3. Contact (`/contact`)
4. Products (`/products`)
5. CSR (`/csr`)
6. Portals (`/portals`)
7. Localization Dashboard (`/localization-dashboard`)
8. Company Dashboard (`/dashboard/company`)

### Step 5: Test Tabs
1. Go to Localization Dashboard
2. Click a country
3. Test all 3 tabs
4. Go to Company Dashboard
5. Test all 8 main tabs
6. Test Finance sub-tabs
7. Test Inventory sub-tabs

## 🐛 Common Issues & Solutions

### Issue: Tabs not switching
**Solution:** Check browser console for JavaScript errors

### Issue: Translations not showing
**Solution:** 
1. Check if locale file exists in `src/locales/`
2. Verify translation keys match
3. Clear browser cache and reload

### Issue: Tabs misaligned on mobile
**Solution:** 
1. Check if `flex-wrap` is applied
2. Verify `scrollbar-hide` class is working
3. Check responsive breakpoints

### Issue: Language switcher not working
**Solution:**
1. Check if `useLocale()` hook is used
2. Verify `router.push()` includes locale
3. Check middleware configuration

## 📊 Test Results Template

Copy this template and fill it out:

```
LOCALIZATION TESTS:
- [ ] English pages: __________
- [ ] French pages: __________
- [ ] Arabic pages: __________
- [ ] Other languages: __________

TAB FUNCTIONALITY:
- [ ] Localization Dashboard tabs: __________
- [ ] Enterprise CRM main tabs: __________
- [ ] Finance sub-tabs: __________
- [ ] Inventory sub-tabs: __________

RESPONSIVE DESIGN:
- [ ] Mobile (375px): __________
- [ ] Tablet (768px): __________
- [ ] Desktop (1024px+): __________

ALIGNMENT:
- [ ] Tab alignment: __________
- [ ] Content alignment: __________
- [ ] Footer alignment: __________

CONSOLE ERRORS:
- [ ] Any errors found: __________
```

## 🎯 Priority Tests (Must Check!)

1. **Language switcher** - Most important UX feature
2. **Localization Dashboard tabs** - Main functionality
3. **Enterprise CRM tabs** - Core business feature
4. **Mobile responsive tabs** - Critical for mobile users
5. **French translations** - Most complete after English

---

**Need Help?** If you find any issues, note down:
1. Which page/component
2. What language
3. What screen size
4. Browser console errors
5. Screenshot if possible
