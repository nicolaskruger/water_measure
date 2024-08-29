import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { ErrorInfo, UploadService, WaterInfo } from './services/upload.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  async upload(@Body() waterInfo: WaterInfo, @Res() res: Response) {
    try {
      const measure = await this.uploadService.update(waterInfo);
      return res.status(200).json(measure);
    } catch (error) {
      const { code, ...info } = error as ErrorInfo;
      return res.status(code).json(info);
    }
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
