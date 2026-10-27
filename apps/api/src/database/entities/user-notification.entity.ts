import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { NotificationType } from '@sehir-nabiz/shared';
import { UserEntity } from './user.entity';
import { EventEntity } from './event.entity';

@Entity('user_notifications')
@Index(['userId', 'createdAt'])
@Index(['userId', 'readAt'])
export class UserNotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type!: NotificationType;

  @Column({ type: 'varchar', length: 150 })
  title!: string;

  @Column({ type: 'varchar', length: 500 })
  body!: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  eventId?: string | null;

  @ManyToOne(() => EventEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'eventId' })
  event?: EventEntity | null;

  @Index()
  @Column({ type: 'timestamptz', nullable: true })
  readAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt?: Date | null;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 255, nullable: true, unique: true })
  idempotencyKey?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
