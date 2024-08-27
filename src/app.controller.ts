import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

type WaterInfo = {
  image: string;
  customer_code: string;
  measure_datetime: string;
  mesure_type: 'WATER' | 'GAS';
};

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  async upload(@Body() waterInfo: WaterInfo, @Res() res: Response) {
    res.status(HttpStatus.OK).json(waterInfo);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
