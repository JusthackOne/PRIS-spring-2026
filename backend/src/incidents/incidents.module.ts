import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Admin } from "../common/security";
import { PrismaService } from "../prisma/prisma.module";
import {
  CreateIncidentDto,
  IncidentFiltersDto,
  UpdateIncidentDto,
} from "./incidents.dto";
@Injectable()
class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}
  list(where: IncidentFiltersDto) {
    return this.prisma.incident.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }
  get(id: string) {
    return this.prisma.incident.findUniqueOrThrow({ where: { id } });
  }
  create(data: CreateIncidentDto) {
    return this.prisma.incident.create({ data });
  }
  update(id: string, data: UpdateIncidentDto) {
    return this.prisma.incident.update({ where: { id }, data });
  }
  delete(id: string) {
    return this.prisma.incident.delete({ where: { id } });
  }
}
@ApiTags("Инциденты")
@ApiBearerAuth()
@Controller("incidents")
class IncidentsController {
  constructor(private readonly service: IncidentsService) {}
  @Get()
  @ApiOperation({ summary: "Список с фильтрами по типу и статусу" })
  list(@Query() query: IncidentFiltersDto) {
    return this.service.list(query);
  }
  @Get(":id") get(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.get(id);
  }
  @Admin()
  @Post()
  @ApiOperation({ summary: "Создать инцидент (ADMIN)" })
  create(@Body() dto: CreateIncidentDto) {
    return this.service.create(dto);
  }
  @Admin() @Patch(":id") update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.service.update(id, dto);
  }
  @Admin() @Delete(":id") delete(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }
}
@Module({ providers: [IncidentsService], controllers: [IncidentsController] })
export class IncidentsModule {}
