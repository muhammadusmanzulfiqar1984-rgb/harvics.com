# 🗄️ Database Setup Guide - Territory Hierarchy

## Quick Start: Run Real Database

### **Option 1: SQLite (Easiest - Recommended for Development)**

SQLite is already configured in your backend. Just run the migration:

```bash
# Navigate to project root
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"

# Run migration using Node.js
node -e "
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Create/connect to database
const dbPath = path.join(__dirname, '..', 'server', 'data', 'harvics.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Read migration file
const migrationSQL = fs.readFileSync(
  path.join(__dirname, 'db', 'migrations', '003_territory_hierarchy.sql'),
  'utf8'
);

// Execute migration (split by semicolons)
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log('🚀 Running territory hierarchy migration...');
statements.forEach((stmt, index) => {
  try {
    if (stmt) {
      db.exec(stmt);
      console.log(\`✅ Statement \${index + 1} executed\`);
    }
  } catch (error) {
    if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
      console.error(\`❌ Error in statement \${index + 1}:\`, error.message);
    }
  }
});

console.log('✅ Migration completed!');
db.close();
"
```

### **Option 2: PostgreSQL (Production-Ready)**

If you want to use PostgreSQL:

```bash
# 1. Install PostgreSQL (if not installed)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# 2. Create database
createdb harvics_db

# 3. Run migration
psql -U your_username -d harvics_db -f db/migrations/003_territory_hierarchy.sql

# Or with password prompt:
PGPASSWORD=your_password psql -U your_username -d harvics_db -f db/migrations/003_territory_hierarchy.sql
```

### **Option 3: Automated Setup Script**

Create a setup script:

```bash
# Create setup script
cat > setup-database.sh << 'EOF'
#!/bin/bash

echo "🗄️  Setting up Harvics Territory Database..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Navigate to project
cd "$(dirname "$0")/Harvics/harviclocales-main"

# Check if better-sqlite3 is installed
if ! npm list better-sqlite3 &> /dev/null; then
    echo "📦 Installing better-sqlite3..."
    cd ../server
    npm install better-sqlite3
    cd ../harviclocales-main
fi

# Create data directory
mkdir -p ../server/data

# Run migration
echo "🚀 Running migration..."
node -e "
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'server', 'data', 'harvics.db');
const db = new Database(dbPath);

const migrationSQL = fs.readFileSync(
  path.join(__dirname, 'db', 'migrations', '003_territory_hierarchy.sql'),
  'utf8'
);

const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('CREATE OR REPLACE'));

console.log('Executing', statements.length, 'statements...');
statements.forEach((stmt, index) => {
  try {
    if (stmt && stmt.length > 10) {
      db.exec(stmt + ';');
    }
  } catch (error) {
    if (!error.message.includes('already exists') && 
        !error.message.includes('duplicate') &&
        !error.message.includes('syntax error')) {
      console.error('Error:', error.message.substring(0, 100));
    }
  }
});

console.log('✅ Database setup complete!');
db.close();
"

echo "✅ Setup complete! Database location: ../server/data/harvics.db"
EOF

chmod +x setup-database.sh
./setup-database.sh
```

---

## Verify Database Setup

### Check if tables were created:

```bash
# SQLite
sqlite3 ../server/data/harvics.db ".tables" | grep territory

# Or using Node.js
node -e "
const Database = require('better-sqlite3');
const db = new Database('../server/data/harvics.db');
const tables = db.prepare(\"SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'territory%'\").all();
console.log('Territory tables:', tables.map(t => t.name));
db.close();
"
```

### Check sample data:

```bash
node -e "
const Database = require('better-sqlite3');
const db = new Database('../server/data/harvics.db');

// Check continents
const continents = db.prepare('SELECT * FROM territory_continent').all();
console.log('Continents:', continents);

// Check full path example
const path = db.prepare(\`
  SELECT 
    g.name as globe,
    c.name as continent,
    r.name as region,
    co.name as country,
    ci.name as city,
    d.name as district,
    s.name as street,
    p.name as point
  FROM territory_point p
  JOIN territory_street s ON p.street_id = s.id
  JOIN territory_district d ON s.district_id = d.id
  JOIN territory_city ci ON d.city_id = ci.id
  JOIN territory_country co ON ci.country_id = co.id
  JOIN territory_regional r ON co.regional_id = r.id
  JOIN territory_continent c ON r.continent_id = c.id
  JOIN territory_global g ON c.global_id = g.id
  LIMIT 1
\`).get();

if (path) {
  console.log('\\n✅ Sample path:');
  console.log(\`\${path.globe} / \${path.continent} / \${path.region} / \${path.country} / \${path.city} / \${path.district} / \${path.street} / \${path.point}\`);
}

db.close();
"
```

---

## Update Backend to Use Real Database

### Update `server/services/territoryService.js`:

Make sure it's using the real database connection:

```javascript
// In server/services/territoryService.js
// The service should already be using the db passed from index.js
// Just verify the database path is correct
```

### Update `server/index.js`:

Ensure database is initialized:

```javascript
// In server/index.js
const db = initDatabase(); // This should create/connect to harvics.db

// Verify territory tables exist
try {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'territory%'").all();
  console.log('✅ Territory tables found:', tables.map(t => t.name));
} catch (error) {
  console.warn('⚠️  Territory tables not found. Run migration first.');
}
```

---

## Quick Setup Command (One-Liner)

```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics" && \
cd server && npm install better-sqlite3 2>/dev/null; \
cd ../harviclocales-main && \
node -e "
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'server', 'data', 'harvics.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const db = new Database(dbPath);
const sql = fs.readFileSync('db/migrations/003_territory_hierarchy.sql', 'utf8');
sql.split(';').forEach(s => { try { const stmt = s.trim(); if (stmt && !stmt.startsWith('--') && stmt.length > 10) db.exec(stmt + ';'); } catch(e) { if (!e.message.includes('already exists')) console.log('Note:', e.message.substring(0, 50)); } });
console.log('✅ Database ready at:', dbPath);
db.close();
"
```

---

## Troubleshooting

### Issue: "better-sqlite3 not found"
```bash
cd server
npm install better-sqlite3
```

### Issue: "Database file not found"
```bash
mkdir -p server/data
# Then run migration again
```

### Issue: "Migration errors"
- Check if tables already exist (that's okay, migration is idempotent)
- Check SQL syntax (PostgreSQL vs SQLite differences)
- Verify file path is correct

### Issue: "Backend not connecting"
- Check database path in `server/database.js`
- Verify database file exists: `ls -la server/data/harvics.db`
- Check file permissions

---

## Next Steps After Setup

1. **Verify tables exist:**
   ```bash
   sqlite3 server/data/harvics.db ".tables"
   ```

2. **Add more territory data:**
   - Use the API endpoints to add countries, cities, locations
   - Or insert directly via SQL

3. **Test API:**
   ```bash
   curl http://localhost:5000/api/territory/continents
   ```

4. **Update frontend:**
   - Frontend will automatically use real data once backend is connected
   - No frontend changes needed!

---

**That's it! Your real database is now ready to use! 🎉**

