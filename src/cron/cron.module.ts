import { HttpModule, Module } from '@nestjs/common';
import { NotificationGeneratorCron } from './notification.generator.cron';
import { ConfigModule } from '../config/config.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotifierCron } from './notifier.cron';

@Module({
  imports: [
    ConfigModule, ScheduleModule.forRoot(), HttpModule,
  ],
  providers: [NotificationGeneratorCron, NotifierCron],
})
export class CronModule {
}
