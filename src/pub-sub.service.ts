import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventRepository } from './repository/event.repository';
import { Message } from './domain/entities/message.entity';
import { Subscription } from './domain/entities/subscriber.entity';
import { SubscriptionRepository } from './repository/subscription.repository';

@Injectable()
export class PubSubService {

  constructor(@InjectRepository(EventRepository) private readonly topicRepository: EventRepository,
              @InjectRepository(SubscriptionRepository) private readonly subscriptionRepository: SubscriptionRepository) {
  }

  publish(topic: string, data: any) {
    return this.topicRepository
      .findByEvent(topic)
      .then(event => {
        let message = new Message();
        message.event = event;
        message.data = JSON.stringify(data);
        return message.save().then(_ => Promise.resolve(event));
      });
  }

  subscribe(topic: string, callback: string) {
    return this.topicRepository
      .findByEvent(topic)
      .then(topic => {
        return this.subscriptionRepository
          .findByWebHook(callback)
          .then(subscription => {
            if (!subscription) {
              subscription = new Subscription();
              subscription.event = topic;
              subscription.webHook = callback;
              return subscription.save();
            }
            return subscription;
          });

      });
  }
}