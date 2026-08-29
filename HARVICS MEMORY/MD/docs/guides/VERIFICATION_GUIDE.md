# ✅ How to Check if Everything is Working

## 🚀 Step 1: Start the Development Server

```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"
npm run dev
```

Wait for the message: `✓ Ready in X seconds` and `Local: http://localhost:3000`

## 🔍 Step 2: Test All Features

### A. Test Regular Portals (No Login Required)

Open these URLs in your browser:

1. **Distributor Portal**
   - URL: `http://localhost:3000/en/portal/distributor/`
   - ✅ Should show: Portal dashboard with KPIs and domain services
   - ✅ Click "View Full CRM" button → Should open CRM page

2. **Retailer Portal**
   - URL: `http://localhost:3000/en/portal/retailer/`
   - ✅ Should show: Retailer portal dashboard

3. **Sales Portal**
   - URL: `http://localhost:3000/en/portal/sales/`
   - ✅ Should show: Sales portal dashboard

4. **Manager Cockpit**
   - URL: `http://localhost:3000/en/portal/manager/`
   - ✅ Should show: Manager cockpit with executive KPIs

5. **Investor Dashboard**
   - URL: `http://localhost:3000/en/portal/investor/`
   - ✅ Should show: Investor dashboard with financial data

6. **AI Copilot**
   - URL: `http://localhost:3000/en/portal/copilot/`
   - ✅ Should show: Copilot interface

### B. Test CRM Pages

For each portal above, click the "View Full CRM" button or go directly to:

1. **Distributor CRM**
   - URL: `http://localhost:3000/en/portal/distributor/crm/`
   - ✅ Should show: Full CRM with tabs (Overview, Orders, Inventory, Logistics, Finance, CRM, etc.)

2. **Manager CRM**
   - URL: `http://localhost:3000/en/portal/manager/crm/`
   - ✅ Should show: Full CRM with ALL tabs including OS domains:
     - Legal/IPR ⚖️
     - Competitor 🔍
     - Import/Export 🌐
     - GPS Tracking 📍
     - Localization 🌍
     - Workflows ⚙️
     - Admin 🔧

3. **Test OS Domain Tabs**
   - Click on "Legal/IPR" tab → Should show legal dashboard
   - Click on "Competitor" tab → Should show competitor analysis
   - Click on "Import/Export" tab → Should show import/export dashboard
   - Click on "GPS Tracking" tab → Should show GPS tracking dashboard
   - Click on "Localization" tab → Should show localization settings
   - Click on "Workflows" tab → Should show workflow management

### C. Test Admin Portal Access (No Authentication)

1. **Admin Portal Hub**
   - URL: `http://localhost:3000/en/admin/portal/`
   - ✅ Should show: Green banner "ADMIN ACCESS" and grid of all portals

2. **Admin Distributor Portal**
   - URL: `http://localhost:3000/en/admin/portal/distributor/`
   - ✅ Should show: Green banner at top + Distributor portal

3. **Admin Manager CRM**
   - URL: `http://localhost:3000/en/admin/portal/manager/crm/`
   - ✅ Should show: Green banner + Full CRM with all tabs

4. **Admin Company Dashboard**
   - URL: `http://localhost:3000/en/admin/company-dashboard/`
   - ✅ Should show: Green banner + Company dashboard

### D. Test Main Pages

1. **Portals Hub**
   - URL: `http://localhost:3000/en/portals/`
   - ✅ Should show: Portal selection page with "Admin Portal Access" section

2. **About Page**
   - URL: `http://localhost:3000/en/about/`
   - ✅ Should show: About page (no Footer error)

3. **Contact Page**
   - URL: `http://localhost:3000/en/contact/`
   - ✅ Should show: Contact page (no Footer error)

4. **Products Page**
   - URL: `http://localhost:3000/en/products/`
   - ✅ Should show: Products page (no Footer error)

## 🐛 Step 3: Check for Errors

### Browser Console
1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to **Console** tab
3. Look for any red errors
4. ✅ Should see: No errors (or only warnings)

### Network Tab
1. Open browser DevTools
2. Go to **Network** tab
3. Refresh the page
4. Look for failed requests (red status codes)
5. ✅ Should see: Most requests return 200 (success)

### Terminal/Server Logs
1. Check the terminal where `npm run dev` is running
2. Look for error messages
3. ✅ Should see: No compilation errors

## ✅ Quick Verification Checklist

- [ ] Server starts without errors
- [ ] All portal URLs load (distributor, retailer, sales, manager, investor, copilot)
- [ ] "View Full CRM" buttons work on all portals
- [ ] CRM pages load with all tabs
- [ ] OS domain tabs work (Legal, Competitor, Import/Export, GPS, etc.)
- [ ] Admin portal routes work (green banner visible)
- [ ] Company dashboard loads via admin route
- [ ] Main pages load (About, Contact, Products)
- [ ] No console errors in browser
- [ ] No build errors in terminal

## 🔧 If Something Doesn't Work

### Issue: Page shows 404
- **Fix**: Make sure URL ends with `/` (trailing slash required)

### Issue: White screen or blank page
- **Fix**: Check browser console for errors
- **Fix**: Check terminal for compilation errors
- **Fix**: Try restarting the dev server

### Issue: CRM tabs not showing
- **Fix**: Make sure you're accessing manager/company persona (they have all tabs)
- **Fix**: Check browser console for JavaScript errors

### Issue: OS domain tabs not working
- **Fix**: They should work now with demo data fallback
- **Fix**: Check if you're on manager/company persona

## 📞 Quick Test Commands

```bash
# Check if server is running
curl http://localhost:3000/api/health

# Check build status
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"
npm run build
```

## 🎯 Expected Results

✅ **All portals should:**
- Load without errors
- Show KPIs and domain services
- Have working "View Full CRM" buttons

✅ **All CRM pages should:**
- Load with tab navigation
- Show data (demo data if APIs fail)
- Have working OS domain tabs

✅ **Admin routes should:**
- Show green "ADMIN ACCESS" banner
- Work without authentication
- Load all portal types

✅ **No errors should appear in:**
- Browser console
- Terminal output
- Build process

