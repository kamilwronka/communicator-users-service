import { registerAs } from '@nestjs/config';
import { ICloudflareConfig } from './types';

export default registerAs('cloudflare', (): ICloudflareConfig => {
  const {
    CLOUDFLARE_ACCESS_KEY_ID,
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_SECRET_ACCESS_KEY,
    CLOUDFLARE_R2_BUCKET_NAME,
  } = process.env;

  return {
    secret: CLOUDFLARE_SECRET_ACCESS_KEY,
    apiKey: CLOUDFLARE_ACCESS_KEY_ID,
    accountId: CLOUDFLARE_ACCOUNT_ID,
    bucketName: CLOUDFLARE_R2_BUCKET_NAME,
  };
});
