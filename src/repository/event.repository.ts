import { EntityRepository, Repository } from 'typeorm';
import { Event } from '../domain/entities/event.entity';


@EntityRepository(Event)
export class EventRepository extends Repository<Event> {


  findByTopic(topic: string) {
    return this.findOne({ topic }).then(event => {
      if (!event) {
        event = new Event();
        event.topic = topic;
        return this.save(event);
      }
      return Promise.resolve(event);
    });
  }

}