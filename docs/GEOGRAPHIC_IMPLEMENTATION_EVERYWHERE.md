# 🌍 Geographic Hierarchy - Implementation Guide (Everywhere)

## 📋 Quick Summary

Apply geographic hierarchy to **EVERYTHING**:
- ✅ Orders → Delivery location with full path
- ✅ Distributors → Territory coverage  
- ✅ Suppliers → Location of operations
- ✅ Warehouses → Location in hierarchy
- ✅ Users → Geographic access scope
- ✅ Reports → Filter by any level
- ✅ Analytics → Geographic insights

---

## 🎯 Example: Victoria Casino Implementation

### Full Path Structure
```
Global
  └── Europe
      └── Western Europe
          └── United Kingdom
              └── London
                  └── Westminster
                      └── Edgeware Road
                          └── Victoria Casino
                              └── Territory: TERR-LON-WEST-EDG-001
                                  └── Distributor: London Central Distributor
```

---

## 🔧 Where to Apply (Practical Implementation)

### 1. **ORDERS** - Add Geographic Path

**File:** `orders` table / Order interface

```typescript
interface Order {
  id: string
  orderNumber: string
  
  // ADD THIS: Full geographic hierarchy
  deliveryLocation: {
    fullPath: 'Global/Europe/Western Europe/United Kingdom/London/Westminster/Edgeware Road/Victoria Casino'
    
    // Individual levels
    continent: 'EU'
    region: 'WEU'
    country: 'GBR'
    city: 'LON'
    district: 'WEST'
    area: 'EDG'
    location: 'VIC-CAS-001'
    
    // Coordinates
    coordinates: { lat: 51.5155, lng: -0.1755 }
  }
  
  // Territory automatically assigned from location
  territory: {
    code: 'TERR-LON-WEST-EDG-001',
    distributor: 'London Central Distributor'
  }
}
```

**Implementation:**
```typescript
// When creating an order
const createOrder = async (orderData: any) => {
  // Get location hierarchy
  const location = await getLocationById(orderData.locationId)
  
  // Auto-assign territory
  const territory = await findTerritoryForLocation(location)
  
  const order = {
    ...orderData,
    deliveryLocation: {
      fullPath: location.fullPath,
      ...location.hierarchy,
      coordinates: location.coordinates
    },
    territory: {
      code: territory.code,
      distributor: territory.distributorId
    }
  }
  
  return await saveOrder(order)
}
```

---

### 2. **DISTRIBUTORS** - Territory Assignment

**File:** `distributors` table / Distributor interface

```typescript
interface Distributor {
  id: string
  name: string
  
  // ADD THIS: Geographic coverage
  territories: [
    {
      code: 'TERR-LON-001',
      fullPath: 'Global/Europe/Western Europe/United Kingdom/London',
      scope: {
        country: 'GBR',
        city: 'LON'
      },
      coverageType: 'full'  // Covers entire city
    },
    {
      code: 'TERR-LON-WEST-EDG-001',
      fullPath: 'Global/Europe/Western Europe/United Kingdom/London/Westminster/Edgeware Road',
      scope: {
        country: 'GBR',
        city: 'LON',
        district: 'WEST',
        area: 'EDG'
      },
      coverageType: 'exclusive',  // Exclusive coverage
      locations: ['VIC-CAS-001', 'EDG-RET-002']
    }
  ]
}
```

**Implementation:**
```typescript
// Sales Manager creates distributor
const createDistributor = async (distributorData: any) => {
  // Sales Manager selects territories
  const territories = distributorData.territories.map((terr: any) => ({
    code: generateTerritoryCode(terr.scope),
    fullPath: buildGeographicPath(terr.scope),
    ...terr
  }))
  
  const distributor = {
    ...distributorData,
    territories
  }
  
  return await saveDistributor(distributor)
}
```

---

### 3. **USERS** - Geographic Access Scope

**File:** `portal_users` table / UserScope interface

**Already Updated!** ✅

```typescript
interface UserScope {
  userId: string
  role: UserRole
  
  // Geographic Access (full hierarchy)
  geographic: {
    global?: boolean  // Super admin
    continents?: string[]  // ['EU', 'AS']
    regions?: string[]
    countries?: string[]  // ['GBR', 'FRA']
    cities?: string[]  // ['LON', 'PAR']
    districts?: string[]  // ['WEST', 'CAM']
    areas?: string[]  // ['EDG']
    locations?: string[]  // ['VIC-CAS-001']
    territories?: string[]  // ['TERR-LON-001']
  }
}
```

