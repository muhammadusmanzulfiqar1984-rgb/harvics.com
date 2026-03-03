# 🚀 PAYMENT ENGINE - QUICK START GUIDE

## 📋 **HOW TO RUN THE PAYMENT ENGINE**

---

## **OPTION 1: Manual Start (Recommended for Development)**

### **Step 1: Start Backend Server**

```bash
# Navigate to server directory
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/server"

# Install dependencies (if not already installed)
npm install

# Start the backend server
npm run dev
```

**Backend will run on:** `http://localhost:4000` (or port 5000 - check your .env)

**Payment API Endpoints:**
- `POST /api/payments/create`
- `GET /api/payments`
- `POST /api/payments/receipt/:paymentId`
- And 9 more endpoints...

---

### **Step 2: Start Frontend Application**

```bash
# Open a NEW terminal window
# Navigate to frontend directory
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"

# Install dependencies (if not already installed)
npm install

# Start the frontend development server
npm run dev
```

**Frontend will run on:** `http://localhost:3000`

---

### **Step 3: Access Payment Pages**

Once both servers are running, access:

#### **Distributor Portal:**
1. Login at: `http://localhost:3000/en/login`
2. Navigate to: `http://localhost:3000/en/portal/distributor/payments`
3. Or directly:
   - Payments Dashboard: `/portal/distributor/payments`
   - Make Payment: `/portal/distributor/payments/make-payment`
   - Payment History: `/portal/distributor/payments/history`
   - Invoices: `/portal/distributor/payments/invoices`
   - Receipts: `/portal/distributor/payments/receipts`

#### **Supplier Portal:**
1. Login as supplier
2. Navigate to:
   - Upload Invoice: `/portal/supplier/payments/upload-invoice`
   - Payment Status: `/portal/supplier/payments/payment-status`

#### **Finance OS:**
1. Login as finance/admin user
2. Navigate to:
   - Verification Queue: `/os/finance/payments/verification-queue`

---

## **OPTION 2: Automated Start Script**

If you have the startup script:

```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics"

# Make script executable (first time only)
chmod +x start-complete.sh

# Run the script
./start-complete.sh
```

This will start both backend and frontend automatically.

---

## **🔧 ENVIRONMENT SETUP**

### **Backend Environment Variables**

Create or check `.env` file in `server/` directory:

```env
# Server Port
PORT=4000
# or
PORT=5000

# JWT Secret (REQUIRED)
JWT_SECRET=your-secret-key-minimum-32-characters-long

# Database
DB_PATH=./harvics.db

# Email (Optional - for receipt emails)
EMAIL_ENABLED=false

# API URL (for frontend)
NEXT_PUBLIC_API_URL=http://localhost:4000
# or
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### **Frontend Environment Variables**

Create or check `.env.local` file in `harviclocales-main/` directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000

# Or if backend runs on port 5000:
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## **✅ VERIFICATION CHECKLIST**

After starting both servers, verify:

### **Backend Health Check:**
```bash
# Test backend is running
curl http://localhost:4000/api/system/health
# or
curl http://localhost:5000/api/system/health
```

### **Payment API Test:**
```bash
# Test payment endpoints (requires authentication)
curl http://localhost:4000/api/payments
```

### **Frontend Check:**
- Open browser: `http://localhost:3000`
- Should see Harvics website

---

## **🔐 LOGIN CREDENTIALS**

You need valid user credentials to access payment pages:

### **Test Users:**
1. **Distributor User:**
   - Role: `distributor` or `distributor_admin`
   - Access: Distributor payment pages

2. **Supplier User:**
   - Role: `supplier` or `supplier_admin`
   - Access: Supplier payment pages

3. **Finance User:**
   - Role: `finance` or `admin`
   - Access: Finance OS verification queue

---

## **📊 DATABASE INITIALIZATION**

The database will be automatically initialized on first server start:

- Location: `server/harvics.db`
- Tables will be created automatically
- Payment Engine tables will be initialized

**No manual database setup required!**

---

## **🐛 TROUBLESHOOTING**

### **Issue: Backend won't start**

**Solution:**
```bash
# Check if port is already in use
lsof -ti:4000
# or
lsof -ti:5000

# Kill process if needed
kill -9 <PID>

# Check JWT_SECRET is set
echo $JWT_SECRET

# Check logs
tail -f server/logs/*.log
```

### **Issue: Frontend can't connect to backend**

**Solution:**
1. Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
2. Verify backend is running on correct port
3. Check CORS settings in backend
4. Verify authentication token is valid

### **Issue: Payment pages show errors**

**Solution:**
1. Check browser console for errors
2. Verify you're logged in with correct role
3. Check backend logs for API errors
4. Verify database tables exist

### **Issue: Receipt generation fails**

**Solution:**
1. Check `receipts/` directory exists in `server/`
2. Verify PDF generation permissions
3. Check logs for PDF generation errors

---

## **📝 QUICK COMMANDS REFERENCE**

```bash
# Start backend
cd server && npm run dev

# Start frontend
cd harviclocales-main && npm run dev

# Check backend logs
tail -f server/logs/backend.log

# Check frontend logs
tail -f logs/frontend.log

# Stop all servers
# Press Ctrl+C in each terminal

# Or kill by port:
kill -9 $(lsof -ti:4000)  # Backend
kill -9 $(lsof -ti:3000)  # Frontend
```

---

## **🎯 NEXT STEPS AFTER STARTING**

1. ✅ Login to the application
2. ✅ Navigate to Distributor/Supplier/Finance portal
3. ✅ Access payment pages
4. ✅ Test payment creation
5. ✅ Test receipt generation
6. ✅ Test payment verification (if finance user)

---

## **📞 SUPPORT**

If you encounter issues:
1. Check the logs in `server/logs/` and `logs/`
2. Verify environment variables are set
3. Ensure ports are not in use
4. Check database file permissions

---

**🚀 Ready to run! Start with Option 1 (Manual Start) for the best experience.**

