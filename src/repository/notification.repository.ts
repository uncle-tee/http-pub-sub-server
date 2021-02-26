import { EntityRepository, Repository } from 'typeorm';
import { Message } from '../domain/entities/message.entity';
import { Notification } from '../domain/entities/notification.entity';

@EntityRepository(Notification)
export class NotificationRepository extends Repository<Notification> {

}