import { EntityRepository, Repository } from 'typeorm';
import { Event } from '../domain/entities/event.entity';
import { Message } from '../domain/entities/message.entity';


@EntityRepository(Message)
export class MessageRepository extends Repository<Message> {

  findByEvent(event: Event) {
    return this.find({
      where: { event },
    });
  }
}
