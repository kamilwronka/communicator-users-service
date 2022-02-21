import { IsString } from 'class-validator';

export class CreateUserProfileDto {
  @IsString()
  username: string;

  profile_picture_url: string;
}
