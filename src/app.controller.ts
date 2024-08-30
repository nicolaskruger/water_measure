import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import {
  ErrorInfo,
  MeasureType,
  UploadService,
  WaterInfo,
} from './services/upload.service';
import { Confirme, ConfirmService } from './services/confirm.service';
import { ListMeasureService } from './services/list-measure.service';

const exe = async <T>(func: () => Promise<T>, res: Response) => {
  try {
    const result = await func();
    return res.status(200).json(result);
  } catch (error) {
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
    private readonly listService: ListMeasureService,
  ) {}

  @Post('/upload')
  async upload(@Body() waterInfo: WaterInfo, @Res() res: Response) {
    exe(() => this.uploadService.update(waterInfo), res);
  }

  @Patch('/confirm')
  async confirm(@Body() conf: Confirme, @Res() res: Response) {
    exe(() => this.confirmeService.confirm(conf), res);
  }

  @Get('/:customer_code/list')
  async list(
    @Param('customer_code') customer_code: string,
    @Res() res: Response,
    @Query('measure_type') measure_type?: MeasureType,
  ) {
    exe(() => this.listService.list({ customer_code, measure_type }), res);
  }
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