**Implementation:**
```typescript
// When user logs in, set geographic scope
const setUserGeographicScope = (user: User, role: UserRole) => {
  if (role === 'super_admin') {
    return { global: true }
  }
  
  if (role === 'country_manager') {
    return {
      countries: user.assignedCountries  // ['GBR', 'FRA']
    }
  }
  
  if (role === 'sales_officer') {
    return {
      territories: user.assignedTerritories  // ['TERR-LON-001']
    }
  }
  
  if (role === 'distributor') {
    return {
      territories: [user.distributor.territories[0].code]
    }
  }
}
```

---

### 4. **DATA FILTERING** - Apply Everywhere

**File:** All data loading functions

```typescript
// Filter orders by user's geographic scope
const getOrders = async (userScope: UserScope) => {
  const allOrders = await db.query('SELECT * FROM orders')
  
  // Apply geographic filtering
  return filterByGeographicScope(allOrders, userScope.geographic)
}

// Filter distributors by user's geographic scope
const getDistributors = async (userScope: UserScope) => {
  const allDistributors = await db.query('SELECT * FROM distributors')
  
  // Filter by geographic scope
  return allDistributors.filter(dist => {
    // Check if distributor's territories match user's scope
    return dist.territories.some((terr: Territory) => 
      isTerritoryInScope(terr, userScope.geographic)
    )
  })
}

// Filter inventory by warehouse location
const getInventory = async (userScope: UserScope) => {
  const allInventory = await db.query(`
    SELECT * FROM inventory i
    JOIN warehouses w ON i.warehouse_id = w.id
    JOIN geo_hierarchy_paths g ON w.location_id = g.location_id
  `)
  
  return filterByGeographicScope(allInventory, userScope.geographic)
}
```

---

### 5. **REPORTS** - Filter by Geographic Level

**File:** Report generation functions

```typescript
interface ReportFilters {
  geographic: {
    level: 'global' | 'continent' | 'region' | 'country' | 'city' | 'district' | 'area' | 'location'
    values: string[]  // Selected values at that level
  }
  dateRange: {
    start: string
    end: string
  }
}

const generateSalesReport = async (filters: ReportFilters) => {
  let query = 'SELECT * FROM orders WHERE 1=1'
  
  // Apply geographic filter
  if (filters.geographic.level === 'city') {
    query += ` AND delivery_location->>'city' = ANY($1)`
    // Returns: ['LON', 'MAN', 'BIR']
  }
  
  if (filters.geographic.level === 'district') {
    query += ` AND delivery_location->>'district' = ANY($1)`
    // Returns: ['WEST', 'CAM']
  }
  
  if (filters.geographic.level === 'location') {
    query += ` AND delivery_location->>'location' = ANY($1)`
    // Returns: ['VIC-CAS-001']
  }
  
  const orders = await db.query(query, [filters.geographic.values])
  
  // Group by geographic level for reporting
  return groupByGeographicLevel(orders, filters.geographic.level)
}
```

---

### 6. **WAREHOUSES** - Location in Hierarchy

**File:** `distributor_warehouses` table

```typescript
interface Warehouse {
  id: string
  name: string
  distributorId: string
  
  // ADD THIS: Full geographic path
  location: {
    fullPath: 'Global/Europe/Western Europe/United Kingdom/London/Camden/Kings Cross'
    
    continent: 'EU'
    region: 'WEU'
    country: 'GBR'
    city: 'LON'
    district: 'CAM'
    area: 'KIN-CRO'
    coordinates: { lat: 51.5308, lng: -0.1238 }
  }
  
  // Serves these territories
  servesTerritories: ['TERR-LON-001', 'TERR-LON-WEST-001']
}
```

---

### 7. **TERRITORY MANAGEMENT UI**

**File:** Territory management component

