import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsString,
  Length,
  MaxLength,
  IsByteLength,
} from "class-validator";
export class LoginDto {
  @ApiProperty({ example: "user@citypulse.local" })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email!: string;
  @ApiProperty({ minLength: 8, maxLength: 72, format: "password" })
  @IsString()
  @Length(8, 72)
  @IsByteLength(8, 72)
  password!: string;
}
export class RegisterDto extends LoginDto {
  @ApiProperty({ minLength: 2, maxLength: 80 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @Length(2, 80)
  name!: string;
}
