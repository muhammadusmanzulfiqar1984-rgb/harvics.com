# ⚡ QUICK CHECK GUIDE - 5 MINUTE VERIFICATION

## 🚀 QUICK START

### 1. Make Sure Servers Are Running

**Terminal 1 - Backend:**
```bash
cd "/Users/shahtabraiz/Desktop/Harvics BOT/harvics-localisation/backend"
node src/index.js
```

**Terminal 2 - Frontend:**
```bash
cd "/Users/shahtabraiz/Desktop/Harvics BOT/harviclocales-main"
npm run dev
```

---

## ✅ 5-MINUTE VERIFICATION CHECKLIST

### Check 1: Architecture CRM (2 minutes)
1. Open: `http://localhost:3000/en/portals/`
2. **Scroll down** past Access Portals and Login Portals
3. ✅ **Should see:** "🏢 Harvics CRM - Full Architecture" section
4. ✅ **Click tabs:** Overview, Orders, Inventory, Logistics, Finance, CRM, HR, Executive
5. ✅ **All tabs should work**

### Check 2: Localization Dashboard (2 minutes)
1. Open: `http://localhost:3000/en/localization-dashboard/`
2. ✅ **Should see:** 7 countries (Pakistan, UAE, United States, etc.)
3. **Click on Pakistan** card
4. ✅ **Should see:** Detailed Analysis with 3 tabs (Overview, Heatmap, White Spaces)
5. **Click Heatmap tab** → ✅ Should load GPS data
6. **Click White Spaces tab** → ✅ Should load satellite data

### Check 3: Backend APIs (1 minute)
1. Open: `http://localhost:5000/api/system/health`
   - ✅ Should show: `{"status":"ok",...}`

2. Open: `http://localhost:5000/api/localization/countries/summary`
   - ✅ Should show: `{"success":true,"count":7,...}`

3. Open: `http://localhost:5000/api/localization/realtime/pakistan`
   - ✅ Should show: `{"success":true,"data":{...}}`

---

## 📱 ALL PAGES TO CHECK (Copy & Paste URLs)

### Architecture Pages:
```
http://localhost:3000/en/portals/
http://localhost:3000/en/dashboard/company/
http://localhost:3000/en/dashboard/distributor/
http://localhost:3000/en/dashboard/supplier/
```

### Localization Pages:
```
http://localhost:3000/en/localization-dashboard/
```

### Portal Pages:
```
http://localhost:3000/en/portal/distributor/
http://localhost:3000/en/portal/retailer/
http://localhost:3000/en/portal/manager/
```

### Backend APIs (Test in Browser):
```
http://localhost:5000/api/system/health
http://localhost:5000/api/localization/countries/summary
http://localhost:5000/api/localization/realtime/pakistan
http://localhost:5000/api/localization/analysis/pakistan
http://localhost:5000/api/gps/heatmap/pakistan
http://localhost:5000/api/satellite/whitespaces/pakistan
```

---

## 🎯 AUTOMATED TEST

**Run this command:**
```bash
cd "/Users/shahtabraiz/Desktop/Harvics BOT/harviclocales-main"
./test-all.sh
```

This will test:
- ✅ Backend health
- ✅ All localization APIs
- ✅ GPS & Satellite APIs
- ✅ All frontend pages

---

## ✅ WHAT TO VERIFY

### On Portals Page (`/en/portals/`):
- [ ] Scroll down → See "🏢 Harvics CRM - Full Architecture" section
- [ ] EnterpriseCRM component with 8 tabs visible
- [ ] All tabs clickable and working
- [ ] Architecture levels info visible (Level 1, 2, 3)

### On Localization Dashboard (`/en/localization-dashboard/`):
- [ ] 7 countries visible in grid
- [ ] Click country → Detailed Analysis appears
- [ ] Overview tab shows analysis data
- [ ] Heatmap tab loads GPS data
- [ ] White Spaces tab loads satellite data

### On Backend APIs:
- [ ] All endpoints return `success: true`
- [ ] Countries summary shows 7 countries
- [ ] Realtime data works for Pakistan
- [ ] Analysis works for Pakistan
- [ ] GPS heatmap endpoint works
- [ ] Satellite white spaces endpoint works

---

**That's it! You've verified everything!** ✅

