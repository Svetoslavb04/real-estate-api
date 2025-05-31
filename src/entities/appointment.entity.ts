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

  @Column({ type: 'datetime' })
  appointmentDate: Date;

  @Column({ length: 100 })
  clientName: string;

  @Column({ length: 100 })
  clientEmail: string;

  @Column({ length: 20 })
  clientPhone: string;

  @Column({ length: 500, nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 20, default: AppointmentStatus.PENDING })
  status: AppointmentStatusType;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.appointments)
  agent: User;

  @ManyToOne(() => Property, (property) => property.appointments)
  property: Property;
}
