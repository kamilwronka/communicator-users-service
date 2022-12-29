import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Column,
  PrimaryColumn,
} from 'typeorm';

export enum RelationshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

@Entity()
export class Relationship {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => User, (user: User) => user.sent_relationship_requests)
  creator: User;

  @ManyToOne(() => User, (user: User) => user.received_relationship_requests)
  receiver: User;

  @Column({ type: 'enum', enum: RelationshipStatus })
  status: RelationshipStatus;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;
}
