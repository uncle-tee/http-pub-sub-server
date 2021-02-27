import { HttpService, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Connection, Equal, LessThanOrEqual, Not } from 'typeorm';
import { Notification } from '../domain/entities/notification.entity';
import { DeliveryStatus } from '../domain/enums/delivery.status.enum';
import { Cron } from '@nestjs/schedule';
import { Event } from '../domain/entities/event.entity';

@Injectable()
export class NotifierCron implements OnApplicationBootstrap {

  private IS_CRON_ACTIVE = false;

  constructor(private readonly connection: Connection,
              private readonly httpService: HttpService) {
  }

  onApplicationBootstrap(): any {
  }


  @Cron('*/5 * * * * *')
  initCron() {
    if (!this.IS_CRON_ACTIVE) {
      this.IS_CRON_ACTIVE = true;
      return this.notify()
        .then(_ => this.IS_CRON_ACTIVE = false)
        .catch(_ => this.IS_CRON_ACTIVE = false);
    }
    return Promise.resolve(undefined);
  }

  notify() {
    return this.connection.transaction(entityManager => {
      return entityManager.find<Notification>(Notification, {
        where: {
          numberOfAttempt: LessThanOrEqual(6),
          deliveryStatus: Not(Equal(DeliveryStatus.DELIVERED)),
        },
        take: 30,
      }).then(notifications => {
        let eventIds = notifications.map(notification => notification.message.eventId);
        return entityManager.findByIds(Event, eventIds).then(events => {
          let map = notifications.map(notification => {
            let topic = events.find(event => event.id === notification.message.eventId).topic;
            let webHook = notification.subscription.webHook;
            let data = notification.message.data;
            return this.httpService
              .post(webHook, { topic, data })
              .toPromise()
              .then(response => {
                notification.numberOfAttempt = Number(notification.numberOfAttempt) + 1;
                notification.deliveryStatus = DeliveryStatus.DELIVERED;
                notification.responseCode = response.status;
                notification.response = JSON.stringify(response.data);
                return notification.save();
              })
              .catch(err => {
                let response = err.response;
                notification.numberOfAttempt = response && response.data != null ? Number(notification.numberOfAttempt) + 1 : 7;
                notification.deliveryStatus = DeliveryStatus.FAILED;
                notification.response = response && response.data != null ? JSON.stringify(response.data) : JSON.stringify(err);
                notification.responseCode = response?.status ?? 404;
                return notification.save();
              });
          });
          return Promise.all(map);
        });

      });

    });
  }


}
