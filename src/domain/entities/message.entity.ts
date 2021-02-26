import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from './event.entity';

@Entity()
export class Message extends BaseEntity {


  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event)
  event: Event;

  @Column({ nullable: true })
  eventId: number;

  @Column({ type: 'text' })
  data: string;

  @CreateDateColumn()
  createdAt: Date;


}