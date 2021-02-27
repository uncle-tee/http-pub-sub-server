import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from './message.entity';
import { Subscription } from './subscriber.entity';
import { DeliveryStatus } from '../enums/delivery.status.enum';

@Entity()
export class Notification extends BaseEntity {


  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subscription, { eager: true })
  subscription: Subscription;

  @ManyToOne(() => Message, { eager: true })
  message: Message;

  @Column({ nullable: true })
  responseCode: number;

  @Column({ type: 'text', nullable: true })
  response: string;

  @Column({ default: 0 })
  numberOfAttempt: number;

  @Column({ default: DeliveryStatus.PENDING })
  deliveryStatus: DeliveryStatus;

  @CreateDateColumn()
  createdAt: Date;
}