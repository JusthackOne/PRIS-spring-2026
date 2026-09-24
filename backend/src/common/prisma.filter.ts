import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Response } from "express";
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaFilter implements ExceptionFilter {
  catch(error: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const status =
      error.code === "P2025" ? 404 : error.code === "P2002" ? 409 : 500;
    const message =
      status === 404
        ? "Запись не найдена"
        : status === 409
          ? "Запись уже существует"
          : "Не удалось выполнить операцию";
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json({ statusCode: status, message });
  }
}
