import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { MediaService } from 'src/media/media.service';
import { mediaServiceResponseMock } from 'src/media/__mocks__/mediaServiceResponse.mock';
import { ServersService } from 'src/servers/servers.service';
import { Repository } from 'typeorm';
import {
  Relationship,
  RelationshipStatus,
} from './entities/relationship.entity';
import { User } from './entities/user.entity';
import { mapUserRelationships } from './helpers/mapUserRelationships.helper';
import { UsersService } from './users.service';
import { userProfileDataMock } from './__mocks__/userProfileData.mock';
import { userRelationshipsFromDbMock } from './__mocks__/userRelationships.mock';

jest.mock('nanoid', () => {
  return {
    nanoid: () => '1234',
  };
});
jest.mock('./helpers/mapUserRelationships.helper', () => {
  const originalModule = jest.requireActual(
    './helpers/mapUserRelationships.helper',
  );

  return {
    __esModule: true,
    ...originalModule,
    mapUserRelationships: jest.fn(),
  };
});

describe('UsersService', () => {
  let service: UsersService;
  let repositoryMock: Repository<User>;
  let relationshipsRepositoryMock: Repository<Relationship>;
  let mediaServiceMock: MediaService;
  let gatewayMock;
  let serversServiceMock: ServersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(() => Promise.resolve(userProfileDataMock)),
            save: jest.fn(() => Promise.resolve(userProfileDataMock)),
          },
        },
        {
          provide: getRepositoryToken(Relationship),
          useValue: { findOne: () => Promise.resolve(userProfileDataMock) },
        },
        {
          provide: MediaService,
          useValue: {
            uploadFile: jest.fn(() =>
              Promise.resolve(mediaServiceResponseMock),
            ),
          },
        },
        {
          provide: ServersService,
          useValue: { createPrivateChannel: jest.fn(() => Promise.resolve()) },
        },
        {
          provide: 'GATEWAY',
          useValue: {
            emit: jest.fn(() => of({})),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repositoryMock = module.get<Repository<User>>(getRepositoryToken(User));
    mediaServiceMock = module.get<MediaService>(MediaService);
    relationshipsRepositoryMock = module.get<Repository<Relationship>>(
      getRepositoryToken(Relationship),
    );
    gatewayMock = module.get('GATEWAY');
    serversServiceMock = module.get<ServersService>(ServersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('returns user data if user has been found', async () => {
      const userId = 'userid';
      const response = await service.findById(userId);

      expect(response).toEqual(userProfileDataMock);
      expect(repositoryMock.findOne).toHaveBeenCalled();
    });

    it('throws not found exception if there is no user', () => {
      repositoryMock.findOne = jest.fn(() => Promise.resolve(null));

      expect(service.findById('userid')).rejects.toThrow(NotFoundException);
      expect(repositoryMock.findOne).toHaveBeenCalled();
    });
  });

  describe('findByUsername', () => {
    it('returns user data if user has been found', async () => {
      const username = 'username';
      const response = await service.findByUsername(username);

      expect(response).toEqual(userProfileDataMock);
      expect(repositoryMock.findOne).toHaveBeenCalled();
    });

    it('throws not found exception if there is no user', () => {
      repositoryMock.findOne = jest.fn(() => Promise.resolve(null));

      expect(service.findByUsername('username')).rejects.toThrow(
        NotFoundException,
      );
      expect(repositoryMock.findOne).toHaveBeenCalled();
    });
  });

  describe('createUserAccount', () => {
    it('throws unprocessable entity exception if account already created', () => {
      const user = new User();
      repositoryMock.find = jest.fn(() => Promise.resolve([user]));

      expect(
        service.createUserAccount({
          user: { user_id: 'random', email: 'random@email.com' },
        }),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(repositoryMock.find).toHaveBeenCalled();
    });

    it('creates user account', async () => {
      const user = {
        user_id: 'auth0|userid',
        email: 'random@email.com',
      };
      const transformedUserId = 'userid';
      repositoryMock.find = jest.fn(() => Promise.resolve([]));
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      repositoryMock.create = jest.fn(() =>
        Promise.resolve({
          user_id: transformedUserId,
          email: user.email,
        }),
      );

      const response = await service.createUserAccount({ user });

      expect(repositoryMock.create).toHaveBeenCalledWith({
        user_id: transformedUserId,
        email: user.email,
      });
      expect(repositoryMock.save).toHaveBeenCalledWith({
        user_id: transformedUserId,
        email: user.email,
      });
      expect(response).toEqual(userProfileDataMock);
    });
  });

  describe('createUserProfile', () => {
    it('throws bad request exception if user already has a profile', async () => {
      const user = new User();
      repositoryMock.findOne = jest.fn(() =>
        Promise.resolve({ ...user, profile_created: true }),
      );

      expect(
        service.createUserProfile({ username: 'username' }, 'userid'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws bad request exception if username is taken', async () => {
      const username = 'username';
      const user = new User();
      repositoryMock.findOne = jest.fn(() =>
        Promise.resolve({ ...user, profile_created: false, username }),
      );

      expect(service.createUserProfile({ username }, 'userid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('creates profile and uploads profile picture', async () => {
      mediaServiceMock.uploadFile = jest.fn(() =>
        Promise.resolve({ fileUrl: 'http://test.com' }),
      );
      const user = new User();
      repositoryMock.findOne = jest.fn(() =>
        Promise.resolve({ ...user, profile_created: false }),
      );

      const file = {
        buffer: Buffer.from('random'),
        mimetype: 'image/png',
      } as unknown as Express.Multer.File;
      const userData = { username: 'username' };
      const userId = 'userid';

      await service.createUserProfile(userData, userId, file);

      expect(mediaServiceMock.uploadFile).toHaveBeenCalled();
      expect(repositoryMock.save).toHaveBeenCalledWith({
        ...user,
        profile_created: true,
        profile_picture_url: 'http://test.com',
        username: userData.username,
      });
    });

    it('creates profile if media service fails', async () => {
      mediaServiceMock.uploadFile = jest.fn(() => Promise.reject());
      const user = new User();
      repositoryMock.findOne = jest.fn(() =>
        Promise.resolve({ ...user, profile_created: false }),
      );

      const file = {
        buffer: Buffer.from('random'),
        mimetype: 'image/png',
      } as unknown as Express.Multer.File;
      const userData = { username: 'username' };
      const userId = 'userid';

      await service.createUserProfile(userData, userId, file);

      expect(mediaServiceMock.uploadFile).toHaveBeenCalled();
      expect(repositoryMock.save).toHaveBeenCalledWith({
        ...user,
        profile_created: true,
        username: userData.username,
      });
    });
  });

  describe('findRelationshipById', () => {
    it('should throw not found exception if there is no relationship', () => {
      relationshipsRepositoryMock.findOne = jest.fn(() => {
        return Promise.resolve(undefined);
      });

      expect(service.findRelationshipById('random id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findRelationshipByUsers', () => {
    it('should return matching relationship', async () => {
      const relationship = new Relationship();
      const relationshipWithData = {
        ...relationship,
        ...relationshipsRepositoryMock,
      };
      relationshipsRepositoryMock.findOne = jest.fn(() => {
        return Promise.resolve(relationshipWithData);
      });

      const result = await service.findRelationshipByUsers(
        new User(),
        new User(),
      );

      expect(result).toEqual(relationshipWithData);
      expect(relationshipsRepositoryMock.findOne).toHaveBeenCalled();
    });
  });

  describe('getUserRelationships', () => {
    it('should return relationship list from db and map response', async () => {
      const relationshipsFromDb = userRelationshipsFromDbMock as Relationship[];
      relationshipsRepositoryMock.find = jest.fn(() => {
        return Promise.resolve(relationshipsFromDb);
      });

      await service.getUserRelationships('userid');

      expect(relationshipsRepositoryMock.find).toHaveBeenCalled();
      expect(mapUserRelationships).toHaveBeenCalled();
    });
  });

  describe('createRelationship', () => {
    it('should throw an error if invited id === user id', async () => {
      repositoryMock.findOne = jest.fn(() =>
        Promise.resolve(userProfileDataMock as User),
      );

      expect(
        service.createRelationship(userProfileDataMock.user_id, {
          username: userProfileDataMock.username,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw unprocessable entity exception if relationship already exists', async () => {
      repositoryMock.findOne = jest.fn(() =>
        Promise.resolve(userProfileDataMock as User),
      );
      relationshipsRepositoryMock.findOne = jest.fn(() => {
        return Promise.resolve(userRelationshipsFromDbMock[0] as Relationship);
      });

      expect(
        service.createRelationship('random other userid', {
          username: userProfileDataMock.username,
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should create new relationship and emit an event', async () => {
      repositoryMock.findOne = jest.fn(() =>
        Promise.resolve(userProfileDataMock as User),
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      relationshipsRepositoryMock.save = jest.fn(() =>
        Promise.resolve(userRelationshipsFromDbMock[0] as Relationship),
      );
      relationshipsRepositoryMock.findOne = jest.fn(() => {
        return Promise.resolve(undefined);
      });

      await service.createRelationship('randomuserid', {
        username: userProfileDataMock.username,
      });

      expect(relationshipsRepositoryMock.save).toHaveBeenCalledWith({
        creator: userProfileDataMock,
        receiver: userProfileDataMock,
        status: RelationshipStatus.PENDING,
      });
      expect(gatewayMock.emit).toHaveBeenCalled();
    });
  });

  describe('respondToRelationshipRequest', () => {
    it('should throw bad request exception if received new status is pending', () => {
      expect(
        service.respondToRelationshipRequest(
          'random wrong id',
          `${userRelationshipsFromDbMock[0].id}`,
          { status: RelationshipStatus.PENDING },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw forbidden exception if user is not invite receiver', async () => {
      relationshipsRepositoryMock.findOne = jest.fn(() =>
        Promise.resolve(userRelationshipsFromDbMock[0] as Relationship),
      );

      expect(
        service.respondToRelationshipRequest(
          'random wrong id',
          `${userRelationshipsFromDbMock[0].id}`,
          { status: RelationshipStatus.ACCEPTED },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw bad request exception if status in db is other than pending', async () => {
      relationshipsRepositoryMock.findOne = jest.fn(() =>
        Promise.resolve({
          ...userRelationshipsFromDbMock[0],
          status: RelationshipStatus.ACCEPTED,
        } as Relationship),
      );

      expect(
        service.respondToRelationshipRequest(
          userRelationshipsFromDbMock[0].receiver.user_id,
          `${userRelationshipsFromDbMock[0].id}`,
          { status: RelationshipStatus.ACCEPTED },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should respond to the relationship and create private channel', async () => {
      relationshipsRepositoryMock.findOne = jest.fn(() =>
        Promise.resolve(userRelationshipsFromDbMock[0] as Relationship),
      );
      relationshipsRepositoryMock.save = jest.fn();

      await service.respondToRelationshipRequest(
        userRelationshipsFromDbMock[0].receiver.user_id,
        `${userRelationshipsFromDbMock[0].id}`,
        { status: RelationshipStatus.ACCEPTED },
      );

      expect(serversServiceMock.createPrivateChannel).toHaveBeenCalled();
      expect(relationshipsRepositoryMock.save).toHaveBeenCalled();
    });
  });
});
