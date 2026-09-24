# CityPulse

Учебный MVP мониторинга городской инфраструктуры: инциденты, обращения жителей, транспорт, интерактивная карта Москвы и статистика из PostgreSQL.

## Быстрый запуск

Нужны Docker Engine / Docker Desktop с Compose v2 и Node.js 22 для генерации локального `.env`.

```sh
node scripts/setup-env.mjs
docker compose up --build
```

Скрипт создаёт `.env` со случайными паролями и JWT secret; существующий файл не перезаписывается. Вместо скрипта можно скопировать `.env.example` в `.env` и заменить значения самостоятельно. После настройки окружения приложение запускается одной командой `docker compose up --build`.

| Сервис | Адрес |
| --- | --- |
| Интерфейс | http://localhost:8080 |
| REST API | http://localhost:3000/api |
| Swagger с Bearer JWT | http://localhost:3000/api/docs |
| PostgreSQL с хоста | localhost:15432 |

Backend ждёт готовности PostgreSQL, применяет миграции и выполняет seed. Frontend запускается после успешной проверки backend. Данные сохраняются в Docker volume `citypulse_postgres_data`. `docker compose down` останавливает сервисы, сохраняя данные. Команда с `-v` удаляет базу — не используйте её для обычной остановки.

## Тестовые аккаунты

| Email | Роль |
| --- | --- |
| admin@citypulse.local | ADMIN |
| user@citypulse.local | USER |
| user2@citypulse.local | USER |

Пароль всех первоначально создаваемых аккаунтов — значение `SEED_PASSWORD` в вашем локальном `.env`. Пароли не зашиты в исходный код. В БД хранятся только bcrypt-хеши. Повторный seed сохраняет существующие записи, пароли и изменения статусов; изменение `SEED_PASSWORD` не сбрасывает пароли уже созданных аккаунтов.

Seed содержит 3 аккаунта, 12 инцидентов, 5 обращений, 5 маршрутов и 15 транспортных средств. Все события, маршруты (в том числе троллейбус) и координаты транспорта демонстрационные; они не описывают текущую транспортную сеть Москвы. Координаты транспорта статичны.

## Окружение

| Переменная | Назначение |
| --- | --- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Учётные данные контейнера PostgreSQL |
| `POSTGRES_PORT` | Порт PostgreSQL на хосте, по умолчанию 15432 |
| `DATABASE_URL` | Подключение для локального backend, Prisma и тестов |
| `JWT_SECRET` | Случайная строка от 32 символов |
| `SEED_PASSWORD` | Пароль первоначальных демоаккаунтов: минимум 8 символов, максимум 72 байта |
| `CORS_ORIGIN` | Разрешённые origins через запятую |
| `PORT` | Порт backend, по умолчанию 3000 |

В контейнере backend `DATABASE_URL` формируется Compose с hostname `postgres` и внутренним портом 5432. При изменении `POSTGRES_PORT` измените также порт в локальном `DATABASE_URL`. Для URL используйте пароль без специальных символов либо корректно закодируйте его. `.env` исключён из Git и Docker build context.

## Стек и архитектура

- Frontend: React 19, TypeScript strict, Vite, Tailwind CSS, shadcn/ui-паттерны и Radix primitives, TanStack Query, React Hook Form, Zod, React Router, Leaflet + OpenStreetMap, Recharts, Sonner, Lucide.
- Backend: NestJS 11, TypeScript strict, Prisma 6, PostgreSQL 16, JWT, bcrypt, class-validator, Swagger.
- Инфраструктура: Docker Compose, Nginx; без Redis, Kafka и WebSocket.

```text
backend/
  prisma/          # схема, SQL-миграция, идемпотентный seed
  src/
    auth/          # регистрация, вход, текущий пользователь
    users/         # создание и безопасная проекция пользователей
    incidents/     # фильтры и административный CRUD
    reports/       # владение обращениями, смена статуса
    transport/     # маршруты и транспорт
    dashboard/     # агрегаты и административная статистика
    prisma/        # общий сервис БД
    common/        # JWT/role guards, DTO, обработка ошибок, env
frontend/src/
  api/             # единственный HTTP-клиент и функции ресурсов
  components/      # layout, карта, состояния, UI primitives
  features/        # auth, incidents, reports, transport
  pages/           # обзор, карта, администрирование
  hooks/           # mutation, invalidation, toast
  types/           # контракты данных
  utils/           # подписи, даты, стили
tests/             # интеграционные API-тесты и сценарий Playwright
```

Backend — модульный монолит. Frontend получает данные исключительно через REST API. Все операции, кроме регистрации, входа и Swagger, требуют Bearer JWT. JWT действует 8 часов, хранится в `sessionStorage` текущей вкладки и удаляется при выходе/401. После входа вызывается `/auth/me`. Роль проверяется по актуальной записи БД при каждом запросе.

