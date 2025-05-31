import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Property } from './property.entity';
import { IsNotEmpty, IsString, IsUrl, IsOptional } from 'class-validator';

@Entity('property_images')
export class PropertyImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUrl()
  url: string;

  @Column({ length: 100 })
  @IsNotEmpty()
  @IsString()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ type: 'boolean', default: false })
  isMain: boolean;

  @Column({ type: 'bytea', nullable: true })
  data: Buffer;

  @Column({ length: 50, nullable: true })
  @IsOptional()
  @IsString()
  mimeType: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Property, (property) => property.images)
  property: Property;
}
