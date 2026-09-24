import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { requiredEnv } from "./common/env";
import { JwtGuard, RolesGuard } from "./common/security";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { IncidentsModule } from "./incidents/incidents.module";
import { ReportsModule } from "./reports/reports.module";
import { TransportModule } from "./transport/transport.module";
import { DashboardModule } from "./dashboard/dashboard.module";
@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: () => {
        const secret = requiredEnv("JWT_SECRET");
        if (secret.length < 32)
          throw new Error("JWT_SECRET must contain at least 32 characters");
        return {
          secret,
          signOptions: { expiresIn: "8h", algorithm: "HS256" },
          verifyOptions: { algorithms: ["HS256"] },
        };
      },
    }),
    AuthModule,
    IncidentsModule,
    ReportsModule,
    TransportModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
