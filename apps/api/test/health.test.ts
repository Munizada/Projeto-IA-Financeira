import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module.js";
import { DatabaseService, type DatabaseClient } from "../src/database/database.service.js";
import { applyAppConfig } from "../src/main.js";
import { createDatabaseMock } from "./test-helpers.js";

describe("GET /api/v1/health", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(DatabaseService)
      .useValue(new DatabaseService(createDatabaseMock() as unknown as DatabaseClient))
      .compile();

    app = moduleRef.createNestApplication();
    applyAppConfig(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns service status ok", async () => {
    const response = await request(app.getHttpServer()).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      service: "ia-financeira-api",
      status: "ok"
    });
  });
});
