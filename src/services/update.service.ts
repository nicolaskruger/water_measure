import { Injectable } from '@nestjs/common';

export type WaterInfo = {
  image: string;
  customer_code: string;
  measure_datetime: string;
  mesure_type: 'WATER' | 'GAS';
};

export type WaterResponse = {
  image_url: string;
  measure_value: number;
  measure_uuid: string;
};

@Injectable()
export class UploadService {
  async update(info: WaterInfo): Promise<WaterResponse> {
    return {
      image_url: 'url',
      measure_value: 10,
      measure_uuid: '123',
    };
  }
}
