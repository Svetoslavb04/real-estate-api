import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Property } from './property.entity';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

@Entity('property_images')
export class PropertyImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ type: process.env.NODE_ENV === 'test' ? 'blob' : 'bytea' })
  data: Buffer;

  @Column({ length: 50, nullable: true })
  @IsOptional()
  @IsString()
  mimeType: string;

  @CreateDateColumn({
    type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp',
  })
  updatedAt: Date;

  @ManyToOne(() => Property, (property) => property.images)
  property: Property;
}
