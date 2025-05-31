import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Property } from './property.entity';
import { Appointment } from './appointment.entity';
import { IsEmail, IsNotEmpty, Length, IsPhoneNumber } from 'class-validator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  @IsNotEmpty()
  @Length(2, 50)
  firstName: string;

  @Column({ length: 50 })
  @IsNotEmpty()
  @Length(2, 50)
  lastName: string;

  @Column({ unique: true, length: 100 })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column({ length: 100 })
  @IsNotEmpty()
  password: string;

  @Column({ length: 20 })
  @IsPhoneNumber()
  phoneNumber: string;

  @Column({ default: 'agent' })
  role: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Property, (property) => property.agent)
  properties: Property[];

  @OneToMany(() => Appointment, (appointment) => appointment.agent)
  appointments: Appointment[];
}
