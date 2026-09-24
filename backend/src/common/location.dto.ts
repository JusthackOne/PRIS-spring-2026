import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsString, Length, Max, Min } from "class-validator";
export class LocationDto {
  @ApiProperty({ minLength: 3, maxLength: 160 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @Length(3, 160)
  title!: string;
  @ApiProperty({ minLength: 10, maxLength: 3000 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @Length(10, 3000)
  description!: string;
  @ApiProperty({ minLength: 3, maxLength: 300 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @Length(3, 300)
  address!: string;
  @ApiProperty({ minimum: -90, maximum: 90, example: 55.751 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;
  @ApiProperty({ minimum: -180, maximum: 180, example: 37.618 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;
}
