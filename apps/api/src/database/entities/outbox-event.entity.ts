import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { OutboxStatus } from '@sehir-nabiz/shared';

@Entity('outbox_events')
@Index(['status', 'nextAttemptAt'])
@Index(['aggregateType', 'aggregateId'])
export class OutboxEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'aggregate_type', type: 'varchar', length: 64 })
  aggregateType!: string;

  @Column({ name: 'aggregate_id', type: 'uuid' })
  aggregateId!: string;

  @Column({ name: 'event_type', type: 'varchar', length: 64 })
  eventType!: string;

  @Column({ type: 'jsonb' })
  payload!: Record<string, any>;

  @Column({
    type: 'enum',
    enum: OutboxStatus,
    default: OutboxStatus.PENDING,
  })
  status!: OutboxStatus;

  @Column({ type: 'int', default: 0 })
  attempts!: number;

  @Column({ name: 'next_attempt_at', type: 'timestamptz', default: () => 'NOW()' })
  nextAttemptAt!: Date;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt?: Date | null;

  @Column({ name: 'lock_lease_expires_at', type: 'timestamptz', nullable: true })
  lockLeaseExpiresAt?: Date | null;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
