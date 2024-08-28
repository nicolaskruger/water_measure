import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { CustomerRepository } from 'src/repository/customer.repository';

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
  error_code: 'INVALID_DATA' | 'DOUBLE_REPORT';
  error_description: string;
  code: number;
};

function isBase64(str: string) {
  if (str === '' || str.trim() === '') {
    return false;
  }
  try {
    return btoa(atob(str)) == str;
  } catch (error) {
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

@Injectable()
export class UploadService {
  private readonly customerRepository: CustomerRepository;
  constructor(customerRepository: CustomerRepository) {
    this.customerRepository = customerRepository;
  }
  private validadeInfo(info: WaterInfo) {
    const { image, measure_datetime, measure_type } = info;

    const error: ErrorInfo = {
      error_description: '',
      code: 400,
      error_code: 'INVALID_DATA',
    };

    (
      [
        [isBase64(image), 'invalid image format'],
        [isDateTime(measure_datetime), 'invalid measure datetime'],
        [isMeasureType(measure_type), 'invalid measure type'],
      ] as [boolean, string][]
    ).forEach(([valid, msg]) => {
      if (!valid) {
        error.error_description = msg;
        throw error;
      }
    });
  }
  private async checkCustomer(code: string) {
    const has = await this.customerRepository.has(code);
    if (has) await this.customerRepository.create(code);
  }
  async update(info: WaterInfo): Promise<WaterResponse> {
    this.validadeInfo(info);
    const { customer_code } = info;
    await this.checkCustomer(customer_code);
    return {
      image_url: 'url',
      measure_value: 10,
      measure_uuid: '123',
    };
  }
}
