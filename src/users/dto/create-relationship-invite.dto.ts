import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRelationshipInviteDto {
  @IsNotEmpty()
  @IsString()
  username: string;
}
