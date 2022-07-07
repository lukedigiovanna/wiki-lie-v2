import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initSocket } from './socket';
const cors = require('cors');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  initSocket(app.getHttpServer());
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
  }));
  await app.listen(4000);
}
bootstrap();
