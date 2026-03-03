export type UserRole =
  | 'supplier'
  | 'distributor'
  | 'sales_officer'
  | 'country_manager'
  | 'hq'
  | 'company';

export interface GeographicScope {
  global?: boolean;
  continents?: string[];
  regions?: string[];
  countries?: string[];
  cities?: string[];
  districts?: string[];
  areas?: string[];
  locations?: string[];
  territories?: string[];
}

export interface UserScope {
  userId: string;
  role: UserRole;
  countries: string[];
  territories: string[];
  distributorId?: string;
  supplierId?: string;
  warehouseIds: string[];
  currency: string;
  geographic?: GeographicScope;
}

export interface UserScopeTokenPayload {
  sub: string;
  scope: UserScope;
  iat: number;
}

