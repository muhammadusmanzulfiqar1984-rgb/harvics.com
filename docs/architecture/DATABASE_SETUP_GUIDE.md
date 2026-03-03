# Database Setup Guide - Prisma ORM

## Current Status

**No ORM Currently Configured** - Backend uses in-memory storage

## Recommended: Prisma ORM

Prisma is recommended because:
- ✅ Type-safe database client
- ✅ Excellent TypeScript support
- ✅ Easy migrations from SQL files
- ✅ Great developer experience
- ✅ Works seamlessly with PostgreSQL

---

## Setup Steps

### 1. Install Prisma

```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"
npm install prisma @prisma/client
npm install -D prisma
```

### 2. Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Database schema file
- `.env` - Environment variables (DATABASE_URL)

### 3. Configure Database Connection

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/harvics_db?schema=public"
```

### 4. Generate Prisma Schema from SQL Migrations

You have two options:

#### Option A: Convert SQL to Prisma Schema (Manual)
Convert the existing SQL migrations (`db/migrations/*.sql`) to Prisma schema format.

#### Option B: Use Prisma Migrate (Recommended)
1. Create initial Prisma schema based on V15.2 tables
2. Run `npx prisma migrate dev --name init`
3. Prisma will generate migration files automatically

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Update Services to Use Prisma

Replace in-memory storage in services with Prisma queries:

```typescript
// Before (in-memory)
let countriesStore: Country[] = [];

// After (with Prisma)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Example query
const countries = await prisma.country.findMany();
```

---

## Quick Start Commands

```bash
# Install Prisma
npm install prisma @prisma/client

# Initialize Prisma
npx prisma init

# Generate Prisma Client after schema changes
npx prisma generate

# Create migration from schema changes
npx prisma migrate dev --name migration_name

# View database in Prisma Studio (GUI)
npx prisma studio

# Reset database (dev only)
npx prisma migrate reset
```

---

## Alternative ORMs

### TypeORM
- ✅ More mature
- ✅ Decorator-based syntax
- ❌ More verbose
- ❌ Steeper learning curve

### Drizzle ORM
- ✅ Lightweight
- ✅ SQL-like syntax
- ❌ Less popular
- ❌ Smaller community

### Sequelize
- ✅ Very mature
- ❌ Less TypeScript-friendly
- ❌ Older API design

---

## Next Steps After Prisma Setup

1. **Convert V15.2 Schema to Prisma**
   - Create `prisma/schema.prisma` with all 31 tables
   - Define relationships
   - Add indexes

2. **Update Services**
   - Replace in-memory stores with Prisma queries
   - Add error handling
   - Add transaction support

3. **Set Up Database**
   - Install PostgreSQL
   - Create database
   - Run migrations

4. **Testing**
   - Test all CRUD operations
   - Verify relationships
   - Test transactions

---

## Example Prisma Schema (Countries Table)

```prisma
model Country {
  id            String   @id @default(uuid())
  iso_code      String   @unique @db.VarChar(3)
  name          String   @db.VarChar(100)
  currency_code String   @db.VarChar(3)
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  // Relations
  regions       Region[]
  cities        City[]
  territories   Territory[]
  distributors  Distributor[]

  @@index([iso_code])
  @@index([currency_code])
  @@map("countries")
}
```

---

## Current Services Status

### ✅ Using In-Memory Storage
- `countries.service.ts`
- `regions.service.ts`
- `cities.service.ts`

### 📋 Need Database Connection
- All 31 tables from V15.2 schema
- Distributors
- Orders
- Products/SKUs
- Invoices
- Tickets
- etc.

---

## Recommendation

**Start with Prisma** - It's the best fit for your TypeScript/Next.js stack and the V15.2 schema.

