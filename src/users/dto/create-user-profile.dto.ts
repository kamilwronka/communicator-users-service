import { IsBase64, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserProfileDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsNotEmpty()
  @IsBase64()
  data?: string;
}
