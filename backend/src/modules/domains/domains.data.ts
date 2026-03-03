import { UserScope } from '../auth/userScope.types';

export type CountryCode = 'US' | 'PK' | 'AE';

export interface CountryOrdersData {
  total: number;
  pending: number;
  completed: number;
  inTransit: number;
  currency: string;
  orders: Array<{
    id: string;
    customer: string;
    city: string;
    channel: string;
    amount: number;
    status: 'Pending' | 'Completed' | 'In Transit' | 'Delayed';
    eta: string;
  }>;
}

export interface CountryInventoryData {
  totalValue: number;
  lowStock: number;
  totalSkus: number;
  skus: Array<{
    sku: string;
    description: string;
    packSize: string;
    mrp: number;
    onHand: number;
    warehouseId: string;
    minStock: number;
  }>;
}

export interface CountryLogisticsData {
  efficiency: number;
  deliveries: number;
  onTime: number;
  activeRoutes: number;
  whiteSpaces: number;
}

export interface CountryFinanceData {
  revenue: number;
  expenses: number;
  profit: number;
  pendingPayments: number;
  currency: string;
}

export interface CountryCRMData {
  totalCustomers: number;
  activeCustomers: number;
  complaints: number;
  promotions: number;
}

export interface CountryHRData {
  totalEmployees: number;
  fieldForce: number;
  salesOfficers: number;
  attendanceRate: number;
}

export interface CountryExecutiveData {
  profit: number;
  growth: number;
  marketShare: number;
  roi: number;
  narrative: string;
}

export interface CountryDomainData {
  countryCode: CountryCode;
  currency: string;
  orders: CountryOrdersData;
  inventory: CountryInventoryData;
  logistics: CountryLogisticsData;
  finance: CountryFinanceData;
  crm: CountryCRMData;
  hr: CountryHRData;
  executive: CountryExecutiveData;
}

export class UnsupportedCountryError extends Error {
  constructor(code?: string) {
    super(`Unsupported country code: ${code}`);
    this.name = 'UnsupportedCountryError';
  }
}

type DomainSliceRecord = {
  id: string;
  countryCode: CountryCode;
  territory: string;
  distributorId?: string;
  supplierId?: string;
  warehouseIds: string[];
  orders: CountryOrdersData;
  inventory: CountryInventoryData;
  logistics: CountryLogisticsData;
  finance: CountryFinanceData;
  crm: CountryCRMData;
  hr: CountryHRData;
  executive: CountryExecutiveData;
};

const countryMeta: Record<CountryCode, { currency: string; name: string }> = {
  US: { currency: 'USD', name: 'United States' },
  PK: { currency: 'PKR', name: 'Pakistan' },
  AE: { currency: 'AED', name: 'United Arab Emirates' },
};

