/**
 * ŞehirNabız Transactional Outbox Tipleri ve Enumları (Phase 11)
 */

export enum OutboxStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

export enum OutboxEventType {
  EVENT_CREATED = 'EVENT_CREATED',
  EVENT_PUBLISHED = 'EVENT_PUBLISHED',
  EVENT_REJECTED = 'EVENT_REJECTED',
  EVENT_RESOLVED = 'EVENT_RESOLVED',
  EVENT_DISPUTED = 'EVENT_DISPUTED',
  EVENT_STATUS_CHANGED = 'EVENT_STATUS_CHANGED',
  EVENT_FEEDBACK_SUBMITTED = 'EVENT_FEEDBACK_SUBMITTED',
}

export interface OutboxEventDto {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: OutboxEventType | string;
  payload: Record<string, unknown>;
  status: OutboxStatus;
  attempts: number;
  nextAttemptAt: string;
  processedAt?: string | null;
  createdAt: string;
  lastError?: string | null;
}
