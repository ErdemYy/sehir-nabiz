import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { UserRole, AccountStatus } from '@sehir-nabiz/shared';
import { RefreshTokenEntity } from './refresh-token.entity';
import { EventFeedbackEntity } from './event-feedback.entity';
import { UserReputationLogEntity } from './user-reputation-log.entity';
import { UserNotificationEntity } from './user-notification.entity';
import { DevicePushTokenEntity } from './device-push-token.entity';
import { UserNotificationPreferenceEntity } from './user-notification-preference.entity';
import { AccountDeletionRequestEntity } from './account-deletion-request.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 100 })
  displayName!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CITIZEN,
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  accountStatus!: AccountStatus;

  @Column({ type: 'int', default: 10 })
  reputationScore!: number;

  @OneToMany(() => RefreshTokenEntity, token => token.user, { cascade: true })
  refreshTokens?: RefreshTokenEntity[];

  @OneToMany(() => EventFeedbackEntity, feedback => feedback.user)
  feedbacks?: EventFeedbackEntity[];

  @OneToMany(() => UserReputationLogEntity, log => log.user)
  reputationLogs?: UserReputationLogEntity[];

  @OneToMany(() => UserNotificationEntity, notification => notification.user)
  notifications?: UserNotificationEntity[];

  @OneToMany(() => DevicePushTokenEntity, pushToken => pushToken.user)
  pushTokens?: DevicePushTokenEntity[];

  @OneToOne(() => UserNotificationPreferenceEntity, preference => preference.user)
  notificationPreference?: UserNotificationPreferenceEntity;

  @OneToMany(() => AccountDeletionRequestEntity, request => request.user)
  deletionRequests?: AccountDeletionRequestEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
