import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfModule } from './conf/conf.module';

@Module({
  imports: [ConfModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
