import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    try {
      const token = request.headers.authorization;
      const payload = token.split('.')[1];
      const decoded = Buffer.from(payload, 'base64').toString('utf-8');
      const parsedPayload = JSON.parse(decoded);

      return parsedPayload.sub.replace('auth0|', '');
    } catch (error) {
      throw new UnauthorizedException();
    }
  },
);
