import { ApiProperty } from "@nestjs/swagger";
import { IncidentType, ReportStatus } from "@prisma/client";
import { IsEnum } from "class-validator";
import { LocationDto } from "../common/location.dto";
export class CreateReportDto extends LocationDto {
  @ApiProperty({ enum: IncidentType })
  @IsEnum(IncidentType)
  category!: IncidentType;
}
export class UpdateReportDto {
  @ApiProperty({ enum: ReportStatus })
  @IsEnum(ReportStatus)
  status!: ReportStatus;
}
