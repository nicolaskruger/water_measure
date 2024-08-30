import { Injectable } from '@nestjs/common';
import { ErrorInfo, MeasureType, valiData } from './upload.service';
import { MeasureRepository } from '../repository/measure.repository';
import { CustomerRepository } from '../repository/customer.repository';

export type ListMeasureQuery = {
  customer_code: string;
  measure_type?: MeasureType;
};

export const MEASURE_NOT_FOUND: ErrorInfo = {
  code: 404,
  error_code: 'MEASURES_NOT_FOUND',
  error_description: 'no read found',
};

@Injectable()
export class ListMeasureService {
  constructor(
    private measureRepo: MeasureRepository,
    private customerRepo: CustomerRepository,
  ) {}
  private async checkCustomer(customer_code: string) {
    const has = await this.customerRepo.has(customer_code);
    if (!has) throw MEASURE_NOT_FOUND;
  }

  private async find(query: ListMeasureQuery) {
    const result = await this.measureRepo.findByCustomerCode(query);
    if (result.measures.length === 0) throw MEASURE_NOT_FOUND;
    return result;
  }
  async list(query: Partial<ListMeasureQuery>) {
    const { customer_code, measure_type } = query;
    valiData(
      [
        !measure_type ||
          (['GAS', 'WATER'] as MeasureType[]).includes(measure_type),
        'invalid measure',
      ],
      [!!customer_code, 'miss customer code'],
    );
    await this.checkCustomer(customer_code);
    return this.find(query as ListMeasureQuery);
  }
}
