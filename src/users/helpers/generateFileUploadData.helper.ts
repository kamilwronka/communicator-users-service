import { lookup } from 'mime-types';
import { nanoid } from 'nanoid';

export const generateFileUploadData = (
  destination: string,
  filename: string,
) => {
  const nonce = nanoid();
  const key = `${destination}/${nonce}/${filename}`;
  const mimeType = lookup(filename);

  return { key, mimeType };
};