const domainSlices: DomainSliceRecord[] = [
  {
    id: 'us-west',
    countryCode: 'US',
    territory: 'US-WEST',
    distributorId: 'dist_us_west',
    supplierId: 'sup_us_canners',
    warehouseIds: ['wh_us_west'],
    orders: {
      total: 480,
      pending: 22,
      completed: 430,
      inTransit: 28,
      currency: 'USD',
      orders: [
        {
          id: 'US-WEST-1001',
          customer: 'Costco West',
          city: 'Seattle',
          channel: 'Modern Trade',
          amount: 320000,
          status: 'Completed',
          eta: 'Delivered',
        },
        {
          id: 'US-WEST-1002',
          customer: 'Whole Foods',
          city: 'Portland',
          channel: 'Premium Grocery',
          amount: 185000,
          status: 'Pending',
          eta: '2 days',
        },
      ],
    },
    inventory: {
      totalValue: 1250000,
      lowStock: 4,
      totalSkus: 42,
      skus: [
        {
          sku: 'US-ENERGY-12PK',
          description: 'Energy Infusion 12pk',
          packSize: '12x330ml',
          mrp: 24,
          onHand: 520,
          warehouseId: 'wh_us_west',
          minStock: 400,
        },
        {
          sku: 'US-PROTEIN-BAR',
          description: 'Protein Crunch Bars',
          packSize: '24x55g',
          mrp: 32,
          onHand: 310,
          warehouseId: 'wh_us_west',
          minStock: 280,
        },
      ],
    },
    logistics: {
      efficiency: 92,
      deliveries: 118,
      onTime: 110,
      activeRoutes: 16,
      whiteSpaces: 2,
    },
    finance: {
      revenue: 3200000,
      expenses: 2150000,
      profit: 1050000,
      pendingPayments: 54000,
      currency: 'USD',
    },
    crm: {
      totalCustomers: 58,
      activeCustomers: 49,
      complaints: 2,
      promotions: 3,
    },
    hr: {
      totalEmployees: 45,
      fieldForce: 28,
      salesOfficers: 6,
      attendanceRate: 97,
    },
    executive: {
      profit: 1050000,
      growth: 11.3,
      marketShare: 18,
      roi: 19.2,
      narrative: 'West coast driven by club + premium grocery velocity; maintain Instacart bundles.',
    },
  },
  {
    id: 'us-east',
    countryCode: 'US',
    territory: 'US-EAST',
    distributorId: 'dist_us_east',
    supplierId: 'sup_us_canners',
    warehouseIds: ['wh_us_east'],
    orders: {
      total: 520,
      pending: 18,
      completed: 470,
      inTransit: 32,
      currency: 'USD',
      orders: [
        {
          id: 'US-EAST-1101',
          customer: 'Target East',
          city: 'Atlanta',
          channel: 'Modern Trade',
          amount: 265000,
          status: 'Completed',
          eta: 'Delivered',
        },
        {
          id: 'US-EAST-1102',
          customer: 'Publix',
          city: 'Miami',
          channel: 'General Trade',
          amount: 142000,
          status: 'In Transit',
          eta: '1 day',
        },
      ],
    },
    inventory: {
      totalValue: 1420000,
      lowStock: 3,
      totalSkus: 38,
      skus: [
        {
          sku: 'US-KOMBUCHA-6',
          description: 'Organic Kombucha 6 pack',
          packSize: '6x500ml',
          mrp: 21,
          onHand: 410,
          warehouseId: 'wh_us_east',
          minStock: 360,
        },
        {
          sku: 'US-SMOOTHIE-CASE',
          description: 'Protein Smoothie Case',
          packSize: '8x330ml',
          mrp: 26,
          onHand: 265,
          warehouseId: 'wh_us_east',
          minStock: 240,
        },
      ],
    },
    logistics: {
      efficiency: 89,
      deliveries: 124,
      onTime: 111,
      activeRoutes: 14,
      whiteSpaces: 1,
    },
    finance: {
      revenue: 3370000,
      expenses: 2290000,
      profit: 1080000,
      pendingPayments: 61000,
      currency: 'USD',
    },
    crm: {
      totalCustomers: 61,
      activeCustomers: 52,
      complaints: 3,
      promotions: 4,
    },
    hr: {
      totalEmployees: 42,
      fieldForce: 26,
      salesOfficers: 5,
      attendanceRate: 96,
    },
    executive: {
      profit: 1080000,
      growth: 10.1,
      marketShare: 17,
      roi: 18.6,
      narrative: 'East coast seeing strong retail media pull-through; reinforce Target + Publix activations.',
    },
  },
  {
    id: 'pk-north',
    countryCode: 'PK',
    territory: 'PK-NORTH',
    distributorId: 'dist_pk_lahore',
    supplierId: 'sup_pk_local',
    warehouseIds: ['wh_pk_lhr'],
    orders: {
      total: 610,
      pending: 28,
      completed: 540,
      inTransit: 42,
      currency: 'PKR',
      orders: [
        {
          id: 'PK-N-2001',
          customer: 'Metro Lahore',
          city: 'Lahore',
          channel: 'Cash & Carry',
          amount: 820000,
          status: 'Completed',
          eta: 'Delivered',
        },
        {
          id: 'PK-N-2002',
          customer: 'Imtiaz GT',
          city: 'Faisalabad',
          channel: 'General Trade',
          amount: 465000,
          status: 'Pending',
          eta: '3 days',
        },
      ],
    },
    inventory: {
      totalValue: 980000000,
      lowStock: 6,
      totalSkus: 54,
      skus: [
        {
          sku: 'PK-BISCUIT-12',
          description: 'Value Biscuit 12s',
          packSize: '12x90g',
          mrp: 240,
          onHand: 920,
          warehouseId: 'wh_pk_lhr',
          minStock: 800,
        },
        {
          sku: 'PK-ENERGY-250',
          description: 'Energy Drink 250ml',
          packSize: '24x250ml',
          mrp: 180,
          onHand: 610,
          warehouseId: 'wh_pk_lhr',
          minStock: 550,
        },
      ],
    },
    logistics: {
      efficiency: 84,
      deliveries: 142,
      onTime: 121,
      activeRoutes: 22,
      whiteSpaces: 4,
    },
    finance: {
      revenue: 1120000000,
      expenses: 830000000,
      profit: 290000000,
      pendingPayments: 72000000,
      currency: 'PKR',
    },
    crm: {
      totalCustomers: 132,
      activeCustomers: 119,
      complaints: 6,
      promotions: 5,
    },
    hr: {
      totalEmployees: 68,
      fieldForce: 45,
      salesOfficers: 12,
      attendanceRate: 94,
    },
    executive: {
      profit: 290000000,
      growth: 13.8,
      marketShare: 21,
      roi: 17.4,
      narrative: 'North Pakistan thriving in GT; keep Ramadan combo packs flowing.',
    },
  },
  {
    id: 'pk-south',
    countryCode: 'PK',
    territory: 'PK-SOUTH',
    distributorId: 'dist_pk_karachi',
    supplierId: 'sup_pk_local',
    warehouseIds: ['wh_pk_khi'],
    orders: {
      total: 540,
      pending: 34,
      completed: 470,
      inTransit: 36,
      currency: 'PKR',
      orders: [
        {
          id: 'PK-S-2101',
          customer: 'Naheed Supermarket',
          city: 'Karachi',
          channel: 'Modern Trade',
          amount: 960000,
          status: 'Completed',
          eta: 'Delivered',
        },
        {
          id: 'PK-S-2102',
          customer: 'Retailer Hub',
          city: 'Hyderabad',
          channel: 'General Trade',
          amount: 385000,
          status: 'In Transit',
          eta: '2 days',
        },
      ],
    },
    inventory: {
      totalValue: 880000000,
      lowStock: 5,
      totalSkus: 49,
      skus: [
        {
          sku: 'PK-WAFER-75',
          description: 'Wafer 75g',
          packSize: '48 units',
          mrp: 125,
          onHand: 780,
          warehouseId: 'wh_pk_khi',
          minStock: 700,
        },
        {
          sku: 'PK-BEVERAGE-200',
          description: 'Juice 200ml',
          packSize: '24 units',
          mrp: 80,
          onHand: 640,
          warehouseId: 'wh_pk_khi',
          minStock: 600,
        },
      ],
    },
    logistics: {
      efficiency: 82,
      deliveries: 136,
      onTime: 112,
      activeRoutes: 21,
      whiteSpaces: 5,
    },
    finance: {
      revenue: 980000000,
      expenses: 730000000,
      profit: 250000000,
      pendingPayments: 64000000,
      currency: 'PKR',
    },
    crm: {
      totalCustomers: 121,
      activeCustomers: 103,
      complaints: 7,
      promotions: 4,
    },
    hr: {
      totalEmployees: 63,
      fieldForce: 41,
      salesOfficers: 11,
      attendanceRate: 93,
    },
    executive: {
      profit: 250000000,
      growth: 11.9,
      marketShare: 19,
      roi: 16.1,
      narrative: 'South corridor anchored by Karachi MT + exports; focus on cold-chain scooters.',
    },
  },
  {
    id: 'ae-uae',
    countryCode: 'AE',
    territory: 'AE-DXB',
    distributorId: 'dist_ae_dubai',
    supplierId: 'sup_ae_partners',
    warehouseIds: ['wh_ae_dubai'],
    orders: {
      total: 420,
      pending: 12,
      completed: 390,
      inTransit: 18,
      currency: 'AED',
      orders: [
        {
          id: 'AE-3001',
          customer: 'Carrefour UAE',
          city: 'Dubai',
          channel: 'Modern Trade',
          amount: 420000,
          status: 'Completed',
          eta: 'Delivered',
        },
        {
          id: 'AE-3002',
          customer: 'Lulu Hypermarket',
          city: 'Abu Dhabi',
          channel: 'Modern Trade',
          amount: 285000,
          status: 'Pending',
          eta: '2 days',
        },
      ],
    },
    inventory: {
      totalValue: 2450000,
      lowStock: 2,
      totalSkus: 36,
      skus: [
        {
          sku: 'AE-PREMIUM-ENERGY',
          description: 'Premium Energy 330ml',
          packSize: '12 cans',
          mrp: 10,
          onHand: 420,
          warehouseId: 'wh_ae_dubai',
          minStock: 360,
        },
        {
          sku: 'AE-PROTEIN-BAR',
          description: 'Protein Bar 55g',
          packSize: '24 units',
          mrp: 12,
          onHand: 310,
          warehouseId: 'wh_ae_dubai',
          minStock: 280,
        },
      ],
    },
    logistics: {
      efficiency: 94,
      deliveries: 102,
      onTime: 98,
      activeRoutes: 14,
      whiteSpaces: 1,
    },
    finance: {
      revenue: 148000000,
      expenses: 92000000,
      profit: 56000000,
      pendingPayments: 5200000,
      currency: 'AED',
    },
    crm: {
      totalCustomers: 48,
      activeCustomers: 42,
      complaints: 1,
      promotions: 6,
    },
    hr: {
      totalEmployees: 38,
      fieldForce: 22,
      salesOfficers: 4,
      attendanceRate: 98,
    },
    executive: {
      profit: 56000000,
      growth: 15.2,
      marketShare: 11,
      roi: 24.6,
      narrative: 'UAE thrives on premium halal offerings and travel retail exclusives.',
    },
  },
];

