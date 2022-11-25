import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { AUTH_NAMESPACE } from 'src/constants/auth-namespace.constant';
import { decodeJwtPayload } from 'src/helpers/decodeJwtPayload.helper';

export const UserId = createParamDecorator(function (
  data: unknown,
  ctx: ExecutionContext,
) {
  const request = ctx.switchToHttp().getRequest();

  try {
    const token = request.headers.authorization;
    const parsedPayload = decodeJwtPayload(token);

    return parsedPayload[AUTH_NAMESPACE];
  } catch (error) {
    throw new UnauthorizedException();
  }
});
