import { EntityRepository, Repository } from 'typeorm';;
import { Subscription } from '../domain/entities/subscriber.entity';


@EntityRepository(Subscription)
export class SubscriptionRepository extends Repository<Subscription> {

  findByWebHook(webHook: string) {
    return this.findOne({ webHook });
  }
}