const resolveCountry = (scope: UserScope, requested?: string): CountryCode => {
  const allowed = scope.countries.map((code) => code.toUpperCase()) as CountryCode[];
  if (!allowed.length) {
    throw new UnsupportedCountryError('No countries assigned to user scope');
  }
  if (scope.role === 'hq' && requested) {
    const normalized = requested.toUpperCase() as CountryCode;
    if (allowed.includes(normalized)) {
      return normalized;
    }
  }
  return allowed[0];
};

const matchesScope = (slice: DomainSliceRecord, scope: UserScope, country: CountryCode) => {
  if (slice.countryCode !== country) {
    return false;
  }
  if (scope.territories.length && slice.territory && !scope.territories.includes(slice.territory)) {
    return false;
  }
  if (scope.distributorId && slice.distributorId !== scope.distributorId) {
    return false;
  }
  if (scope.supplierId && slice.supplierId !== scope.supplierId) {
    return false;
  }
  if (scope.warehouseIds.length) {
    const intersection = slice.warehouseIds.filter((id) => scope.warehouseIds.includes(id));
    if (intersection.length === 0) {
      return false;
    }
  }
  return true;
};

const aggregateSlices = (records: DomainSliceRecord[], country: CountryCode): CountryDomainData => {
  const currency = countryMeta[country].currency;

  const sum = (selector: (record: DomainSliceRecord) => number) =>
    records.reduce((acc, record) => acc + selector(record), 0);

  const mergeOrders = (): CountryOrdersData => ({
    total: sum((r) => r.orders.total),
    pending: sum((r) => r.orders.pending),
    completed: sum((r) => r.orders.completed),
    inTransit: sum((r) => r.orders.inTransit),
    currency,
    orders: records.flatMap((r) => r.orders.orders).slice(0, 10),
  });

  const mergeInventory = (): CountryInventoryData => ({
    totalValue: sum((r) => r.inventory.totalValue),
    lowStock: sum((r) => r.inventory.lowStock),
    totalSkus: sum((r) => r.inventory.totalSkus),
    skus: records.flatMap((r) => r.inventory.skus).slice(0, 10),
  });

  const mergeLogistics = (): CountryLogisticsData => ({
    efficiency: Math.round(sum((r) => r.logistics.efficiency) / records.length),
    deliveries: sum((r) => r.logistics.deliveries),
    onTime: sum((r) => r.logistics.onTime),
    activeRoutes: sum((r) => r.logistics.activeRoutes),
    whiteSpaces: sum((r) => r.logistics.whiteSpaces),
  });

  const mergeFinance = (): CountryFinanceData => ({
    revenue: sum((r) => r.finance.revenue),
    expenses: sum((r) => r.finance.expenses),
    profit: sum((r) => r.finance.profit),
    pendingPayments: sum((r) => r.finance.pendingPayments),
    currency,
  });

  const mergeCRM = (): CountryCRMData => ({
    totalCustomers: sum((r) => r.crm.totalCustomers),
    activeCustomers: sum((r) => r.crm.activeCustomers),
    complaints: sum((r) => r.crm.complaints),
    promotions: sum((r) => r.crm.promotions),
  });

  const mergeHR = (): CountryHRData => ({
    totalEmployees: sum((r) => r.hr.totalEmployees),
    fieldForce: sum((r) => r.hr.fieldForce),
    salesOfficers: sum((r) => r.hr.salesOfficers),
    attendanceRate: Math.round(sum((r) => r.hr.attendanceRate) / records.length),
  });

  const mergeExecutive = (): CountryExecutiveData => ({
    profit: sum((r) => r.executive.profit),
    growth: Math.round(sum((r) => r.executive.growth) / records.length),
    marketShare: Math.round(sum((r) => r.executive.marketShare) / records.length),
    roi: Math.round(sum((r) => r.executive.roi) / records.length),
    narrative: records.map((r) => r.executive.narrative).join(' '),
  });

  return {
    countryCode: country,
    currency,
    orders: mergeOrders(),
    inventory: mergeInventory(),
    logistics: mergeLogistics(),
    finance: mergeFinance(),
    crm: mergeCRM(),
    hr: mergeHR(),
    executive: mergeExecutive(),
  };
};

export const getDomainData = (scope: UserScope, requestedCountry?: string): CountryDomainData => {
  const country = resolveCountry(scope, requestedCountry);
  const candidateSlices = domainSlices.filter((slice) => matchesScope(slice, scope, country));

  if (candidateSlices.length === 0) {
    throw new UnsupportedCountryError(
      `No data available for country ${country} with current access scope`,
    );
  }

  return aggregateSlices(candidateSlices, country);
};

export const supportedCountryCodes = Array.from(
  new Set(domainSlices.map((slice) => slice.countryCode)),
) as CountryCode[];

