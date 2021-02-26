import { HttpService, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Connection, Equal, LessThanOrEqual, Not } from 'typeorm';
import { Notification } from '../domain/entities/notification.entity';
import { DeliveryStatus } from '../domain/enums/delivery.status.enum';
import { Cron } from '@nestjs/schedule';

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
      return this.notify().then(_ => this.IS_CRON_ACTIVE = false);
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
        let map = notifications.map(notification => {
          let webHook = notification.subscription.webHook;
          let data = notification.message.data;
          return this.httpService
            .post(webHook, data)
            .toPromise()
            .then(response => {
              notification.numberOfAttempt = Number(notification.numberOfAttempt) + 1;
              notification.deliveryStatus = DeliveryStatus.DELIVERED;
              notification.responseCode = response.status;
              notification.response = JSON.stringify(response.data);
              return notification.save();
            }).catch(err => {
              let response = err.response;
              notification.numberOfAttempt = Number(notification.numberOfAttempt) + 1;
              notification.deliveryStatus = DeliveryStatus.FAILED;
              notification.response = response?.data;
              notification.responseCode = response?.status;
              return notification.save();
            });
        });
        return Promise.all(map);
      });

    });
  }


}
