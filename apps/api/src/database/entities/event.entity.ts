import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { EventSeverity, EventStatus } from '@sehir-nabiz/shared';
import { UserEntity } from './user.entity';
import { CategoryEntity } from './category.entity';
import { EventFeedbackEntity } from './event-feedback.entity';

@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  authorId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author!: UserEntity;

  @Index()
  @Column({ type: 'uuid' })
  categoryId!: string;

  @ManyToOne(() => CategoryEntity, category => category.events, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category!: CategoryEntity;

  @Column({ type: 'varchar', length: 150 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: EventSeverity,
    default: EventSeverity.MEDIUM,
  })
  severity!: EventSeverity;

  @Index()
  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.PENDING_REVIEW,
  })
  status!: EventStatus;

  /**
   * PostGIS 2D Point (WGS84 - SRID 4326)
   * GiST spatial index uygulanır.
   */
  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  addressText?: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  city?: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  district?: string | null;

  @Column({ type: 'int', default: 0 })
  confirmationCount!: number;

  @Column({ type: 'int', default: 0 })
  denialCount!: number;

  @Column({ type: 'int', default: 0 })
  disputeCount!: number;

  @Column({ type: 'int', default: 0 })
  resolvedReportCount!: number;

  @OneToMany(() => EventFeedbackEntity, feedback => feedback.event)
  feedbacks?: EventFeedbackEntity[];

  @Column({ type: 'double precision', default: 1.0 })
  reliabilityScore!: number;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt?: Date | null;

  @Column({ type: 'boolean', default: false })
  isDemo!: boolean;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
