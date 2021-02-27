import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventRepository } from '../repository/event.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { Subscription } from '../domain/entities/subscriber.entity';
import { Message } from '../domain/entities/message.entity';
import { Notification } from '../domain/entities/notification.entity';
import { Event } from '../domain/entities/event.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionRepository } from '../repository/subscription.repository';
import { MessageRepository } from '../repository/message.repository';

@Injectable()
export class NotificationGeneratorCron implements OnApplicationBootstrap {

  IS_CRON_ACTIVE = false;

  constructor(private readonly connection: Connection) {
  }

  onApplicationBootstrap(): any {
  }

  @Cron('*/3 * * * * *')
  initNotificationCron() {
    if (!this.IS_CRON_ACTIVE) {
      this.IS_CRON_ACTIVE = true;
      return this.createNotification().then(_ => this.IS_CRON_ACTIVE = false);
    } else {
      return Promise.resolve(null);
    }

  }


  createNotification() {
    return this.connection.transaction(entityManager => {
      return entityManager.createQueryBuilder(Event, 'event')
        .innerJoin(Subscription, 'subscription', 'subscription.event = event.id')
        .innerJoin(Message, 'message', 'message.event = event.id')
        .leftJoin(Notification, 'notification', 'notification.subscription = subscription.id AND notification.message = message.id')
        .where('message.createdAt >= subscription.createdAt')
        .andWhere('notification.id IS NULL')
        .limit(30)
        .select(['subscription.id as subscription', 'message.id as message'])
        .getRawMany()
        .then(async (subscriptionMessages: { subscription, message }[]) => {
          const subscriptionIds = subscriptionMessages.map(subscriptionMessage => subscriptionMessage.subscription);
          const messagesIds = subscriptionMessages.map(subscriptionMessage => subscriptionMessage.message);
          const subscriptions = await entityManager.getCustomRepository(SubscriptionRepository).findByIds(subscriptionIds);
          const messages = await entityManager.getCustomRepository(MessageRepository).findByIds(messagesIds);
          const notificationPromise = subscriptions.map(subscription => {
            const message = messages.find(message => message.eventId === subscription.eventId);
            const notification = new Notification();
            notification.message = message;
            notification.subscription = subscription;
            return entityManager.save(notification);
          });
          await Promise.all(notificationPromise);
        });
    });
  }
}