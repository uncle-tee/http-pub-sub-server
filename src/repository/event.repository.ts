import { AbstractRepository, EntityRepository, Repository } from 'typeorm';
import { Event } from '../domain/entities/event.entity';
import { Subscription } from '../domain/entities/subscriber.entity';
import { Message } from '../domain/entities/message.entity';
import { Notification } from '../domain/entities/notification.entity';


@EntityRepository(Event)
export class EventRepository extends Repository<Event> {


  findByEvent(topic: string) {
    return this.findOne({ topic }).then(event => {
      if (!event) {
        event = new Event();
        event.topic = topic;
        return this.save(event);
      }
      return Promise.resolve(event);
    });
  }

  findPendingSubscriptionAndMessage(limit: number) {
    this.createQueryBuilder('event')
      .innerJoin(Subscription, 'subscription', 'subscription.event = event.id')
      .innerJoin(Message, 'message', 'message.event = event.id')
      .leftJoin(Notification, 'notification', 'notification.subscription = subscription.id AND notification.message = message.id')
      .where('m.createdAt >= subscription.createdAt')
      .andWhere('notification.id IS NULL')
      .limit()

  }
}