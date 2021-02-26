import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class SubscriberRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;
}