USER получает только свои обращения, в том числе при запросе по ID. Чужой ID возвращает 404. ADMIN получает все обращения и может менять их статус. Создание, изменение и удаление инцидентов защищены серверным role guard. Регистрация всегда создаёт USER; дополнительные поля вроде `role` отклоняются. DTO проверяют длины строк, enum и диапазоны координат; неизвестные поля запрещены.

Список и карточки обращения обновляются каждые 30 секунд и при возврате фокуса. После mutations кэш инвалидируется сразу. «Открытые обращения» — все обращения в статусах OPEN и IN_PROGRESS; «активные инциденты» — ACTIVE и IN_PROGRESS. Общегородские показатели доступны всем вошедшим пользователям, персональные данные чужих обращений — только ADMIN.

## Запуск без Docker

Нужны Node.js 22, npm 10+ и PostgreSQL 16+. Создайте БД и пользователя, затем настройте `.env`. Можно запустить только БД через `docker compose up -d postgres`.

Из корня проекта:

```sh
npm ci
node scripts/setup-env.mjs
npm run db:generate -w backend
npm run db:migrate -w backend
npm run db:seed -w backend
npm run dev:backend
```

В другом терминале:

```sh
npm run dev:frontend
```

Frontend: http://localhost:5173. Vite проксирует `/api` на localhost:3000. Backend dev сначала компилируется с decorator metadata, затем следит за изменениями TypeScript и перезапускает сервер. Для запуска скомпилированного backend: `npm run build -w backend`, затем `npm start -w backend`.

## Prisma

```sh
# Применение уже сохранённых миграций (без потери данных)
npm run db:migrate -w backend
# Повторный seed — не очищает и не перезаписывает данные
npm run db:seed -w backend
# После изменения schema.prisma, из каталога backend
node ../scripts/prisma.mjs migrate dev --name describe_change
```

В Docker миграции выполняются через `prisma migrate deploy`, без `db push` и без сброса БД. Начальная SQL-миграция хранится в репозитории.

## API

Полные DTO, поля фильтров и Bearer-авторизация доступны в Swagger. Получите `accessToken` через `/api/auth/login`, нажмите Authorize и вставьте токен.

| Метод и путь | Доступ |
| --- | --- |
| POST `/api/auth/register`, `/api/auth/login` | Все |
| GET `/api/auth/me` | USER, ADMIN |
| GET `/api/incidents`, `/api/incidents/:id` | USER, ADMIN |
| POST `/api/incidents`, PATCH/DELETE `/api/incidents/:id` | ADMIN |
| GET `/api/reports`, `/api/reports/my`, `/api/reports/:id` | Свои; ADMIN — все, `/my` — свои |
| POST `/api/reports` | USER, ADMIN |
| PATCH `/api/reports/:id` | ADMIN, только поле `status` |
| GET `/api/routes`, `/api/routes/:id` | USER, ADMIN |
| GET `/api/vehicles`, `/api/vehicles/:id` | USER, ADMIN |
| GET `/api/dashboard/stats` | USER, ADMIN |
| GET `/api/dashboard/admin` | ADMIN |

Фильтры: `/api/incidents?type=UTILITY&status=ACTIVE`, `/api/vehicles?routeId=<uuid>`.

## Проверка

```sh
npm run build
npm run lint
npm audit
# Нужны работающий backend, seeded БД и соответствующий .env
npm test
# Нужен полный Compose на localhost:8080
npx playwright install chromium
npx playwright test
```

API-тесты проверяют регистрацию, вход, JWT, role guard, отсутствие утечки passwordHash, изоляцию обращений, валидацию, CRUD, фильтры, транспорт, Swagger и изменение статистики при закрытии обращения. Playwright проверяет пользовательский сценарий в двух отдельных браузерных сессиях, модальные формы CRUD, карту, транспорт, мобильную навигацию и runtime-ошибки. Тестовые записи удаляются после выполнения; существующие записи seed не изменяются. Запускайте тесты на учебной БД.

Ручной сценарий: войти как USER → создать обращение → в другой сессии войти как ADMIN → открыть обращение → перевести в «В работе», затем «Решено» → проверить обновлённый статус у USER и число открытых обращений в обзоре.

## Ограничения MVP

Для загрузки тайлов OpenStreetMap нужен интернет. Без сети данные API и списки доступны, но подложка карты может не загрузиться. Нет реального GPS, интеграций с городскими службами, файловых вложений, восстановления пароля и push-уведомлений. Это локальный учебный прототип; публичное развёртывание не входит в ТЗ.

При реализации валидации и UI использованы официальные материалы [NestJS Validation](https://docs.nestjs.com/techniques/validation) и [shadcn/ui Button](https://ui.shadcn.com/docs/components/button).
