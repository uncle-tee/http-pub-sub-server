import { NestFactory } from '@nestjs/core';
import * as config from 'config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || config.get('subscriber.port');
  await app.listen(port).then(() => {
    process.stdout.write(`Pub sub listening on port ${port}`);
  });
}

bootstrap();
