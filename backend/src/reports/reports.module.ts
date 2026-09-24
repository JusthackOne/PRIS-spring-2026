import {
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Admin, CurrentUser, User } from "../common/security";
import { PrismaService } from "../prisma/prisma.module";
import { publicUserSelect } from "../users/users.module";
import { CreateReportDto, UpdateReportDto } from "./reports.dto";
@Injectable()
class ReportsService {
  constructor(private readonly prisma: PrismaService) {}
  list(user: CurrentUser, mine = false) {
    return this.prisma.report.findMany({
      where: user.role === "ADMIN" && !mine ? {} : { userId: user.id },
      include: { user: { select: publicUserSelect } },
      orderBy: { createdAt: "desc" },
    });
  }
  get(id: string, user: CurrentUser) {
    return this.prisma.report.findFirstOrThrow({
      where: { id, ...(user.role === "ADMIN" ? {} : { userId: user.id }) },
      include: { user: { select: publicUserSelect } },
    });
  }
  create(data: CreateReportDto, user: CurrentUser) {
    return this.prisma.report.create({ data: { ...data, userId: user.id } });
  }
  update(id: string, data: UpdateReportDto) {
    return this.prisma.report.update({ where: { id }, data });
  }
}
@ApiTags("Обращения")
@ApiBearerAuth()
@Controller("reports")
class ReportsController {
  constructor(private readonly service: ReportsService) {}
  @Get() @ApiOperation({ summary: "Свои обращения; для ADMIN — все" }) list(
    @User() user: CurrentUser,
  ) {
    return this.service.list(user);
  }
  @Get("my") mine(@User() user: CurrentUser) {
    return this.service.list(user, true);
  }
  @Get(":id") get(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: CurrentUser,
  ) {
    return this.service.get(id, user);
  }
  @Post() create(@Body() dto: CreateReportDto, @User() user: CurrentUser) {
    return this.service.create(dto, user);
  }
  @Admin()
  @Patch(":id")
  @ApiOperation({ summary: "Изменить статус (ADMIN)" })
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateReportDto) {
    return this.service.update(id, dto);
  }
}
@Module({ providers: [ReportsService], controllers: [ReportsController] })
export class ReportsModule {}
