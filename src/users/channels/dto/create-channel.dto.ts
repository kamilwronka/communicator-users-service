import { IsArray, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsArray()
  @IsString({ each: true })
  users: string[];
}
