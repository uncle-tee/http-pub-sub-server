import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventRepository } from './repository/event.repository';
import { Message } from './domain/entities/message.entity';
import { Subscription } from './domain/entities/subscriber.entity';
import { SubscriptionRepository } from './repository/subscription.repository';

@Injectable()
export class PubSubService {

  constructor(@InjectRepository(EventRepository) private readonly eventRepository: EventRepository,
              @InjectRepository(SubscriptionRepository) private readonly subscriptionRepository: SubscriptionRepository) {
  }

  publish(topic: string, data: any) {
    return this.eventRepository
      .findByTopic(topic)
      .then(event => {
        const message = new Message();
        message.event = event;
        message.data = JSON.stringify(data);
        return message.save();
      });
  }

  subscribe(topic: string, webhook: string) {
    return this.eventRepository
      .findByTopic(topic)
      .then(event => {
        return this.subscriptionRepository
          .findByWebHookAndEvent(webhook, event)
          .then(subscription => {
            if (!subscription) {
              subscription = new Subscription();
              subscription.event = event;
              subscription.webHook = webhook;
              return subscription.save();
            }
            return subscription;
          });

      });
  }
}