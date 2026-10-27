import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('user_notification_preferences')
export class UserNotificationPreferenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'uuid', unique: true })
  userId!: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @Column({ type: 'boolean', default: true })
  followedEvents!: boolean;

  @Column({ type: 'boolean', default: true })
  confirmedEvents!: boolean;

  @Column({ type: 'boolean', default: true })
  reportedEvents!: boolean;

  @Column({ type: 'boolean', default: false })
  nearbyEvents!: boolean;

  @Column({ type: 'boolean', default: true })
  systemNotifications!: boolean;

  @Column({ type: 'boolean', default: true })
  pushEnabled!: boolean;

  @Column({ type: 'boolean', default: true })
  inAppEnabled!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
