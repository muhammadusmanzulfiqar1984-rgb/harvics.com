import { GeographicScope } from './geographicScope'

export type UserRole =
  | 'supplier'
  | 'distributor'
  | 'sales_officer'
  | 'country_manager'
  | 'hq'
  | 'super_admin'
  | 'admin'
  | 'legal_admin'
  | 'import_export_admin'
  | 'gps_admin'
  | 'competitor_admin'
  | 'company_admin'
  | 'sales_manager'
  | 'hr_manager'
  | 'finance_manager'
  | 'operations_manager'
  | 'marketing_manager'
  | 'procurement'
  | 'company';

export interface UserScope {
  userId: string;
  role: UserRole;
  
  // Geographic Access (full hierarchy)
  geographic: GeographicScope;
  
  // Legacy fields (for backward compatibility)
  countries?: string[];
  territories?: string[];
  
  // Entity references
  distributorId?: string;
  supplierId?: string;
  warehouseIds: string[];
  currency: string;
}

