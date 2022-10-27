import {
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mediaServiceMockFactory } from 'src/helpers/testHelpers/factories/mediaServiceMock';
import { userRepositoryMockFactory } from 'src/helpers/testHelpers/factories/userRepositoryMock';
import { MediaService } from 'src/media/media.service';
import { ServersService } from 'src/servers/servers.service';
import { Repository } from 'typeorm';
import { Relationship } from './entities/relationship.entity';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { userProfileDataMock } from './__mocks__/userProfileData.mock';

jest.mock('nanoid', () => {
  return {
    nanoid: () => '1234',
  };
});

describe('UsersService', () => {
  let service: UsersService;
  let repositoryMock: Repository<User>;
  let mediaServiceMock: MediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: userRepositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Relationship),
          useValue: { findOne: () => jest.fn().mockReturnValue('test') },
        },
        {
          provide: MediaService,
          useFactory: mediaServiceMockFactory,
        },
        {
          provide: ServersService,
          useValue: { createPrivateChannel: () => jest.fn() },
        },
        {
          provide: 'GATEWAY',
          useValue: { emit: () => jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repositoryMock = module.get<Repository<User>>(getRepositoryToken(User));
    mediaServiceMock = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('returns user data if user has been found', async () => {
      const userId = 'userid';
      const response = await service.findOne(userId);

      expect(response).toEqual(userProfileDataMock);
      expect(repositoryMock.findOne).toHaveBeenCalled();
    });

    it('throws not found exception if there is no user', () => {
      repositoryMock.findOne = jest.fn(() => Promise.resolve(null));

      expect(service.findOne('userid')).rejects.toThrow(NotFoundException);
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
});
