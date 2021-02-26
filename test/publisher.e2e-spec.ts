import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as faker from 'faker';
import { PublisherRequestDto } from '../src/dto/publisher.request.dto';
import { ValidatorTransformerPipe } from '../src/core/transfomer/validator.transformer';
import { Connection, getConnection } from 'typeorm';
import { EventRepository } from '../src/repository/event.repository';
import { MessageRepository } from '../src/repository/message.repository';
import { Event } from '../src/domain/entities/event.entity';

describe('Publisher requests Test (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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
    const payload: PublisherRequestDto = {
      message: faker.random.uuid(),
    };
    return request(app.getHttpServer())
      .post(url)
      .send(payload)
      .expect(201);
  });

  it('Test that a event is persisted after request', () => {
    const url = `/publish/${faker.random.alphaNumeric(10)}`;
    const payload: PublisherRequestDto = {
      message: faker.random.uuid(),
    };
    return request(app.getHttpServer())
      .post(url)
      .send(payload)
      .expect(201)
      .then(response => {
        let data = response.body.data;
        return connection.getCustomRepository(EventRepository)
          .findOne({ id: data.eventId })
          .then(ev => {
            expect(ev).toBeDefined();
            return ev;
          }).then(ev => {
            return connection
              .getCustomRepository(MessageRepository)
              .findByEvent(ev)
              .then(msg => {
                expect(msg.length).toEqual(1);
                let message = msg[0];
                expect(message.data).toEqual(payload.message);
              });
          });
      });
  });

  it('Test a new topic over rides existing one', () => {
    let event = new Event();
    event.topic = faker.random.uuid();
    event.save();
    const url = `/publish/${event.topic}`;
    const payload: PublisherRequestDto = {
      message: faker.random.uuid(),
    };
    return request(app.getHttpServer())
      .post(url)
      .send(payload)
      .expect(201)
      .then(response => {
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
