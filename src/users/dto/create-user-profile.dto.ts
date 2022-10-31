import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserProfileDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  profilePictureKey?: string;
}
