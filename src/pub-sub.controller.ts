import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import { PubSubService } from './pub-sub.service';
import { SubscriberRequestDto } from './dto/subscriber.request.dto';
import { ResponseDto } from './dto/response.dto';
import { Request } from 'express';


@Controller()
export class PubSubController {
  constructor(private readonly pubSubService: PubSubService) {
  }

  @Post('publish/:topic')
  publish(@Param('topic') topic: string, @Req() request: Request) {
    return this.pubSubService
      .publish(topic, request.body)
      .then(message => {
        return Promise.resolve(new ResponseDto({ messageId: message.id }, 201));
      });
  }

  @Post('subscribe/:topic')
  subscribe(@Param('topic') topic: string, @Body() request: SubscriberRequestDto) {
    return this.pubSubService
      .subscribe(topic, request.url)
      .then(subscriber => {
        return Promise.resolve(new ResponseDto({ subscriberId: subscriber.id }, 201));
      });
  }
}