```typescript
// Sales Manager creates territory
<TerritoryForm>
  <GeographicHierarchySelector
    levels={['continent', 'region', 'country', 'city', 'district', 'area', 'location']}
    selectedPath={selectedTerritoryPath}
    onChange={(path) => {
      // Path: ['EU', 'WEU', 'GBR', 'LON', 'WEST', 'EDG', 'VIC-CAS-001']
      setTerritoryScope({
        continent: path[0],
        region: path[1],
        country: path[2],
        city: path[3],
        district: path[4],
        area: path[5],
        location: path[6]
      })
    }}
  />
  
  <DistributorSelector 
    distributors={filterDistributorsByGeographicScope(selectedTerritoryPath)}
  />
</TerritoryForm>
```

---

### 8. **ORDER PLACEMENT** - Auto-Detect Location

**File:** Order creation form

```typescript
// When distributor places order
<OrderForm>
  {/* Geographic selector for delivery location */}
  <GeographicHierarchySelector
    levels={['continent', 'region', 'country', 'city', 'district', 'area', 'location']}
    selectedPath={deliveryLocationPath}
    onChange={(path) => {
      // Auto-find territory
      const location = buildLocationFromPath(path)
      const territory = findTerritoryForLocation(location)
      
      setOrder({
        deliveryLocation: {
          fullPath: location.fullPath,
          ...location.hierarchy,
          coordinates: location.coordinates
        },
        territory: {
          code: territory.code,
          distributor: territory.distributorId
        }
      })
    }}
  />
</OrderForm>
```

---

## 🔄 Data Flow: Victoria Casino Example

```
1. Victoria Casino Location Created
   └── Full Path: Global/Europe/Western Europe/UK/London/Westminster/Edgeware Road/Victoria Casino
   └── Stored in: specific_locations table
   └── Path stored in: geo_hierarchy_paths table

2. Territory Created
   └── Code: TERR-LON-WEST-EDG-001
   └── Scope: Westminster/Edgeware area
   └── Includes: Victoria Casino (VIC-CAS-001)

3. Distributor Assigned
   └── Distributor: London Central Distributor
   └── Territory: TERR-LON-WEST-EDG-001

4. Order Placed at Victoria Casino
   └── System finds: Location = VIC-CAS-001
   └── System finds: Territory = TERR-LON-WEST-EDG-001
   └── System assigns: London Central Distributor
   └── Order stored with full geographic path

5. User Views Orders
   └── Super Admin: Sees ALL orders globally
   └── Country Manager (UK): Sees only UK orders
   └── Sales Manager: Sees all distributor orders
   └── Distributor: Sees only their orders (filtered by territory)
```

---

## ✅ Implementation Checklist

### Database
- [x] Create geographic hierarchy tables
- [ ] Run migration: `004_geographic_hierarchy.sql`
- [ ] Populate initial data (continents, regions)
- [ ] Add geographic fields to existing tables (orders, distributors, etc.)

### Backend
- [ ] Create geographic service/API endpoints
- [ ] Add geographic filtering to all data queries
- [ ] Update user scope to include geographic access
- [ ] Create territory management APIs

### Frontend
- [ ] Create GeographicHierarchySelector component ✅
- [ ] Add to order creation form
- [ ] Add to distributor/territory management
- [ ] Add to user access configuration
- [ ] Add geographic filters to all reports

### Integration Points
- [ ] Orders → Add delivery location hierarchy
- [ ] Distributors → Add territory assignments
- [ ] Users → Add geographic access scope
- [ ] Reports → Add geographic filtering
- [ ] Analytics → Group by geographic levels

---

## 📝 Quick Integration Example

```typescript
// In any component that loads data
import { filterByGeographicScope, createGeographicScopeFromUserScope } from '@/lib/geographic'
import { useUserScope } from '@/hooks/useUserScope'

function OrdersList() {
  const userScope = useUserScope()
  const geographicScope = createGeographicScopeFromUserScope(userScope)
  
  const [orders, setOrders] = useState([])
  
  useEffect(() => {
    loadOrders().then(allOrders => {
      // Automatically filter by user's geographic scope
      const filtered = filterByGeographicScope(allOrders, geographicScope)
      setOrders(filtered)
    })
  }, [geographicScope])
  
  return (
    <div>
      {orders.map(order => (
        <OrderCard 
          key={order.id}
          order={order}
          // Order already has full geographic path
          locationPath={order.deliveryLocation.fullPath}
        />
      ))}
    </div>
  )
}
```

---

**This geographic hierarchy now applies EVERYWHERE in the CRM system!** 🌍

