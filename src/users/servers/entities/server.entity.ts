import { Exclude } from 'class-transformer';
import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class Server {
  @PrimaryColumn({ unique: true })
  id: string;

  @Column({ nullable: true })
  icon: string;

  @Column()
  name: string;

  @Exclude()
  @CreateDateColumn()
  created_at: string;

  @Exclude()
  @UpdateDateColumn()
  updated_at: string;

  constructor(partial: Partial<Server>) {
    Object.assign(this, partial);
  }
}
