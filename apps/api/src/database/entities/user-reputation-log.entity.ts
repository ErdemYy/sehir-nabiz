import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('user_reputation_logs')
export class UserReputationLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_user_reputation_logs_user_id')
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @Column({ type: 'int' })
  delta!: number;

  @Column({ type: 'varchar', length: 150 })
  reason!: string;

  @Column({ type: 'uuid', nullable: true })
  referenceId?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
