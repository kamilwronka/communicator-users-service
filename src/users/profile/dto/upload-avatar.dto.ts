import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import {
  ALLOWED_FILE_TYPES,
  PROFILE_PICTURE_MAX_SIZE,
} from 'src/users/profile/constants/fileUpload.constant';

export class UploadAvatarDto {
  @ApiProperty({
    minimum: 1,
    maximum: PROFILE_PICTURE_MAX_SIZE,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(PROFILE_PICTURE_MAX_SIZE)
  size: number;

  @ApiProperty({
    description: `Filename that matches ${ALLOWED_FILE_TYPES}`,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(ALLOWED_FILE_TYPES)
  filename: string;
}
