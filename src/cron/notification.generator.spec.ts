import { Test, TestingModule } from '@nestjs/testing';
import { NotificationGeneratorCron } from './notification.generator.cron';
import { ConfigModule } from '../config/config.module';
import { Event } from '../domain/entities/event.entity';
import * as faker from 'faker';
import { Subscription } from '../domain/entities/subscriber.entity';
import { Message } from '../domain/entities/message.entity';
import { Connection, getConnection, IsNull, MoreThan, MoreThanOrEqual, Not } from 'typeorm';
import { NotificationRepository } from '../repository/notification.repository';
import { SubscriptionRepository } from '../repository/subscription.repository';
import { HttpModule } from '@nestjs/common';

describe('CronService', () => {
  let service: NotificationGeneratorCron;
  let connection: Connection;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [NotificationGeneratorCron],
    }).compile();

    service = module.get<NotificationGeneratorCron>(NotificationGeneratorCron);
    connection = getConnection();
  });

  it('Test that notifications are created', async () => {
    for (let i = 0; i < 20; i++) {
      let event = new Event();
      event.topic = faker.random.uuid();
      await event.save().then(event => {
        const sub = new Subscription();
        sub.webHook = faker.internet.url();
        sub.event = event;
        return sub.save().then(_ => {
          let msg = new Message();
          msg.data = faker.random.uuid();
          msg.event = event;
          return msg.save();
        });
      });
    }

    return service.createNotification().then(_ => {
      return connection
        .getCustomRepository(NotificationRepository)
        .count().then(count => {
          expect(count).toEqual(20);
        });
    });
  });

  it('Test that notifications cannot be recreated for subscriptions after messages', async () => {
    return connection.getCustomRepository(NotificationRepository).count().then(counter => {
      let event = new Event();
      event.topic = faker.random.uuid();
      return event.save().then(event => {
        let message = new Message();
        message.event = event;
        message.data = faker.random.alphaNumeric();
        return message.save().then(_ => {
          let subscription = new Subscription();
          subscription.webHook = faker.internet.url();
          subscription.event = event;
          return subscription.save();
        });
      }).then(_ => {
        return service.createNotification()
          .then(() => {
            return connection
              .getCustomRepository(NotificationRepository)
              .count().then(count => {
                expect(count).toEqual(count);
              });
          });

      });
    });

  });

  afterAll(() => {
    connection.close();
  });


});
