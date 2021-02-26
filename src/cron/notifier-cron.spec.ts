import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { ConfigModule } from '../config/config.module';
import { Connection, getConnection } from 'typeorm';
import { NotifierCron } from './notifier.cron';
import { Event } from '../domain/entities/event.entity';
import { Subscription } from '../domain/entities/subscriber.entity';
import { Message } from '../domain/entities/message.entity';
import { Notification } from '../domain/entities/notification.entity';
import { HttpModule, HttpService } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { DeliveryStatus } from '../domain/enums/delivery.status.enum';

function mockNotification() {
  let event = new Event();
  event.topic = faker.random.uuid();
  return event.save().then(event => {
    let subscription = new Subscription();
    subscription.event = event;
    subscription.webHook = faker.internet.url();
    return subscription.save().then(subscription => {
      let message = new Message();
      message.data = faker.random.alphaNumeric();
      message.event = event;
      return message.save().then(message => {
        return Promise.resolve({ message, subscription });
      });
    });
  });
}

describe('CronService', () => {
  let service: NotifierCron;
  let connection: Connection;
  let httpService: HttpService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, HttpModule],
      providers: [NotifierCron],
    }).compile();

    service = module.get<NotifierCron>(NotifierCron);
    httpService = module.get<HttpService>(HttpService);
    connection = getConnection();
  });


  it('Test that notification can be sent successfully', () => {
    let httpResponse = {
      info: faker.internet.url(),
    };
    const data: AxiosResponse = {
      config: undefined, data: httpResponse, headers: undefined, status: 200, statusText: '',
    };
    let spyInstance = jest.spyOn(httpService, 'post').mockReturnValue(of(data));
    return mockNotification()
      .then(_ => {
        let noti = new Notification();
        noti.subscription = _.subscription;
        noti.message = _.message;
        return noti.save().then(_ => {
          return service.notify().then(notifications => {
            let notification = notifications[0];
            expect(notification.deliveryStatus).toEqual(DeliveryStatus.DELIVERED);
            expect(notification.responseCode).toEqual(200);
            expect(notification.numberOfAttempt).toEqual(1);
            spyInstance.mockRestore();
          });
        });
      });
  });

  it('test notification will not send when it reaches its maximum limit', function() {
    let httpResponse = {
      info: faker.internet.url(),
    };
    const data: AxiosResponse = {
      config: undefined, data: httpResponse, headers: undefined, status: 404, statusText: '',
    };
    let spyInstance = jest.spyOn(httpService, 'post').mockReturnValue(throwError({ response: data }));
    return mockNotification()
      .then(_ => {
        let notification = new Notification();
        notification.message = _.message;
        notification.subscription = _.subscription;
        notification.responseCode = 500;
        notification.numberOfAttempt = 4;
        return notification.save().then(_ => {
          return service.notify().then(notifications => {
            let notification = notifications[0];
            expect(notification.responseCode).toEqual(404);
            expect(notification.deliveryStatus).toEqual(DeliveryStatus.FAILED);
            expect(notification.numberOfAttempt).toEqual(5);
            spyInstance.mockRestore();
          });
        });
      });
  });

  afterAll(() => {
    connection.close();
  });


});
