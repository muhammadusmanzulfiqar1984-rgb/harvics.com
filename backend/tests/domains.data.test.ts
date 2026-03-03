import { getDomainData, UnsupportedCountryError } from '../src/modules/domains/domains.data';
import { UserScope } from '../src/modules/auth/userScope.types';

describe('Domain dataset localisation', () => {
  const baseScope: UserScope = {
    userId: 'hq_user',
    role: 'hq',
    countries: ['US', 'PK', 'AE'],
    territories: [],
    warehouseIds: [],
    currency: 'USD',
  };

  it('returns US slice with USD currency', () => {
    const slice = getDomainData(baseScope, 'US');
    expect(slice.finance.currency).toBe('USD');
    expect(slice.orders.currency).toBe('USD');
    expect(slice.orders.orders[0].customer).toContain('Costco');
  });

  it('returns PK slice with PKR currency', () => {
    const slice = getDomainData(baseScope, 'PK');
    expect(slice.finance.currency).toBe('PKR');
    expect(slice.orders.currency).toBe('PKR');
    expect(slice.orders.orders[0].customer).toContain('Metro Lahore');
  });

  it('defaults to PK when no code supplied', () => {
    const scope: UserScope = { ...baseScope, countries: ['PK'] };
    const slice = getDomainData(scope);
    expect(slice.orders.currency).toBe('PKR');
  });

  it('filters by distributor scope', () => {
    const scope: UserScope = {
      ...baseScope,
      countries: ['US'],
      distributorId: 'dist_us_west',
    };
    const slice = getDomainData(scope);
    expect(slice.orders.orders.some((order) => order.id.includes('US-WEST'))).toBe(true);
    expect(slice.orders.orders.some((order) => order.id.includes('US-EAST'))).toBe(false);
  });

  it('throws for unsupported country codes', () => {
    expect(() =>
      getDomainData({ ...baseScope, countries: ['ZZ'] as any }),
    ).toThrow(UnsupportedCountryError);
  });
});

