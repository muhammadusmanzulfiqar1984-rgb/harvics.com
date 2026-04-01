
export type EntityType = 
  | 'DECISION_OUTPUT' | 'SUPPLIER_PROFILE' | 'FEEDBACK_SIGNAL' | 'LEARNING_STATE'
  // Tier-2 entity types
  | 'GPS_RETAILER' | 'GPS_ROUTE' | 'GPS_VEHICLE'
  | 'SATELLITE_WHITESPACE' | 'SATELLITE_COVERAGE'
  | 'TERRITORY_ASSIGNMENT' | 'TERRITORY_COVERAGE'
  | 'SUPPLYCHAIN_NODE' | 'SUPPLYCHAIN_GRAPH'
  // Domain entity types
  | 'ORDER' | 'INVENTORY_ITEM' | 'CUSTOMER' | 'EMPLOYEE' | 'INVOICE' | 'LOGISTICS_ROUTE';

export interface EntitySnapshot {
  entity_id: string;
  entity_type: EntityType;
  raw_payload: any;
  source_system: string;
  created_at: string;
  version_id: string;
}

export interface EventLog {
  event_id: string;
  entity_id: string;
  action_type: 'WRITE' | 'READ' | 'RESTORE';
  actor_id: string;
  timestamp: string;
  source_system: string;
}

export interface VersionPointer {
  version_id: string;
  parent_version_id: string | null;
  created_at: string;
}
