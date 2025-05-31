import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Property } from './property.entity';

export const AppointmentStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export type AppointmentStatusType =
  (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp',
  })
  appointmentDate: Date;

  @Column({ type: 'int', default: 60 })
  durationMinutes: number;

  @Column({ length: 100, nullable: true })
  clientName: string;

  @Column({ length: 100, nullable: true })
  clientEmail: string;

  @Column({ length: 20, nullable: true })
  clientPhone: string;

  @Column({ length: 500, nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 20, default: AppointmentStatus.PENDING })
  status: AppointmentStatusType;

  @CreateDateColumn({
    type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp',
  })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.appointments)
  agent: User;

  @ManyToOne(() => Property, (property) => property.appointments)
  property: Property;
}
