import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Appointment } from './appointment.entity';
import { IsNotEmpty, Min, Length } from 'class-validator';

export const PropertyType = {
  HOUSE: 'house',
  APARTMENT: 'apartment',
  CONDO: 'condo',
  TOWNHOUSE: 'townhouse',
  LAND: 'land',
  COMMERCIAL: 'commercial',
} as const;

export type PropertyTypeType = (typeof PropertyType)[keyof typeof PropertyType];

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  @IsNotEmpty()
  @Length(5, 100)
  title: string;

  @Column({ length: 500 })
  @IsNotEmpty()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNotEmpty()
  @Min(0)
  price: number;

  @Column({ length: 100 })
  @IsNotEmpty()
  address: string;

  @Column({ length: 50 })
  @IsNotEmpty()
  city: string;

  @Column({ type: 'int' })
  @IsNotEmpty()
  @Min(0)
  bedrooms: number;

  @Column({ type: 'int' })
  @IsNotEmpty()
  @Min(0)
  bathrooms: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNotEmpty()
  @Min(0)
  area: number;

  @Column({ type: 'varchar', length: 20 })
  @IsNotEmpty()
  propertyType: PropertyTypeType;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @CreateDateColumn({
    type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp',
  })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.properties)
  agent: User;

  @OneToMany(() => Appointment, (appointment) => appointment.property)
  appointments: Appointment[];
}
