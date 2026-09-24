import { test, expect } from "@playwright/test";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
config({ path: ".env" });
const prisma = new PrismaClient();
test.afterAll(async () => {
  await prisma.$disconnect();
});
test("resident report is processed by admin; map, CRUD, transport and mobile work", async ({
  page,
  browser,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  async function login(target: typeof page, email: string) {
    await target.goto("/login");
    await target.getByLabel("Электронная почта").fill(email);
    await target
      .getByLabel("Пароль", { exact: false })
      .fill(process.env.SEED_PASSWORD!);
    await target.getByRole("button", { name: "Войти", exact: true }).click();
    await expect(
      target.getByRole("heading", { name: "Обзор города", exact: true }),
    ).toBeVisible();
  }
  const title = `Проверка освещения ${Date.now()}`;
  const incidentTitle = `Проверка инцидента ${Date.now()}`;
  const adminContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const admin = await adminContext.newPage();
  admin.on("pageerror", (error) => errors.push(error.message));
  admin.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  try {
    await login(page, "user@citypulse.local");
    await expect(page.locator(".leaflet-container")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Последние события" }),
    ).toBeVisible();
    await page.screenshot({ path: ".local/dashboard.png", fullPage: true });
    await expect(
      page.getByRole("link", { name: "Администрирование", exact: true }),
    ).toHaveCount(0);
    await page.getByRole("link", { name: "Сообщить о проблеме" }).click();
    await page.getByLabel("Название").fill(title);
    await page
      .getByLabel("Описание")
      .fill("Не работают фонари рядом с домом. Просим восстановить освещение.");
    await page.getByLabel("Адрес").fill("Москва, Тверская улица, 18");
    await page.getByRole("button", { name: "Отправить обращение" }).click();
    await expect(
      page.getByRole("heading", { name: "Мои обращения" }),
    ).toBeVisible();
    await page.getByRole("link", { name: title, exact: true }).click();
    const reportUrl = page.url();
    await expect(page.getByText("Открыто", { exact: true })).toBeVisible();
    await login(admin, "admin@citypulse.local");
    await admin.goto(reportUrl);
    await admin.getByRole("button", { name: "В работе", exact: true }).click();
    await expect(
      admin.getByRole("button", { name: "В работе", exact: true }),
    ).toBeDisabled();
    await page.reload();
    await expect(page.getByText("В работе", { exact: true })).toBeVisible();
    await admin.getByRole("button", { name: "Решено", exact: true }).click();
    await expect(
      admin.getByRole("button", { name: "Решено", exact: true }),
    ).toBeDisabled();
    await page.reload();
    await expect(page.getByText("Решено", { exact: true })).toBeVisible();
    await admin.getByRole("link", { name: "Инциденты", exact: true }).click();
    await admin.getByRole("button", { name: "Создать инцидент" }).click();
    await admin.getByLabel("Название").fill(incidentTitle);
    await admin
      .getByLabel("Описание")
      .fill("Проверка создания городского события через интерфейс.");
    await admin.getByLabel("Адрес").fill("Москва, Тверская, 18");
    await admin.getByRole("button", { name: "Сохранить инцидент" }).click();
    await expect(admin.getByText(incidentTitle, { exact: true })).toBeVisible();
    await admin
      .getByRole("button", {
        name: `Редактировать: ${incidentTitle}`,
        exact: true,
      })
      .click();
    await admin
      .getByLabel("Статус", { exact: false })
      .last()
      .selectOption("RESOLVED");
    await admin.getByRole("button", { name: "Сохранить инцидент" }).click();
    await expect(
      admin
        .getByRole("row")
        .filter({ hasText: incidentTitle })
        .getByText("Решено"),
    ).toBeVisible();
    await admin
      .getByRole("button", { name: `Удалить: ${incidentTitle}`, exact: true })
      .click();
    await admin
      .getByRole("alertdialog")
      .getByRole("button", { name: "Удалить", exact: true })
      .click();
    await expect(admin.getByText(incidentTitle, { exact: true })).toHaveCount(
      0,
    );
    await page.getByRole("link", { name: "Карта города", exact: true }).click();
    await page.getByRole("button", { name: "Транспорт", exact: true }).click();
    await expect(
      page.getByText("0 инцидентов · 15 транспортных средств"),
    ).toBeVisible();
    await page.locator(".leaflet-interactive").first().click();
    await expect(page.locator(".leaflet-popup")).toBeVisible();
    await page.getByRole("link", { name: "Транспорт", exact: true }).click();
    await page.getByRole("button", { name: /М1 Автобус/ }).click();
    await expect(page.locator("tbody tr")).toHaveCount(3);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Открыть меню" }).click();
    await page.getByRole("link", { name: "Обзор города", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Обзор города", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".leaflet-container")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    await page.screenshot({ path: ".local/mobile.png", fullPage: true });
    expect(errors).toEqual([]);
  } finally {
    await adminContext.close();
    await prisma.report.deleteMany({ where: { title } });
    await prisma.incident.deleteMany({ where: { title: incidentTitle } });
  }
});
