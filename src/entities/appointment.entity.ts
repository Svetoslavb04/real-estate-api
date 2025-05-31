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

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  appointmentDate: Date;

  @Column({ length: 100 })
  clientName: string;

  @Column({ length: 100 })
  clientEmail: string;

  @Column({ length: 20 })
  clientPhone: string;

  @Column({ length: 500, nullable: true })
  notes: string;

  @Column({ length: 20 })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.appointments)
  agent: User;

  @ManyToOne(() => Property, (property) => property.appointments)
  property: Property;
}
