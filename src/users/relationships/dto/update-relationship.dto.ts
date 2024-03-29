import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { RelationshipStatus } from '../entities/relationship.entity';

export class UpdateRelationshipDto {
  @ApiProperty({
    enum: RelationshipStatus,
    default: RelationshipStatus.ACCEPTED,
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(RelationshipStatus)
  status: RelationshipStatus;
}

export class UpdateRelationshipParamsDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
