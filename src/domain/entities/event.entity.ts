import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Event {


  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  topic: string;

  @CreateDateColumn()
  createdAt: Date;

}