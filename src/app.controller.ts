import { Body, Controller, Get, Patch, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { ErrorInfo, UploadService, WaterInfo } from './services/upload.service';
import { Confirme, ConfirmService } from './services/confirm.service';

const exe = async <T>(func: () => Promise<T>, res: Response) => {
  try {
    const result = await func();
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    const { code, ...info } = error as ErrorInfo;
    return res.status(code).json(info);
  }
};

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly uploadService: UploadService,
    private readonly confirmeService: ConfirmService,
  ) {}

  @Post('/upload')
  async upload(@Body() waterInfo: WaterInfo, @Res() res: Response) {
    exe(() => this.uploadService.update(waterInfo), res);
  }

  @Patch('/confirm')
  async confirm(@Body() conf: Confirme, @Res() res: Response) {
    exe(() => this.confirmeService.confirm(conf), res);
  }
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
