import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
class Auth0User {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}

export class CreateUserDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Auth0User)
  user: Auth0User;
}
