import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { MediaService } from './media.service';
import { BadGatewayException } from '@nestjs/common';
import { mediaServiceResponseMock } from './__mocks__/mediaServiceResponse.mock';

describe('MediaService', () => {
  let service: MediaService;
  let httpServiceMock: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: HttpService,
          useValue: { get: () => jest.fn(() => of({})) },
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    httpServiceMock = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload', () => {
    it('should throw an error if request to media service fails', async () => {
      httpServiceMock.post = jest.fn(() =>
        throwError(() => new AxiosError(null, '500')),
      );

      const file = {
        buffer: Buffer.from('random'),
        mimetype: 'image/png',
      } as unknown as Express.Multer.File;
      const key = 'test/image.png';

      const requestData = { file, key, mimeType: file.mimetype };

      expect(service.uploadFile(requestData)).rejects.toThrow(
        BadGatewayException,
      );
    });

    it('should upload file to media service', async () => {
      httpServiceMock.post = jest.fn(() =>
        of({ data: mediaServiceResponseMock } as AxiosResponse),
      );

      const file = {
        buffer: Buffer.from('random'),
        mimetype: 'image/png',
      } as unknown as Express.Multer.File;
      const key = 'test/image.png';

      const requestData = { file, key, mimeType: file.mimetype };

      const response = await service.uploadFile(requestData);

      expect(httpServiceMock.post).toHaveBeenCalledWith('/upload', {
        ...requestData,
        file: file.buffer.toString('base64'),
      });
      expect(response).toEqual(mediaServiceResponseMock);
    });
  });
});
