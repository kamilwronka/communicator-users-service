import { mediaServiceResponseMock } from 'src/media/__mocks__/mediaServiceResponse.mock';

export const mediaServiceMockFactory = () => ({
  uploadFile: jest.fn(() => Promise.resolve(mediaServiceResponseMock)),
});
