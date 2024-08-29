import { Inject } from '@nestjs/common';
import { MeasureEntity } from '../entity/measure.entity';
import { WaterInfo, WaterResponse } from '../services/upload.service';
import { DataSource, Like, Repository } from 'typeorm';

export type Measure = Pick<WaterResponse, 'image_url' | 'measure_value'>;

export type MeasureCreate = Pick<
  WaterInfo,
  'measure_datetime' | 'measure_type' | 'customer_code'
> & { image_url: string };

export class MeasureRepository {
  private repo: Repository<MeasureEntity>;
  constructor(@Inject() dataSource: DataSource) {
    this.repo = dataSource.getRepository(MeasureEntity);
  }
  public async isDoubleReport({
    customer_code,
    measure_datetime,
    measure_type,
  }: Omit<WaterInfo, 'image'>) {
    const [year, month] = measure_datetime.split('-');
    const { length } = await this.repo.find({
      where: {
        customer: { customer_code: customer_code },
        measure_datetime: Like(`%${year}-${month}%`),
        measure_type: measure_type,
      },
    });
    return length >= 1;
  }
  public async measure(image: string) {
    return { image_url: '', measure_value: 0 } as Measure;
  }

  public async create(
    measure: MeasureCreate,
  ): Promise<Pick<WaterResponse, 'image_url' | 'measure_uuid'>> {
    const { customer_code, ...query } = measure;
    const result = this.repo.create({
      ...query,
      has_confirmed: false,
      customer: { customer_code },
    });
    await this.repo.save(result);
    return {
      image_url: result.image_url,
      measure_uuid: result.measure_uuid,
    };
  }
}
