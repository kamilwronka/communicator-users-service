import { formatUserId } from './formatUserId.helper';

describe('helpers', () => {
  describe('formatUserId', () => {
    it('should return correct user id', () => {
      const result = formatUserId('auth0|123');

      expect(result).toEqual('123');
    });
  });
});
