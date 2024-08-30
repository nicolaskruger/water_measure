import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { CustomerRepository } from '../repository/customer.repository';
import { MeasureRepository } from '../repository/measure.repository';

export type MeasureType = 'WATER' | 'GAS';

export type WaterInfo = {
  image: string;
  customer_code: string;
  measure_datetime: string;
  measure_type: MeasureType;
};

export type WaterResponse = {
  image_url: string;
  measure_value: number;
  measure_uuid: string;
};

export type ErrorInfo = {
  error_code:
    | 'INVALID_DATA'
    | 'DOUBLE_REPORT'
    | 'MEASURE_NOT_FOUND'
    | 'CONFIRMATION_DUPLICATE';
  error_description: string;
  code: number;
};

function isBase64(str: string) {
  if (typeof str !== 'string' || str === '' || str.trim() === '') {
    return false;
  }
  try {
    return btoa(atob(str)) == str;
  } catch (_) {
    return false;
  }
}

function isDateTime(date: string) {
  return moment(
    date,
    [moment.ISO_8601, 'MM/DD/YYYY  :)  HH*mm*ss'],
    true,
  ).isValid();
}

function isMeasureType(measure_type: MeasureType) {
  return (['WATER', 'GAS'] as MeasureType[]).includes(measure_type);
}

export function valiData(...valiDatas: [boolean, string][]) {
  const error: ErrorInfo = {
    error_description: '',
    code: 400,
    error_code: 'INVALID_DATA',
  };
  valiDatas.forEach(([valid, msg]) => {
    if (!valid) {
      error.error_description = msg;
      throw error;
    }
  });
}

@Injectable()
export class UploadService {
  private readonly customerRepository: CustomerRepository;
  private readonly measureRepository: MeasureRepository;
  constructor(
    customerRepository: CustomerRepository,
    measureRepository: MeasureRepository,
  ) {
    this.customerRepository = customerRepository;
    this.measureRepository = measureRepository;
  }
  private validadeInfo(info: WaterInfo) {
    const { image, measure_datetime, measure_type } = info;

    valiData(
      [isBase64(image), 'invalid image format'],
      [isDateTime(measure_datetime), 'invalid measure datetime'],
      [isMeasureType(measure_type), 'invalid measure type'],
    );
  }
  private async checkCustomer(code: string) {
    const has = await this.customerRepository.has(code);
    if (!has) await this.customerRepository.create(code);
  }
  private async checkMeasure(info: WaterInfo) {
    const doubleReport = await this.measureRepository.isDoubleReport(info);
    if (doubleReport)
      throw {
        code: 409,
        error_code: 'DOUBLE_REPORT',
        error_description: 'Leitura do mês já realizada',
      } as ErrorInfo;
  }

  private async createMeasure(info: WaterInfo): Promise<WaterResponse> {
    const measure = await this.measureRepository.measure(info.image);

    const response = await this.measureRepository.create({
      ...measure,
      ...info,
    });
    return { ...measure, ...response };
  }
  async update(info: WaterInfo): Promise<WaterResponse> {
    this.validadeInfo(info);
    const { customer_code } = info;
    await this.checkCustomer(customer_code);
    await this.checkMeasure(info);
    return await this.createMeasure(info);
  }
}
