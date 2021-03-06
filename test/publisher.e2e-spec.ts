import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as faker from 'faker';
import { ValidatorTransformerPipe } from '../src/core/transfomer/validator.transformer';
import { Connection, getConnection } from 'typeorm';
import { EventRepository } from '../src/repository/event.repository';
import { MessageRepository } from '../src/repository/message.repository';
import { Event } from '../src/domain/entities/event.entity';
import { NotificationGeneratorCron } from '../src/cron/notification.generator.cron';
import { NotifierCron } from '../src/cron/notifier.cron';

describe('Publisher requests Test (e2e)', () => {
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


  afterEach(async () => {
    await connection.close();
    await app.close();
  });

  it('test event returns 200 when created', () => {
    const url = `/publish/${faker.random.alphaNumeric(10)}`;
    const payload = {
      message: faker.random.uuid(),
    };
    return request(app.getHttpServer())
      .post(url)
      .send(payload)
      .expect(201);
  });

  it('Test that a event is persisted after request', () => {
    const topic = faker.random.alphaNumeric(10);
    const url = `/publish/${topic}`;
    const payload = {
      message: faker.random.uuid(),
    };
    return request(app.getHttpServer())
      .post(url)
      .send(payload)
      .expect(201)
      .then(() => {
        return connection.getCustomRepository(EventRepository)
          .findOne({ topic })
          .then(ev => {
            expect(ev).toBeDefined();
            return ev;
          }).then(ev => {
            return connection
              .getCustomRepository(MessageRepository)
              .findByEvent(ev)
              .then(msg => {
                expect(msg.length).toEqual(1);
                const message = msg[0];
                expect(message.data).toEqual(JSON.stringify(payload));
              });
          });
      });
  });

  it('Test a new topic over rides existing one', () => {
    const event = new Event();
    event.topic = faker.random.uuid();
    event.save();
    const url = `/publish/${event.topic}`;
    const payload = {
      message: faker.random.uuid(),
    };
    return request(app.getHttpServer())
      .post(url)
      .send(payload)
      .expect(201)
      .then(() => {
        return connection
          .getCustomRepository(EventRepository)
          .count({
            topic: event.topic,
          }).then(eventCount => {
            expect(eventCount).toEqual(1);
          });
      });
  });
});
