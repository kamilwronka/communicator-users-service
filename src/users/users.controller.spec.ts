import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { UsersService } from './users.service';
import { userProfileDataMock } from './__mocks__/userProfileData.mock';

const moduleMocker = new ModuleMocker(global);

describe('UsersController', () => {
  let usersController: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
    })
      .useMocker((token) => {
        if (token === UsersService) {
          return {
            createUserProfile: jest.fn().mockReturnValue(userProfileDataMock),
            respondToRelationshipRequest: jest.fn().mockReturnValue('xd'),
          };
        }

        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    usersController = module.get<UsersController>(UsersController);
  });

  it('controller should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('createUserProfile', () => {
    it('should return user profile', async () => {
      const file = {
        buffer: Buffer.from('random'),
      } as unknown as Express.Multer.File;

      const result = await usersController.createUserProfile(
        'randomId',
        {
          username: 'test',
        },
        file,
      );

      expect(result).toEqual(userProfileDataMock);
    });
  });
});
