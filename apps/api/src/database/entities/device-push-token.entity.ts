import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { PushPlatform } from '@sehir-nabiz/shared';
import { UserEntity } from './user.entity';

@Entity('device_push_tokens')
@Unique('uq_device_push_token', ['token'])
@Index(['userId', 'isActive'])
export class DevicePushTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @Column({ type: 'varchar', length: 255 })
  token!: string;

  @Column({
    type: 'enum',
    enum: PushPlatform,
    default: PushPlatform.ANDROID,
  })
  platform!: PushPlatform;

  @Column({ type: 'varchar', length: 128, nullable: true })
  deviceIdentifier?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastSeenAt!: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
