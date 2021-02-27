import { IsNotEmpty, IsString, isURL, IsUrl } from 'class-validator';

export class SubscriberRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl({
    require_tld: false,
  })
  url: string;
}