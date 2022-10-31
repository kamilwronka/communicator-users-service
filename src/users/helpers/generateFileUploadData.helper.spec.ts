import { generateFileUploadData } from './generateFileUploadData.helper';

const mockedNanoidResult = '1234';

jest.mock('nanoid', () => {
  return {
    nanoid: () => mockedNanoidResult,
  };
});

describe('users', () => {
  describe('helpers', () => {
    describe('generateFileUploadData', () => {
      it('should return correct file upload data', () => {
        const result = generateFileUploadData('folder/userid', 'filename.png');

        const expectedResult = {
          mimeType: 'image/png',
          key: `folder/userid/${mockedNanoidResult}/filename.png`,
        };

        expect(result).toEqual(expectedResult);
      });
    });
  });
});
