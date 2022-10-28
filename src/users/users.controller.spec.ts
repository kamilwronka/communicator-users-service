import { Test, TestingModule } from '@nestjs/testing';
import { RelationshipStatus } from './entities/relationship.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersServiceMock: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(() => Promise.resolve()),
            getUserRelationships: jest.fn(() => Promise.resolve()),
            createRelationship: jest.fn(() => Promise.resolve()),
            respondToRelationshipRequest: jest.fn(() => Promise.resolve()),
            createUserAccount: jest.fn(() => Promise.resolve()),
            createUserProfile: jest.fn(() => Promise.resolve()),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersServiceMock = module.get<UsersService>(UsersService);
  });

  it('controller should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('getUserData', () => {
    it('should get user data', async () => {
      await usersController.getUserData('randomid');

      expect(usersServiceMock.findById).toHaveBeenCalled();
    });
  });

  describe('getUserRelationships', () => {
    it('should get user relationships', async () => {
      await usersController.getUserRelationships('userid');

      expect(usersServiceMock.getUserRelationships).toHaveBeenCalled();
    });
  });

  describe('createRelationshipInvite', () => {
    it('should get user relationships', async () => {
      await usersController.createRelationshipInvite('userid', {
        username: 'username',
      });

      expect(usersServiceMock.createRelationship).toHaveBeenCalled();
    });
  });

  describe('respondToRelationshipRequest', () => {
    it('should get user relationships', async () => {
      await usersController.respondToRelationshipRequest(
        'userid',
        'relationshipid',
        { status: RelationshipStatus.ACCEPTED },
      );

      expect(usersServiceMock.respondToRelationshipRequest).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should get user relationships', async () => {
      await usersController.getUserById('userid');

      expect(usersServiceMock.findById).toHaveBeenCalled();
    });
  });

  describe('createUserAccount', () => {
    it('should get user relationships', async () => {
      await usersController.createUserAccount({
        user: { user_id: 'userid', email: 'email@email.com' },
      });

      expect(usersServiceMock.createUserAccount).toHaveBeenCalled();
    });
  });

  describe('createUserProfile', () => {
    it('should return user profile', async () => {
      const file = {
        buffer: Buffer.from('random'),
      } as unknown as Express.Multer.File;

      await usersController.createUserProfile(
        'randomId',
        {
          username: 'test',
        },
        file,
      );

      expect(usersServiceMock.createUserProfile).toHaveBeenCalled();
    });
  });
});
