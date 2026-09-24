import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IncidentStatus, IncidentType } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";
import { LocationDto } from "../common/location.dto";
export class CreateIncidentDto extends LocationDto {
  @ApiProperty({ enum: IncidentType })
  @IsEnum(IncidentType)
  type!: IncidentType;
  @ApiProperty({ enum: IncidentStatus })
  @IsEnum(IncidentStatus)
  status!: IncidentStatus;
}
export class UpdateIncidentDto extends PartialType(CreateIncidentDto, {
  skipNullProperties: false,
}) {}
export class IncidentFiltersDto {
  @ApiPropertyOptional({ enum: IncidentType })
  @IsOptional()
  @IsEnum(IncidentType)
  type?: IncidentType;
  @ApiPropertyOptional({ enum: IncidentStatus })
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;
}
