import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DeletionRequestStatus, DeletionClientSource } from '@sehir-nabiz/shared';
import { UserEntity } from './user.entity';

@Entity('account_deletion_requests')
export class AccountDeletionRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_account_deletion_user_id')
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, user => user.deletionRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @Index('idx_account_deletion_status')
  @Column({
    type: 'enum',
    enum: DeletionRequestStatus,
    default: DeletionRequestStatus.PENDING,
  })
  status!: DeletionRequestStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  reason?: string | null;

  @Index('idx_account_deletion_scheduled_for')
  @Column({ type: 'timestamptz' })
  scheduledFor!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt?: Date | null;

  @Column({ type: 'int', default: 0 })
  attemptCount!: number;

  @Column({ type: 'text', nullable: true })
  lastError?: string | null;

  @Column({
    type: 'enum',
    enum: DeletionClientSource,
    default: DeletionClientSource.MOBILE_APP,
  })
  clientSource!: DeletionClientSource;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ipAddress?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  details?: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
