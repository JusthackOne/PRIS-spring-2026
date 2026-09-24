import "reflect-metadata";
import "./common/env";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { PrismaFilter } from "./common/prisma.filter";
import { requiredEnv } from "./common/env";
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.use(helmet());
  app.enableCors({
    origin: requiredEnv("CORS_ORIGIN")
      .split(",")
      .map((origin) => origin.trim()),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new PrismaFilter());
  app.enableShutdownHooks();
  const config = new DocumentBuilder()
    .setTitle("CityPulse API")
    .setDescription(
      "Мониторинг городской инфраструктуры. Все данные демонстрационные.",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    "api/docs",
    app,
    SwaggerModule.createDocument(app, config),
  );
  await app.listen(Number(process.env.PORT ?? 3000), "0.0.0.0");
}
bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
