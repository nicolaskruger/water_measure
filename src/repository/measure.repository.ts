import { WaterInfo, WaterResponse } from 'src/services/upload.service';

export type Measure = Pick<WaterResponse, 'image_url' | 'measure_value'>;

export type MeasureCreate = Pick<
  WaterInfo,
  'measure_datetime' | 'measure_type'
> & { image_url: string };

export class MeasureRepository {
  public async isDoubleReport({
    customer_code,
    measure_datetime,
    measure_type,
  }: Omit<WaterInfo, 'image'>) {
    return false;
  }
  public async measure(image: string) {
    return { image_url: '', measure_value: 0 } as Measure;
  }

  public async create(
    measure: MeasureCreate,
  ): Promise<Pick<WaterResponse, 'image_url' | 'measure_uuid'>> {
    return {
      image_url: measure.image_url,
      measure_uuid: '123',
    };
  }
}
