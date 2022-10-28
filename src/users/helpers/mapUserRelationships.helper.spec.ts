import { Relationship } from '../entities/relationship.entity';
import {
  userRelationshipsFromDbMock,
  userRelationshipsMock,
} from '../__mocks__/userRelationships.mock';
import { mapUserRelationships } from './mapUserRelationships.helper';

describe('users', () => {
  describe('helpers', () => {
    describe('mapUserRelationships', () => {
      it('should return relationship list with correct statuses', () => {
        const result = mapUserRelationships(
          userRelationshipsFromDbMock[0].creator.user_id,
          userRelationshipsFromDbMock as Relationship[],
        );

        expect(result).toEqual(userRelationshipsMock);
      });
    });
  });
});
