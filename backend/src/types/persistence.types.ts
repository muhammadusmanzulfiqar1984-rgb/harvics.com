
export type EntityType = 'DECISION_OUTPUT' | 'SUPPLIER_PROFILE' | 'FEEDBACK_SIGNAL' | 'LEARNING_STATE';

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
