import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Relationship } from './relationship.entity';

@Entity()
export class User {
  @PrimaryColumn({ unique: true })
  user_id: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  profile_created: boolean;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ nullable: true })
  profile_picture_url: string;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @OneToMany(
    () => Relationship,
    (relationsip: Relationship) => relationsip.creator,
  )
  sent_relationship_requests: Relationship[];

  @OneToMany(
    () => Relationship,
    (relationsip: Relationship) => relationsip.receiver,
  )
  received_relationship_requests: Relationship[];
}
