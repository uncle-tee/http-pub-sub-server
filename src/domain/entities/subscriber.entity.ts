import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from './event.entity';

@Entity()
export class Subscription extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event)
  event: Event;

  @Column({ unique: true })
  webHook: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  eventId: number;

}