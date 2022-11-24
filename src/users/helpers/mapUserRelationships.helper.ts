import {
  Relationship,
  RelationshipStatus,
} from '../entities/relationship.entity';
import { ERelationshipTypes } from '../types';

export const mapUserRelationships = (
  userId: string,
  relationships: Relationship[],
) => {
  return relationships.map((relationship: Relationship) => {
    const { status, receiver, creator, id } = relationship;

    let relationshipType = '';

    if (status === RelationshipStatus.ACCEPTED) {
      relationshipType = ERelationshipTypes.ACCEPTED;
    }

    if (status === RelationshipStatus.DECLINED) {
      relationshipType = ERelationshipTypes.DECLINED;
    }

    if (status === RelationshipStatus.PENDING && receiver.id === userId) {
      relationshipType = ERelationshipTypes.RECEIVED_PENDING;
    }

    if (status === RelationshipStatus.PENDING && receiver.id !== userId) {
      relationshipType = ERelationshipTypes.SENT_PENDING;
    }

    if (receiver.id === userId) {
      return {
        id: id,
        type: relationshipType,
        user: creator,
      };
    } else {
      return {
        id: id,
        type: relationshipType,
        user: receiver,
      };
    }
  });
};
