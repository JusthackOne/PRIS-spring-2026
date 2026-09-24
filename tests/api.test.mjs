import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
config({ path: ".env" });
const base = process.env.TEST_API_URL ?? "http://localhost:3000/api";
const prisma = new PrismaClient();
const createdUsers = [];
const createdIncidents = [];
async function request(path, { token, method = "GET", data } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  return { status: response.status, data: await response.json() };
}
test("CityPulse: full API lifecycle and access boundaries", async (t) => {
  let userToken, secondToken, adminToken, reportId;
  const location = {
    title: "Не работает уличное освещение",
    description:
      "Вечером не включаются фонари у дома. Просим восстановить освещение.",
    address: "Москва, ул. Тверская, 18",
    latitude: 55.765,
    longitude: 37.605,
  };
  try {
    await t.test("anonymous and forged JWT requests are rejected", async () => {
      assert.equal((await request("/incidents")).status, 401);
      assert.equal(
        (await request("/reports", { token: "invalid.token.value" })).status,
        401,
      );
    });
    await t.test(
      "registration, login, duplicate email and safe user response",
      async () => {
        for (let i = 0; i < 2; i++) {
          const email = `api-${randomUUID()}@example.test`;
          const password = `Test-${randomUUID()}`;
          const result = await request("/auth/register", {
            method: "POST",
            data: { name: "Тестовый житель", email, password },
          });
          assert.equal(result.status, 201);
          const token = result.data.accessToken;
          const me = await request("/auth/me", { token });
          createdUsers.push(me.data.id);
          assert.equal(me.data.role, "USER");
          assert.equal(me.data.passwordHash, undefined);
          assert.equal(
            (
              await request("/auth/login", {
                method: "POST",
                data: { email, password },
              })
            ).status,
            200,
          );
          assert.equal(
            (
              await request("/auth/register", {
                method: "POST",
                data: { name: "Тест", email, password },
              })
            ).status,
            409,
          );
          assert.equal(
            (
              await request("/auth/login", {
                method: "POST",
                data: { email, password: "wrong-password" },
              })
            ).status,
            401,
          );
          if (i === 0) userToken = token;
          else secondToken = token;
        }
        const result = await request("/auth/login", {
          method: "POST",
          data: {
            email: "admin@citypulse.local",
            password: process.env.SEED_PASSWORD,
          },
        });
        assert.equal(result.status, 200);
        adminToken = result.data.accessToken;
      },
    );
    await t.test(
      "DTO validation rejects role injection, invalid enums, coordinates and nulls",
      async () => {
        assert.equal(
          (
            await request("/auth/register", {
              method: "POST",
              data: {
                name: "Test",
                email: "bad",
                password: "short",
                role: "ADMIN",
              },
            })
          ).status,
          400,
        );
        for (const extra of [
          { category: "INVALID" },
          { latitude: 91 },
          { longitude: -181 },
          { title: " " },
          { userId: createdUsers[1] },
          { status: "RESOLVED" },
          { latitude: "55.75" },
        ]) {
          assert.equal(
            (
              await request("/reports", {
                token: userToken,
                method: "POST",
                data: { ...location, category: "UTILITY", ...extra },
              })
            ).status,
            400,
          );
        }
        assert.equal(
          (await request("/incidents?type=WRONG", { token: userToken })).status,
          400,
        );
        assert.equal(
          (await request("/vehicles?routeId=wrong", { token: userToken }))
            .status,
          400,
        );
      },
    );
    await t.test("USER cannot access administrator operations", async () => {
      assert.equal(
        (await request("/dashboard/admin", { token: userToken })).status,
        403,
      );
      assert.equal(
        (
          await request("/incidents", {
            token: userToken,
            method: "POST",
            data: { ...location, type: "UTILITY", status: "ACTIVE" },
          })
        ).status,
        403,
      );
    });
    const before = (await request("/dashboard/stats", { token: userToken }))
      .data;
    await t.test(
      "resident creates OPEN report; other residents cannot read or modify it",
      async () => {
        const created = await request("/reports", {
          token: userToken,
          method: "POST",
          data: { ...location, category: "UTILITY" },
        });
        assert.equal(created.status, 201);
        assert.equal(created.data.status, "OPEN");
        reportId = created.data.id;
        assert.equal(
          (await request(`/reports/${reportId}`, { token: secondToken }))
            .status,
          404,
        );
        assert.equal(
          (
            await request(`/reports/${reportId}`, {
              token: userToken,
              method: "PATCH",
              data: { status: "RESOLVED" },
            })
          ).status,
          403,
        );
        for (const path of ["/reports", "/reports/my"]) {
          const own = await request(path, { token: userToken });
          assert.ok(own.data.some((report) => report.id === reportId));
          assert.ok(
            own.data.every((report) => report.userId === createdUsers[0]),
          );
          assert.ok(
            !(await request(path, { token: secondToken })).data.some(
              (report) => report.id === reportId,
            ),
          );
        }
        assert.equal(
          (await request("/dashboard/stats", { token: userToken })).data
            .openReports,
          before.openReports + 1,
        );
      },
    );
    await t.test(
      "admin sees report; OPEN → IN_PROGRESS → RESOLVED visible to owner and statistics",
      async () => {
        const all = await request("/reports", { token: adminToken });
        assert.ok(all.data.some((report) => report.id === reportId));
        assert.ok(
          all.data.every((report) => report.user.passwordHash === undefined),
        );
        for (const status of ["IN_PROGRESS", "RESOLVED"]) {
          const updated = await request(`/reports/${reportId}`, {
            token: adminToken,
            method: "PATCH",
            data: { status },
          });
          assert.equal(updated.status, 200);
          assert.equal(
            (await request(`/reports/${reportId}`, { token: userToken })).data
              .status,
            status,
          );
        }
        assert.equal(
          (await request("/dashboard/stats", { token: userToken })).data
            .openReports,
          before.openReports,
        );
        assert.equal(
          (
            await request(`/reports/${reportId}`, {
              token: adminToken,
              method: "PATCH",
              data: { title: "Forbidden change" },
            })
          ).status,
          400,
        );
      },
    );
    await t.test(
      "incident CRUD, combined filters, missing resources and role boundaries",
      async () => {
        const result = await request("/incidents", {
          token: adminToken,
          method: "POST",
          data: { ...location, type: "UTILITY", status: "ACTIVE" },
        });
        assert.equal(result.status, 201);
        const id = result.data.id;
        createdIncidents.push(id);
        assert.equal(
          (await request(`/incidents/${id}`, { token: userToken })).status,
          200,
        );
        assert.equal(
          (
            await request(`/incidents/${id}`, {
              token: userToken,
              method: "PATCH",
              data: { status: "RESOLVED" },
            })
          ).status,
          403,
        );
        assert.equal(
          (
            await request(`/incidents/${id}`, {
              token: userToken,
              method: "DELETE",
            })
          ).status,
          403,
        );
        assert.equal(
          (
            await request(`/incidents/${id}`, {
              token: adminToken,
              method: "PATCH",
              data: { title: null },
            })
          ).status,
          400,
        );
        const filtered = await request(
          "/incidents?type=UTILITY&status=ACTIVE",
          { token: userToken },
        );
        assert.ok(filtered.data.some((item) => item.id === id));
        assert.ok(
          filtered.data.every(
            (item) => item.type === "UTILITY" && item.status === "ACTIVE",
          ),
        );
        assert.equal(
          (
            await request(`/incidents/${id}`, {
              token: adminToken,
              method: "PATCH",
              data: { status: "RESOLVED" },
            })
          ).data.status,
          "RESOLVED",
        );
        assert.equal(
          (
            await request(`/incidents/${id}`, {
              token: adminToken,
              method: "DELETE",
            })
          ).status,
          200,
        );
        assert.equal(
          (await request(`/incidents/${id}`, { token: userToken })).status,
          404,
        );
      },
    );
    await t.test(
      "seed counts, transport filters, statistics and OpenAPI",
      async () => {
        const routes = (await request("/routes", { token: userToken })).data;
        assert.ok(routes.length >= 5);
        assert.ok(
          (await request("/vehicles", { token: userToken })).data.length >= 15,
        );
        assert.ok(
          (await request("/incidents", { token: userToken })).data.length >= 10,
        );
        const filtered = (
          await request(`/vehicles?routeId=${routes[0].id}`, {
            token: userToken,
          })
        ).data;
        assert.ok(filtered.length);
        assert.ok(filtered.every((v) => v.routeId === routes[0].id));
        assert.equal(
          (await request(`/routes/${routes[0].id}`, { token: userToken }))
            .status,
          200,
        );
        assert.equal(
          (await request(`/vehicles/${filtered[0].id}`, { token: userToken }))
            .status,
          200,
        );
        assert.equal(
          (await request(`/routes/${randomUUID()}`, { token: userToken }))
            .status,
          404,
        );
        const stats = (await request("/dashboard/admin", { token: adminToken }))
          .data;
        assert.ok(stats.users >= 3 && stats.reports >= 5);
        const docs = await request("/docs-json");
        assert.equal(docs.status, 200);
        assert.ok(docs.data.components.securitySchemes.bearer);
        assert.ok(docs.data.paths["/api/reports/{id}"]);
      },
    );
  } finally {
    await prisma.report.deleteMany({ where: { userId: { in: createdUsers } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUsers } } });
    await prisma.incident.deleteMany({
      where: { id: { in: createdIncidents } },
    });
    await prisma.$disconnect();
  }
});
