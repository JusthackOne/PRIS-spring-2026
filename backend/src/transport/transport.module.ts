import {
  Controller,
  Get,
  Injectable,
  Module,
  Param,
  ParseUUIDPipe,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiPropertyOptional, ApiTags } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";
import { PrismaService } from "../prisma/prisma.module";
class VehicleFiltersDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() routeId?: string;
}
@Injectable()
class TransportService {
  constructor(private readonly prisma: PrismaService) {}
  routes() {
    return this.prisma.route.findMany({ orderBy: { name: "asc" } });
  }
  route(id: string) {
    return this.prisma.route.findUniqueOrThrow({
      where: { id },
      include: { vehicles: true },
    });
  }
  vehicles(where: VehicleFiltersDto) {
    return this.prisma.vehicle.findMany({
      where,
      include: { route: true },
      orderBy: { number: "asc" },
    });
  }
  vehicle(id: string) {
    return this.prisma.vehicle.findUniqueOrThrow({
      where: { id },
      include: { route: true },
    });
  }
}
@ApiTags("Транспорт")
@ApiBearerAuth()
@Controller()
class TransportController {
  constructor(private readonly service: TransportService) {}
  @Get("routes") routes() {
    return this.service.routes();
  }
  @Get("routes/:id") route(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.route(id);
  }
  @Get("vehicles") vehicles(@Query() query: VehicleFiltersDto) {
    return this.service.vehicles(query);
  }
  @Get("vehicles/:id") vehicle(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.vehicle(id);
  }
}
@Module({ providers: [TransportService], controllers: [TransportController] })
export class TransportModule {}
