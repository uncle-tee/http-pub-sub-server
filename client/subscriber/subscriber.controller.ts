import { Body, Controller, Post, Req } from '@nestjs/common';
import { json, Request } from 'express';

@Controller()
export class SubscriberController {

  @Post('/event')
  event(@Req() request: Request) {
    console.log(request.body);
    return 'Ok';
  }
}