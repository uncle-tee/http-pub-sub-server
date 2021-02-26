import { IsNotEmpty, IsString } from 'class-validator';

export class PublisherRequestDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}