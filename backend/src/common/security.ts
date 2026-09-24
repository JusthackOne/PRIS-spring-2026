import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { PrismaService } from "../prisma/prisma.module";
export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
type AuthRequest = Request & { user: CurrentUser };
export const Public = () => SetMetadata("public", true);
export const Admin = () => SetMetadata("roles", [UserRole.ADMIN]);
export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUser =>
    ctx.switchToHttp().getRequest<AuthRequest>().user,
);
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}
  async canActivate(ctx: ExecutionContext) {
    if (
      this.reflector.getAllAndOverride<boolean>("public", [
        ctx.getHandler(),
        ctx.getClass(),
      ])
    )
      return true;
    const req = ctx.switchToHttp().getRequest<AuthRequest>();
    const [scheme, token] = req.headers.authorization?.split(" ") ?? [];
    if (scheme !== "Bearer" || !token)
      throw new UnauthorizedException("Необходим вход в систему");
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, name: true, email: true, role: true },
      });
      if (!user) throw new Error("Unknown user");
      req.user = user;
      return true;
    } catch {
      throw new UnauthorizedException("Сессия истекла. Войдите снова");
    }
  }
}
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(ctx: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<UserRole[]>("roles", [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (
      roles &&
      !roles.includes(ctx.switchToHttp().getRequest<AuthRequest>().user.role)
    )
      throw new ForbiddenException("Недостаточно прав");
    return true;
  }
}
