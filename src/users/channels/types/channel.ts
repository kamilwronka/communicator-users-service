import { User } from '../../entities/user.entity';

export type Channel = {
  id: string;
  name: string;
  type: string;
  users: User[];
  lastMessageDate: string;
};
