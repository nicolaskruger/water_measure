import { Injectable } from '@nestjs/common';
import { MeasureRepository } from '../repository/measure.repository';
import { ErrorInfo, valiData } from './upload.service';

export type Confirme = {
  measure_uuid: string;
  confirmed_value: number;
};

export type ConfirmeResponse = {
  success: boolean;
};

@Injectable()
export class ConfirmService {
  constructor(private measureRepository: MeasureRepository) {}

  private async checkMeasure(measure_uuid: string) {
    if (!(await this.measureRepository.has(measure_uuid)))
      throw {
        code: 404,
        error_code: 'MEASURE_NOT_FOUND',
        error_description: 'measure not found',
      } as ErrorInfo;
  }

  private async updateMeasure(conf: Confirme) {
    const { measure_uuid } = conf;
    const measure = await this.measureRepository.findById(measure_uuid);
    if (measure.has_confirmed)
      throw {
        code: 409,
        error_code: 'CONFIRMATION_DUPLICATE',
        error_description: 'confirmation duplicate',
      } as ErrorInfo;
    measure.measure_value = conf.confirmed_value;
    this.measureRepository.confirm(measure);
  }

  async confirm(conf: Partial<Confirme>): Promise<ConfirmeResponse> {
    const { measure_uuid } = conf;
    valiData(
      [
        Number.isInteger(conf.confirmed_value),
        'confirmed value is not an integer',
      ],
      [conf.confirmed_value > 0, 'confirmed value is negative'],
      [!!conf.measure_uuid, 'miss measure uuid'],
    );
    await this.checkMeasure(measure_uuid);
    await this.updateMeasure(conf as Confirme);
    return { success: true };
  }
}
