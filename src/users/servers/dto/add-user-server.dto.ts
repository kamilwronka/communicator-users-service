import { IsMongoId, IsString } from 'class-validator';

export class AddUserServerDto {
  @IsString()
  @IsMongoId()
  serverId: string;

  @IsString()
  // @Matches() - add user id matching
  userId: string;
}
