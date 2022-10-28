import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { decodeJwtPayload } from 'src/helpers/decodeJwtPayload.helper';
import { formatUserId } from 'src/helpers/formatUserId.helper';

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    try {
      const token = request.headers.authorization;
      const parsedPayload = decodeJwtPayload(token);

      return formatUserId(parsedPayload.sub);
    } catch (error) {
      throw new UnauthorizedException();
    }
  },
);
