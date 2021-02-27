import { INestApplication } from '@nestjs/common';
import { Connection, getConnection } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ValidatorTransformerPipe } from '../src/core/transfomer/validator.transformer';
import { SubscriberRequestDto } from '../src/dto/subscriber.request.dto';
import * as faker from 'faker';
import * as request from 'supertest';
import { SubscriptionRepository } from '../src/repository/subscription.repository';
import { NotificationGeneratorCron } from '../src/cron/notification.generator.cron';
import { NotifierCron } from '../src/cron/notifier.cron';
import { Event } from '../src/domain/entities/event.entity';
import { Subscription } from '../src/domain/entities/subscriber.entity';


describe('Subscriber e2e', () => {

  let app: INestApplication;
  let connection: Connection;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).overrideProvider(NotificationGeneratorCron)
      .useValue({
        createNotification: jest.fn().mockImplementation(() => Promise.resolve()),
      }).overrideProvider(NotifierCron)
      .useValue({
        notify: jest.fn().mockImplementation(() => Promise.resolve()),
      }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidatorTransformerPipe());
    await app.init();
    connection = getConnection();
  });


  it('test that creating a subscriber returns 201', () => {
    const payload: SubscriberRequestDto = {
      url: `${faker.internet.url()}/webhook`,
    };
    const url = `/subscribe/${faker.random.uuid()}`;
    return request(app.getHttpServer())
      .post(url)
      .send(payload)
      .expect(201);
  });

  it('Test that a subscriber is created after request', () => {
    const payload: SubscriberRequestDto = {
      url: `http://localhost:4000/event`,
    };
    const url = `/subscribe/${faker.random.uuid()}`;
    return request(app.getHttpServer())
      .post(url)
      .send(payload)
      .expect(201)
      .then(response => {
        const data = response.body.data;
        return connection
          .getCustomRepository(SubscriptionRepository)
          .findOne({ id: data.subscriberId })
          .then(subscription => {
            expect(subscription.webHook).toEqual(payload.url);
          });
      });
  });

  it('Test that a subscriber with the same topic and event cannot be recreated', () => {
    const event = new Event();
    event.topic = faker.random.alphaNumeric();
    return event.save().then(event => {
      const subscription = new Subscription();
      subscription.event = event;
      subscription.webHook = faker.internet.url();
      return subscription.save().then(subscription => {
        const payload: SubscriberRequestDto = {
          url: subscription.webHook,
        };
        const url = `/subscribe/${event.topic}`;
        return request(app.getHttpServer())
          .post(url)
          .send(payload)
          .expect(201)
          .then(_ => {
            return getConnection()
              .getCustomRepository(SubscriptionRepository)
              .count({ webHook: subscription.webHook, event })
              .then(count => {
                expect(count).toEqual(1);
              });
          });
      });
    });
  });


  afterEach(() => {
    return connection.close().then(() => app.close());
  });
});