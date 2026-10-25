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
import { MediaStatus } from '@sehir-nabiz/shared';
import { EventEntity } from './event.entity';
import { UserEntity } from './user.entity';

@Entity('event_media')
export class EventMediaEntity {
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
  uploadedById!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy!: UserEntity;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  storageKey!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  originalFileName?: string | null;

  @Column({ type: 'varchar', length: 50 })
  mimeType!: string;

  @Column({ type: 'bigint' })
  fileSize!: number;

  @Column({ type: 'int', nullable: true })
  width?: number | null;

  @Column({ type: 'int', nullable: true })
  height?: number | null;

  @Index()
  @Column({
    type: 'enum',
    enum: MediaStatus,
    default: MediaStatus.PENDING_UPLOAD,
  })
  status!: MediaStatus;

  @Column({ type: 'varchar', length: 64, nullable: true })
  checksum?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt?: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rejectionReason?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
