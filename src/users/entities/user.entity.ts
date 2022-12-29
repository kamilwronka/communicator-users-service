import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { createHash } from 'crypto';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  PrimaryColumn,
  VersionColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Relationship } from '../relationships/entities/relationship.entity';

@Entity()
export class User {
  @ApiProperty()
  @PrimaryColumn({ unique: true, nullable: false })
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column({ unique: true, nullable: true })
  username: string;

  @ApiProperty()
  @Column({ nullable: true })
  avatar: string;

  @ApiProperty()
  @Column({ default: '' })
  description: string;

  @Exclude()
  @CreateDateColumn()
  created_at: string;

  @Exclude()
  @UpdateDateColumn()
  updated_at: string;

  @Exclude()
  @OneToMany(
    () => Relationship,
    (relationsip: Relationship) => relationsip.creator,
  )
  sent_relationship_requests: Relationship[];

  @Exclude()
  @OneToMany(
    () => Relationship,
    (relationsip: Relationship) => relationsip.receiver,
  )
  received_relationship_requests: Relationship[];

  @Exclude()
  @VersionColumn()
  version: number;

  @Exclude()
  @Column({ nullable: false, unique: true })
  version_hash: string;

  @BeforeInsert()
  @BeforeUpdate()
  private generateVersionHash(): void {
    const {
      id,
      email,
      username,
      avatar,
      description,
      created_at,
      updated_at,
      version,
    } = this;
    this.version_hash = createHash('sha256')
      .update(
        JSON.stringify({
          id,
          email,
          username,
          avatar,
          description,
          created_at,
          updated_at,
          version,
        }),
      )
      .digest('hex');
  }

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
