import { HttpService } from '@nestjs/axios';
import { BadGatewayException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosError, AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { User } from 'src/users/entities/user.entity';

import { ServersService } from './servers.service';

describe('ServersService', () => {
  let service: ServersService;
  let httpServiceMock: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServersService,
        {
          provide: HttpService,
          useValue: { get: () => jest.fn(() => of({})) },
        },
      ],
    }).compile();

    service = module.get<ServersService>(ServersService);
    httpServiceMock = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPrivateChannel', () => {
    it('should throw an error if request to servers service fails', async () => {
      httpServiceMock.post = jest.fn(() =>
        throwError(() => new AxiosError(null, '500')),
      );

      expect(service.createPrivateChannel([new User()])).rejects.toThrow(
        BadGatewayException,
      );
      expect(httpServiceMock.post).toHaveBeenCalled();
    });

    it('should return request data if request succeeds', async () => {
      httpServiceMock.post = jest.fn(() => of({ data: {} } as AxiosResponse));

      const response = await service.createPrivateChannel([new User()]);

      expect(httpServiceMock.post).toHaveBeenCalled();
      expect(response).toEqual({});
    });
  });
});
