import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateServerDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  id: string;

  @IsOptional()
  @IsString()
  icon: string;

  @IsString()
  name: string;
}
