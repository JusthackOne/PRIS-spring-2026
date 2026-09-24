import { Controller, Get, Injectable, Module } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.module";
import { Admin } from "../common/security";
import { publicUserSelect } from "../users/users.module";
@Injectable()
class DashboardService {
  constructor(private readonly prisma: PrismaService) {}
  async stats() {
    const distributionQuery = this.prisma.incident.groupBy({
      by: ["type"],
      orderBy: { type: "asc" },
      _count: { id: true },
    });
    const [
      activeIncidents,
      openReports,
      activeVehicles,
      utilityProblems,
      distribution,
    ] = await this.prisma.$transaction([
      this.prisma.incident.count({ where: { status: { not: "RESOLVED" } } }),
      this.prisma.report.count({ where: { status: { not: "RESOLVED" } } }),
      this.prisma.vehicle.count({ where: { status: "ACTIVE" } }),
      this.prisma.incident.count({
        where: { type: "UTILITY", status: { not: "RESOLVED" } },
      }),
      distributionQuery,
    ]);
    return {
      activeIncidents,
      openReports,
      activeVehicles,
      utilityProblems,
      distribution: distribution.map((row) => ({
        type: row.type,
        count: row._count.id,
      })),
    };
  }
  async adminStats() {
    const [users, reports, activeIncidents, latestReports] =
      await this.prisma.$transaction([
        this.prisma.user.count(),
        this.prisma.report.count(),
        this.prisma.incident.count({ where: { status: { not: "RESOLVED" } } }),
        this.prisma.report.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: { select: publicUserSelect } },
        }),
      ]);
    return { users, reports, activeIncidents, latestReports };
  }
}
@ApiTags("Обзор")
@ApiBearerAuth()
@Controller("dashboard")
class DashboardController {
  constructor(private readonly service: DashboardService) {}
  @Get("stats")
  @ApiOperation({ summary: "Городская статистика; открытые = все нерешённые" })
  stats() {
    return this.service.stats();
  }
  @Admin() @Get("admin") admin() {
    return this.service.adminStats();
  }
}
@Module({ providers: [DashboardService], controllers: [DashboardController] })
export class DashboardModule {}
