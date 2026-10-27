import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { FeedbackType } from '@sehir-nabiz/shared';
import { EventEntity } from './event.entity';
import { UserEntity } from './user.entity';

@Entity('event_feedbacks')
@Unique('uq_event_feedback_event_user', ['eventId', 'userId'])
export class EventFeedbackEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_event_feedback_event_id')
  @Column({ type: 'uuid' })
  eventId!: string;

  @ManyToOne(() => EventEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event!: EventEntity;

  @Index('idx_event_feedback_user_id')
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @Column({
    type: 'enum',
    enum: FeedbackType,
  })
  type!: FeedbackType;

  @Column({ type: 'varchar', length: 500, nullable: true })
  reason?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
