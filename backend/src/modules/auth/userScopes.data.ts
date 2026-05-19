import bcrypt from 'bcryptjs';
import { UserScope } from './userScope.types';

// Demo credentials. Plain-text passwords are hashed at module load with
// bcryptjs so the runtime path uses the same compare logic as production.
// Swap this map for a real users table — no other call sites change.
const DEMO_PASSWORDS: Record<string, string> = {
  admin: 'admin',
  supplier_user: 'password',
  distributor_user: 'password',
  sales_officer_user: 'password',
  country_manager_user: 'password',
  hq_user: 'password',
};

export const mockUserCredentials: Record<string, { passwordHash: string }> = Object.fromEntries(
  Object.entries(DEMO_PASSWORDS).map(([user, pwd]) => [user, { passwordHash: bcrypt.hashSync(pwd, 10) }])
);

export function verifyPassword(username: string, plaintext: string): boolean {
  const record = mockUserCredentials[username];
  if (!record) return false;
  return bcrypt.compareSync(plaintext, record.passwordHash);
}

export const mockUserScopes: Record<string, UserScope> = {
  admin: {
    userId: 'admin',
    role: 'company',
    countries: ['US', 'PK', 'AE', 'GB', 'IT'],
    territories: ['US-WEST', 'US-EAST', 'PK-NORTH', 'PK-SOUTH', 'AE-DXB', 'AE-AUH', 'GB-LON', 'IT-MIL'],
    warehouseIds: ['wh_us_west', 'wh_us_east', 'wh_pk_lhr', 'wh_pk_khi', 'wh_ae_dubai', 'wh_gb_london', 'wh_it_milan'],
    distributorId: undefined,
    supplierId: undefined,
    currency: 'USD',
    geographic: {
      global: true  // Super admin sees everything globally
    },
  },
  supplier_user: {
    userId: 'supplier_user',
    role: 'supplier',
    countries: ['PK'],
    territories: ['PK-SOUTH'],
    supplierId: 'sup_pk_megafoods',
    warehouseIds: ['wh_pk_south', 'wh_pk_karachi'],
    currency: 'PKR',
    distributorId: undefined,
    geographic: {
      countries: ['PK'],
      cities: ['KHI'],  // Karachi only
      territories: ['PK-SOUTH']
    },
  },
  distributor_user: {
    userId: 'distributor_user',
    role: 'distributor',
    countries: ['AE'],
    territories: ['AE-DXB', 'AE-AUH'],
    distributorId: 'dist_ae_dubai',
    warehouseIds: ['wh_ae_dubai'],
    supplierId: undefined,
    currency: 'AED',
    geographic: {
      countries: ['AE'],
      cities: ['DXB', 'AUH'],  // Dubai and Abu Dhabi
      territories: ['AE-DXB', 'AE-AUH']
    },
  },
  sales_officer_user: {
    userId: 'sales_officer_user',
    role: 'sales_officer',
    countries: ['AE'],
    territories: ['AE-DXB'],
    distributorId: 'dist_ae_dubai',
    warehouseIds: [],
    supplierId: undefined,
    currency: 'AED',
    geographic: {
      countries: ['AE'],
      cities: ['DXB'],  // Dubai only
      territories: ['AE-DXB']
    },
  },
  country_manager_user: {
    userId: 'country_manager_user',
    role: 'country_manager',
    countries: ['US'],
    territories: ['US-WEST', 'US-EAST'],
    warehouseIds: ['wh_us_west', 'wh_us_east'],
    distributorId: undefined,
    supplierId: undefined,
    currency: 'USD',
    geographic: {
      countries: ['US'],
      territories: ['US-WEST', 'US-EAST']
    },
  },
  hq_user: {
    userId: 'hq_user',
    role: 'hq',
    countries: ['US', 'PK', 'AE'],
    territories: ['US-WEST', 'US-EAST', 'PK-NORTH', 'PK-SOUTH', 'AE-DXB', 'AE-AUH'],
    warehouseIds: ['wh_us_west', 'wh_us_east', 'wh_pk_lhr', 'wh_pk_khi', 'wh_ae_dubai'],
    distributorId: undefined,
    supplierId: undefined,
    currency: 'USD',
    geographic: {
      countries: ['US', 'PK', 'AE'],
      territories: ['US-WEST', 'US-EAST', 'PK-NORTH', 'PK-SOUTH', 'AE-DXB', 'AE-AUH']
    },
  },
};

export const getMockUserScope = (userId: string): UserScope | null => {
  return mockUserScopes[userId] || null;
};

