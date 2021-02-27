import { EntityRepository, Repository } from 'typeorm';
import { Notification } from '../domain/entities/notification.entity';

@EntityRepository(Notification)
export class NotificationRepository extends Repository<Notification> {

}