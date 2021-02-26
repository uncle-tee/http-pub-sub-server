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

describe('PubSubController (e2e)', () => {
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
              });
          });
      });
  });
});
