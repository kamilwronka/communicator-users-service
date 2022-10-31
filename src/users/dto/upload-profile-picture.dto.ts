import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';
import { ALLOWED_FILE_TYPES } from '../constants/fileUpload.constant';

export class UploadProfilePictureDto {
  @IsNotEmpty()
  @IsNumber()
  fileSize: number;

  @IsNotEmpty()
  @IsString()
  @Matches(ALLOWED_FILE_TYPES)
  filename: string;
}
