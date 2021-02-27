import { EntityRepository, Repository } from 'typeorm';
import { Subscription } from '../domain/entities/subscriber.entity';
import { Event } from '../domain/entities/event.entity';


@EntityRepository(Subscription)
export class SubscriptionRepository extends Repository<Subscription> {

  findByWebHook(webHook: string) {
    return this.findOne({ webHook });
  }


  findByWebHookAndEvent(webHook: string, event: Event) {
    return this.findOne({
      webHook, event,
    });
  }
}