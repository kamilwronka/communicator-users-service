import { HttpService } from '@nestjs/axios';

type TUploadFileResponse = {
  file_url: string;
};

export const uploadAvatar = async (
  key: string,
  data: string,
): Promise<TUploadFileResponse> => {
  const response = new HttpService().post(`http://media:4000/upload`, {
    key,
    data,
  });
  const imageData = await response.toPromise();

  return imageData.data;
};
