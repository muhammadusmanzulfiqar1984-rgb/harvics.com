# 📁 DATABASE FILE LOCATION

## 📂 **PRIMARY DATABASE (Payment Engine uses this)**

**Location:**
```
server/data/harvics_crm.db
```

**Full Path:**
```
/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/server/data/harvics_crm.db
```

**Size:** 6.7 GB (as of last check)

**Configured in:** `server/database.js` (line 5)

---

## 📋 **DATABASE STRUCTURE**

The database includes all Payment Engine tables:
- ✅ `payment_engine` - All payment records
- ✅ `payment_receipts` - Receipt records
- ✅ `supplier_invoices` - Supplier invoice uploads
- ✅ `invoices` - Invoice records
- ✅ `users` - User authentication
- ✅ All other CRM tables

---

## 🔍 **OTHER DATABASE FILES FOUND**

1. `harvics-localisation/backend/harvics.db`
2. `harvics-localisation/backend/src/data/harvics_crm.db`

**Note:** The Payment Engine uses the main database at `server/data/harvics_crm.db`

---

## 🔧 **HOW TO ACCESS THE DATABASE**

### **Option 1: SQLite Browser**
```bash
# Install DB Browser for SQLite (if not installed)
# Then open:
open server/data/harvics_crm.db
```

### **Option 2: Command Line (SQLite)**
```bash
cd server/data
sqlite3 harvics_crm.db

# Then run SQL queries:
.tables                    # List all tables
SELECT * FROM payment_engine LIMIT 10;
SELECT * FROM payment_receipts LIMIT 10;
```

### **Option 3: View Tables via Code**
The database is automatically initialized when the server starts.
All Payment Engine tables are created automatically.

---

## ⚠️ **IMPORTANT NOTES**

1. **Database is SQLite** - Single file database
2. **Auto-created** - Database and tables are created on first server start
3. **Size** - Current database is 6.7 GB (contains all CRM data)
4. **Backup** - Make backups before making changes
5. **Location** - Database file location is configured in `server/database.js`

---

## 📝 **VERIFY DATABASE EXISTS**

```bash
# Check if database file exists
ls -lh server/data/harvics_crm.db

# Check database size
du -h server/data/harvics_crm.db
```

---

## 🎯 **QUICK ACCESS**

```bash
# Navigate to database location
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/server/data"

# List database file
ls -lh harvics_crm.db
```

---

**Database Location: `server/data/harvics_crm.db`** ✅

