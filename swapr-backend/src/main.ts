import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { configureApp } from './configure-app.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
    bodyParser: false,
  });
  app.enableShutdownHooks();
  configureApp(app);
  await app.listen(process.env.PORT ?? 4000);
}
await bootstrap();
