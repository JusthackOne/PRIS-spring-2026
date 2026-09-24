import {
  Body,
  Controller,
  Get,
  HttpCode,
  Injectable,
  Module,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import * as bcrypt from "bcrypt";
import { Public, User, CurrentUser } from "../common/security";
import { UsersModule, UsersService } from "../users/users.module";
import { LoginDto, RegisterDto } from "./auth.dto";
@Injectable()
class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}
  async register(dto: RegisterDto) {
    const user = await this.users.create(
      dto.name,
      dto.email,
      await bcrypt.hash(dto.password, 12),
    );
    return { accessToken: await this.jwt.signAsync({ sub: user.id }) };
  }
  async login(dto: LoginDto) {
    const user = await this.users.byEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash)))
      throw new UnauthorizedException("Неверный email или пароль");
    return { accessToken: await this.jwt.signAsync({ sub: user.id }) };
  }
}
@ApiTags("Авторизация")
@Controller("auth")
class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Public()
  @Post("register")
  @ApiOperation({ summary: "Регистрация жителя" })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }
  @Public()
  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Вход и получение JWT" })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Текущий пользователь" })
  me(@User() user: CurrentUser) {
    return user;
  }
}
@Module({
  imports: [UsersModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
