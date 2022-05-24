import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
} from 'typeorm';
import { User } from './user.entity';

export enum RelationshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

export type RelationshipRequest = {
  creator: User;
  receiver: User;
  status: RelationshipStatus;
};

@Entity()
export class Relationship {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user: User) => user.sentRelationshipRequests)
  creator: User;

  @ManyToOne(() => User, (user: User) => user.receivedRelationshipRequests)
  receiver: User;

  @Column({ type: 'enum', enum: RelationshipStatus })
  status: RelationshipStatus;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;
}
