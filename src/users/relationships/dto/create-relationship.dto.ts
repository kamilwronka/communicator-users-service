import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRelationshipDto {
  @ApiProperty({ description: 'added user username', type: String })
  @IsNotEmpty()
  @IsString()
  username: string;
}
