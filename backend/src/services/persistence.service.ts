
import * as fs from 'fs';
import * as path from 'path';
import { EntitySnapshot, EventLog, EntityType } from '../types/persistence.types';

const DATA_DIR = path.join(__dirname, '../../data');
const SNAPSHOTS_FILE = path.join(DATA_DIR, 'snapshots.jsonl');
const EVENTS_FILE = path.join(DATA_DIR, 'events.jsonl');

export class PersistenceService {
  
  private static ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  // --- WRITE (Append-Only) ---

  public static persist(snapshot: EntitySnapshot): void {
    this.ensureDir();
    
    // 1. Validate Schema (Structure only)
    if (!snapshot.entity_id || !snapshot.entity_type || !snapshot.raw_payload) {
      throw new Error('Invalid Snapshot Schema');
    }

    // 2. Append to Snapshots Log
    const line = JSON.stringify(snapshot) + '\n';
    fs.appendFileSync(SNAPSHOTS_FILE, line, { encoding: 'utf8' });

    // 3. Log Event
    this.logEvent({
      event_id: `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      entity_id: snapshot.entity_id,
      action_type: 'WRITE',
      actor_id: snapshot.source_system,
      timestamp: new Date().toISOString(),
      source_system: 'PersistenceLayer'
    });
  }

  private static logEvent(event: EventLog): void {
    const line = JSON.stringify(event) + '\n';
    fs.appendFileSync(EVENTS_FILE, line, { encoding: 'utf8' });
  }

  // --- RESTORE (Read All & Reconstruct) ---

  public static restoreState(): Map<string, EntitySnapshot> {
    if (!fs.existsSync(SNAPSHOTS_FILE)) return new Map();

    const state = new Map<string, EntitySnapshot>();
    const fileContent = fs.readFileSync(SNAPSHOTS_FILE, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');

    lines.forEach(line => {
      try {
        const snapshot: EntitySnapshot = JSON.parse(line);
        // Overwrite with latest version (Append-only log logic)
        state.set(snapshot.entity_id, snapshot);
      } catch (e) {
        console.error('Failed to parse snapshot line:', e);
      }
    });

    this.logEvent({
      event_id: `EVT-${Date.now()}-RESTORE`,
      entity_id: 'ALL',
      action_type: 'RESTORE',
      actor_id: 'Tier-0',
      timestamp: new Date().toISOString(),
      source_system: 'Tier-0'
    });

    return state;
  }
}
