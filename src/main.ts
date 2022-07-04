import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initSocket } from './socket';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  initSocket(app.getHttpServer());
  await app.listen(4000);
}
bootstrap();
