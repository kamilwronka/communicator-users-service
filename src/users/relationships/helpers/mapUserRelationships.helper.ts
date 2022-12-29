import {
  Relationship,
  RelationshipStatus,
} from '../entities/relationship.entity';
import { MappedRelationshipType } from '../enums/mapped-relationship-type.enum';

import { User } from '../../entities/user.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { Type } from 'class-transformer';

export class MappedRelationship {
  constructor(partial: Partial<MappedRelationship>) {
    Object.assign(this, partial);
  }

  id: string;

  type: MappedRelationshipType;

  @Type(() => User)
  user: User;
}

export const mapUserRelationships = (
  userId: string,
  relationships: Relationship[],
) => {
  return relationships.map((relationship: Relationship) => {
    const { status, receiver, creator, id } = relationship;

    let type;

    if (status === RelationshipStatus.ACCEPTED) {
      type = MappedRelationshipType.ACCEPTED;
    }

    if (status === RelationshipStatus.DECLINED) {
      type = MappedRelationshipType.DECLINED;
    }

    if (status === RelationshipStatus.PENDING && receiver.id === userId) {
      type = MappedRelationshipType.RECEIVED_PENDING;
    }

    if (status === RelationshipStatus.PENDING && receiver.id !== userId) {
      type = MappedRelationshipType.SENT_PENDING;
    }

    if (!type) {
      throw new InternalServerErrorException();
    }

    const user = receiver.id === userId ? creator : receiver;

    return new MappedRelationship({
      id,
      user,
      type,
    });
  });
};
