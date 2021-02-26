import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from './message.entity';
import { Subscription } from './subscriber.entity';

@Entity()
export class Notification {


  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subscription)
  subscription: Subscription;

  @ManyToOne(() => Message)
  message: Message;

  @Column()
  responseCode: number;

  @Column({ type: 'text' })
  responseMessage: string;
}