import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Event extends BaseEntity {


  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  topic: string;

  @CreateDateColumn()
  createdAt: Date;

}