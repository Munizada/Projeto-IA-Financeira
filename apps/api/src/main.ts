import "reflect-metadata";

import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { pathToFileURL } from "node:url";

import { AppModule } from "./app.module.js";
import { ApiErrorFilter } from "./common/errors/api-error.filter.js";
import { getEnv } from "./config/env.js";

export function applyAppConfig(app: INestApplication): INestApplication {
  app.setGlobalPrefix("api/v1");
  app.useGlobalFilters(new ApiErrorFilter());

  return app;
}

export async function configureApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);

  return applyAppConfig(app);
}

export async function bootstrap(): Promise<void> {
  const env = getEnv();
  const app = await configureApp();

  await app.listen(env.API_PORT);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  void bootstrap();
}
