import { Type } from 'class-transformer';
import { IsEmail, IsString, ValidateNested } from 'class-validator';

class Auth0UserData {
  @IsString()
  user_id: string;

  @IsEmail()
  email: string;
}

export class CreateUserAccountDto {
  @ValidateNested()
  @Type(() => Auth0UserData)
  user: Auth0UserData;
}
