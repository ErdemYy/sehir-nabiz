import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { EventStatus } from '@sehir-nabiz/shared';
import { EventEntity } from './event.entity';
import { UserEntity } from './user.entity';

@Entity('event_moderation_logs')
export class EventModerationLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  eventId!: string;

  @ManyToOne(() => EventEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event!: EventEntity;

  @Index()
  @Column({ type: 'uuid' })
  moderatorId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'moderatorId' })
  moderator!: UserEntity;

  @Column({
    type: 'enum',
    enum: EventStatus,
  })
  previousStatus!: EventStatus;

  @Column({
    type: 'enum',
    enum: EventStatus,
  })
  newStatus!: EventStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  reason?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
