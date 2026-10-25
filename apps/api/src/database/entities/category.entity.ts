import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { EventEntity } from './event.entity';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string;

  @Column({ name: 'name_tr', type: 'varchar', length: 100 })
  nameTr!: string;

  @Column({ name: 'description_tr', type: 'text' })
  descriptionTr!: string;

  @Column({ type: 'varchar', length: 50 })
  icon!: string;

  @Column({ name: 'color_hex', type: 'varchar', length: 7 })
  colorHex!: string;

  @Column({ name: 'default_duration_hours', type: 'int', default: 4 })
  defaultDurationHours!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => EventEntity, event => event.category)
  events?: EventEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
