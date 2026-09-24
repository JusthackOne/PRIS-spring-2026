import "../src/common/env";
import {
  PrismaClient,
  IncidentType,
  IncidentStatus,
  TransportType,
} from "@prisma/client";
import * as bcrypt from "bcrypt";
import { requiredEnv } from "../src/common/env";
const prisma = new PrismaClient();
const id = (group: number, i: number) =>
  `00000000-0000-4000-8000-${String(group * 1000 + i).padStart(12, "0")}`;
async function seed() {
  const password = requiredEnv("SEED_PASSWORD");
  if (password.length < 8 || Buffer.byteLength(password) > 72)
    throw new Error("SEED_PASSWORD must be 8–72 bytes");
  const passwordHash = await bcrypt.hash(password, 12);
  const users = [
    ["admin@citypulse.local", "Анна Смирнова", "ADMIN"],
    ["user@citypulse.local", "Алексей Иванов", "USER"],
    ["user2@citypulse.local", "Мария Петрова", "USER"],
  ] as const;
  const savedUsers = [];
  for (const [email, name, role] of users)
    savedUsers.push(
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, name, role, passwordHash },
      }),
    );
  const locations: [string, string, IncidentType, number, number][] = [
    ["Ремонт водопровода", "ул. Тверская, 18", "UTILITY", 55.765, 37.605],
    [
      "Ограничение движения",
      "Садовая-Кудринская ул., 5",
      "ROAD_WORK",
      55.761,
      37.583,
    ],
    ["ДТП на перекрёстке", "ул. Новый Арбат, 22", "ACCIDENT", 55.752, 37.587],
    [
      "Неисправность освещения",
      "Чистопрудный бульвар, 12",
      "UTILITY",
      55.763,
      37.643,
    ],
    [
      "Ограждение опасного участка",
      "ул. Покровка, 27",
      "SAFETY",
      55.761,
      37.651,
    ],
    [
      "Замена дорожного покрытия",
      "ул. Большая Якиманка, 24",
      "ROAD_WORK",
      55.733,
      37.613,
    ],
    [
      "Плановое отключение воды",
      "ул. Малая Дмитровка, 8",
      "UTILITY",
      55.768,
      37.608,
    ],
    [
      "Упавшая ветка на тротуаре",
      "Гоголевский бульвар, 10",
      "OTHER",
      55.745,
      37.599,
    ],
    [
      "Повреждение ограждения",
      "Крымская набережная, 10",
      "SAFETY",
      55.735,
      37.606,
    ],
    ["ДТП у остановки", "ул. Земляной Вал, 33", "ACCIDENT", 55.757, 37.658],
    [
      "Ремонт трамвайных путей",
      "Новокузнецкая ул., 20",
      "ROAD_WORK",
      55.738,
      37.633,
    ],
    [
      "Восстановлено теплоснабжение",
      "ул. Солянка, 7",
      "UTILITY",
      55.752,
      37.638,
    ],
  ];
  for (const [
    i,
    [title, address, type, latitude, longitude],
  ] of locations.entries()) {
    const status: IncidentStatus =
      i > 9 ? "RESOLVED" : i % 3 === 0 ? "IN_PROGRESS" : "ACTIVE";
    await prisma.incident.upsert({
      where: { id: id(1, i) },
      update: {},
      create: {
        id: id(1, i),
        title,
        address,
        type,
        latitude,
        longitude,
        status,
        description: `${title}. Городская служба уведомлена, участок находится под наблюдением. Данные учебного прототипа.`,
        createdAt: new Date(Date.now() - i * 3600000),
      },
    });
  }
  for (let i = 0; i < 5; i++) {
    const [title, address, category, latitude, longitude] = locations[i];
    await prisma.report.upsert({
      where: { id: id(2, i) },
      update: {},
      create: {
        id: id(2, i),
        userId: savedUsers[1 + (i % 2)].id,
        title: i === 0 ? "Не работает уличное освещение" : title,
        address,
        category,
        latitude,
        longitude,
        description:
          "Прошу проверить состояние городской инфраструктуры по указанному адресу и сообщить о результате.",
        status: i === 4 ? "RESOLVED" : i === 2 ? "IN_PROGRESS" : "OPEN",
      },
    });
  }
  const routes: [string, TransportType, string, string][] = [
    ["М1", "BUS", "Белорусский вокзал", "Парк культуры"],
    ["А", "TRAM", "Чистые пруды", "Калужская площадь"],
    ["Б", "BUS", "Смоленская площадь", "Курский вокзал"],
    ["Т1", "TROLLEYBUS", "Тверская застава", "Китай-город"],
    ["С9", "BUS", "Лубянка", "Павелецкий вокзал"],
  ];
  for (const [i, [name, type, startPoint, endPoint]] of routes.entries()) {
    await prisma.route.upsert({
      where: { id: id(3, i) },
      update: {},
      create: { id: id(3, i), name, type, startPoint, endPoint },
    });
    for (let j = 0; j < 3; j++)
      await prisma.vehicle.upsert({
        where: { number: `${100 + i}-${j + 1}` },
        update: {},
        create: {
          id: id(4, i * 3 + j),
          routeId: id(3, i),
          number: `${100 + i}-${j + 1}`,
          latitude: 55.741 + i * 0.006,
          longitude: 37.593 + j * 0.018 + i * 0.003,
          speed: j === 0 ? 0 : 18 + i * 3,
          status: j === 0 ? "STOPPED" : "ACTIVE",
        },
      });
  }
  console.log(
    "Seed completed: 3 users, 12 incidents, 5 reports, 5 routes, 15 vehicles. Existing data preserved.",
  );
}
seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
