import { Module } from '@nestjs/common';
import { PubSubController } from './pub-sub.controller';
import { ConfigModule } from './config/config.module';
import { PubSubService } from './pub-sub.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventRepository } from './repository/event.repository';
import { SubscriptionRepository } from './repository/subscription.repository';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTransformer } from './core/transfomer/response.transformer';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([EventRepository, SubscriptionRepository])],
  controllers: [PubSubController],
  providers: [PubSubService,
    ResponseTransformer,
    {

      provide: APP_INTERCEPTOR,
      useExisting: ResponseTransformer,
    }],
})
export class AppModule {
}
