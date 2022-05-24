import { HttpService } from '@nestjs/axios';
import { User } from 'src/users/entities/user.entity';

export const createPrivateChannel = async (users: User[]): Promise<any> => {
  const response = await new HttpService().post(
    'http://servers:4000/private/channels',
    {
      type: 'PRIVATE',
      users,
    },
  );

  return response.toPromise();
};
