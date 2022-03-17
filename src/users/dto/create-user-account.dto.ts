import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

class Auth0UserData {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class CreateUserDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Auth0UserData)
  user: Auth0UserData;
}
