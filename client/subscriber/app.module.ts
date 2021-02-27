import { Module } from '@nestjs/common';
import { SubscriberController } from './subscriber.controller';

@Module({
  imports: [],
  controllers: [SubscriberController],
  providers: [],
})
export class AppModule {
}
