import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
  IsIn,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  @IsIn(['en', 'si', 'ta'])
  language?: string;

  @IsString()
  @IsOptional()
  @IsIn(['student', 'farmer', 'hiker', 'traveller', 'fisherman', 'other'])
  userType?: string;

  @IsArray()
  @IsOptional()
  healthAlerts?: string[];

  @IsBoolean()
  @IsOptional()
  voiceAlertsEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  locationPermissionGranted?: boolean;

  @IsNumber()
  @IsOptional()
  lastLatitude?: number;

  @IsNumber()
  @IsOptional()
  lastLongitude?: number;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  country?: string;
}
