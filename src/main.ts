import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as config from 'config';
import { ValidatorTransformerPipe } from './core/transfomer/validator.transformer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidatorTransformerPipe());
  const port = process.env.PORT || config.get('server.port');
  await app.listen(port).then(() => {
    process.stdout.write(`Pub sub listening on port ${port}`);
  });
}

bootstrap();
