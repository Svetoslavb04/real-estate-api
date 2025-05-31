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
import { PropertyFeature } from './property-feature.entity';
import { IsNotEmpty, Min, Length } from 'class-validator';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
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

  @Column({ length: 20 })
  @IsNotEmpty()
  propertyType: string;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.properties)
  agent: User;

  @OneToMany(() => Appointment, (appointment) => appointment.property)
  appointments: Appointment[];

  @OneToMany(() => PropertyFeature, (feature) => feature.property)
  features: PropertyFeature[];
}
