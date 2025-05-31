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

export const PropertyFeatureCategory = {
  INTERIOR: 'INTERIOR',
  EXTERIOR: 'EXTERIOR',
  COMMUNITY: 'COMMUNITY',
} as const;

export type PropertyFeatureCategoryType =
  (typeof PropertyFeatureCategory)[keyof typeof PropertyFeatureCategory];

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
    type: 'varchar',
    length: 20,
    default: PropertyFeatureCategory.INTERIOR,
  })
  category: PropertyFeatureCategoryType;

  @Column({ type: 'boolean', default: true })
  isHighlight: boolean;

  @Column({ type: 'int', nullable: true })
  value: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => Property, (property) => property.features)
  property: Property;
}
