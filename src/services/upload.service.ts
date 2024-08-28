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

@Injectable()
export class UploadService {
  private validadeInfo(info: WaterInfo) {
    const { image } = info;

    const error: ErrorInfo = {
      error_description: '',
      code: 400,
      error_code: 'INVALID_DATA',
    };

    if (!isBase64(image)) {
      error.error_description = 'invalid image format';
      throw error;
    }
  }
  async update(info: WaterInfo): Promise<WaterResponse> {
    this.validadeInfo(info);
    return {
      image_url: 'url',
      measure_value: 10,
      measure_uuid: '123',
    };
  }
}
