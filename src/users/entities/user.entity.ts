import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
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

  // @Column()
  // contacts: string[];

  // servers: string[];
}
