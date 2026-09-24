import { IsNotEmpty, IsNumberString } from 'class-validator';

export class WeatherQueryDto {
  @IsNumberString()
  @IsNotEmpty()
  lat: string;

  @IsNumberString()
  @IsNotEmpty()
  lon: string;
}
