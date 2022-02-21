import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  user_id: string;

  @Column()
  created_at: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  profile_created: boolean;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ nullable: true })
  profile_picture_url: string;

  // @Column()
  // contacts: string[];

  // servers: string[];
}
