import { userProfileDataMock } from 'src/users/__mocks__/userProfileData.mock';

export const userRepositoryMockFactory = () => ({
  findOne: jest.fn(() => Promise.resolve(userProfileDataMock)),
  save: jest.fn(() => Promise.resolve(userProfileDataMock)),
});
