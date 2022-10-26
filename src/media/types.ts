export type TUploadFileResponse = {
  fileUrl: string;
};

export type TUploadFileData = {
  key: string;
  file: Express.Multer.File;
  mimeType: string;
};
