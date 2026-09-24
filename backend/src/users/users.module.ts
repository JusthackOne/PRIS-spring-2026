import { Injectable, Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.module";
export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  byEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
  create(name: string, email: string, passwordHash: string) {
    return this.prisma.user.create({
      data: { name, email, passwordHash },
      select: publicUserSelect,
    });
  }
}
@Module({ providers: [UsersService], exports: [UsersService] })
export class UsersModule {}
