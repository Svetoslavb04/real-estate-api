import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from './property.entity';
import { IsNotEmpty, Length } from 'class-validator';

@Entity('property_features')
export class PropertyFeature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  @IsNotEmpty()
  @Length(2, 50)
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['INTERIOR', 'EXTERIOR', 'COMMUNITY'],
    default: 'INTERIOR',
  })
  category: string;

  @Column({ type: 'boolean', default: true })
  isHighlight: boolean;

  @Column({ type: 'int', nullable: true })
  value: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Property, (property) => property.features)
  property: Property;
}
