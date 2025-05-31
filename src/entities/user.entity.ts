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
import { IsEmail, IsNotEmpty, Length, IsEnum } from 'class-validator';

export const UserRole = {
  ADMIN: 'admin',
  AGENT: 'agent',
  CLIENT: 'client',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  @IsNotEmpty()
  @Length(2, 100)
  firstName: string;

  @Column({ length: 100 })
  @IsNotEmpty()
  @Length(2, 100)
  lastName: string;

  @Column({ length: 100, unique: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Column({ length: 100 })
  @IsNotEmpty()
  password: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 20, default: UserRole.CLIENT })
  @IsEnum(UserRole)
  role: UserRoleType;

  @CreateDateColumn({
    type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp',
  })
  updatedAt: Date;

  @OneToMany(() => Property, (property) => property.agent)
  properties: Property[];

  @OneToMany(() => Appointment, (appointment) => appointment.agent)
  appointments: Appointment[];
}
