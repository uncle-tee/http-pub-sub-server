import { Body, Controller, Param, Post } from '@nestjs/common';
import { PubSubService } from './pub-sub.service';
import { PublisherRequestDto } from './dto/publisher.request.dto';
import { SubscriberRequestDto } from './dto/subscriber.request.dto';
import { ResponseDto } from './dto/response.dto';


@Controller()
export class PubSubController {
  constructor(private readonly pubSubService: PubSubService) {
  }

  @Post('publish/:topic')
  publish(@Param('topic') topic: string, @Body() request: PublisherRequestDto) {
    return this.pubSubService
      .publish(topic, request.message)
      .then(event => {
        return Promise.resolve(new ResponseDto({ eventId: event.id }, 201));
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