import { Logger } from '@nestjs/common';
import { mockServerClient } from 'mockserver-client';

export const configureMockserver = async () => {
  const mocks = [];

  await Promise.all(
    mocks.map((mock) => {
      mockServerClient('mockserver', 1080).mockAnyResponse(mock);
    }),
  );
  Logger.log('Mocks have been initialized', 'App');
};
