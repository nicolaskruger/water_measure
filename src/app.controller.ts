import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { UploadService, WaterInfo } from './services/upload.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  async upload(@Body() waterInfo: WaterInfo, @Res() res: Response) {
    res.status(HttpStatus.OK).json(await this.uploadService.update(waterInfo));
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
