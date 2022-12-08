import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserByIdParamsDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
