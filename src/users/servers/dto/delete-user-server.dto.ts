import { IsMongoId, IsString } from 'class-validator';

export class DeleteUserServerDto {
  @IsString()
  @IsMongoId()
  serverId: string;

  @IsString()
  // @Matches() - add user id matching
  userId: string;
}
