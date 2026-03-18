// Event types for sync
export type SyncEventType = 'SETTINGS_UPDATE' | 'SOCIALS_UPDATE' | 'ORDER_UPDATE';
export type SyncActionType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface SyncEventData {
  type: SyncEventType;
  action: SyncActionType;
  data: Record<string, unknown>;
}

// In-memory event emitter for real-time sync
// Using a simple pub/sub pattern for SSE
type EventCallback = (event: SyncEventData) => void;

class SyncEventEmitter {
  private listeners: Set<EventCallback> = new Set();
  private lastEventId: number = 0;

  subscribe(callback: EventCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  emit(type: SyncEventType, action: SyncActionType, data: Record<string, unknown>): void {
    const eventData: SyncEventData = { type, action, data };
    this.lastEventId++;

    // Notify all subscribers immediately (no database dependency)
    this.listeners.forEach(callback => {
      try {
        callback(eventData);
      } catch (error) {
        console.error('Error in sync event callback:', error);
      }
    });
  }

  getLastEventId(): number {
    return this.lastEventId;
  }
}

// Singleton instance
export const syncEmitter = new SyncEventEmitter();

// Helper function to emit sync events
export function emitSyncEvent(
  type: SyncEventType,
  action: SyncActionType,
  data: Record<string, unknown>
): void {
  syncEmitter.emit(type, action, data);
}
