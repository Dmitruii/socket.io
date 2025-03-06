import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user: string;

  @Column()
  text: string;

  @Column()
  timestamp: Date;
}
