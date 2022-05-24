import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRelationshipInviteDto {
  @IsNotEmpty()
  @IsString()
  user_id: string;
}
