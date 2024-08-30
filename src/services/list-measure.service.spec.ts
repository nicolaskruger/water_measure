import { CustomerRepository } from 'src/repository/customer.repository';
import {
  ListMeasureQuery,
  ListMeasureService,
  MEASURE_NOT_FOUND,
} from './list-measure.service';
import {
  ListMeasureResponse,
  MeasureRepository,
} from 'src/repository/measure.repository';
import { ErrorInfo, MeasureType } from './upload.service';
import { MeasureEntity } from 'src/entity/measure.entity';

describe('list measure service', () => {
  let service: ListMeasureService;
  const mockCustomerRepo = jest.mocked({} as CustomerRepository);
  const mockMeasureRepo = jest.mocked({} as MeasureRepository);
  beforeEach(() => {
    mockCustomerRepo.has = jest.fn();
    mockMeasureRepo.findByCustomerCode = jest.fn();
    service = new ListMeasureService(mockMeasureRepo, mockCustomerRepo);
  });
  test('invalid measure', async () => {
    try {
      await service.list({
        measure_type: 'none' as MeasureType,
      } as ListMeasureQuery);
      expect(false).toBe(true);
    } catch (error) {
      expect(error).toStrictEqual({
        code: 400,
        error_code: 'INVALID_DATA',
        error_description: 'invalid measure',
      } as ErrorInfo);
    }
  });
  test('miss customer code', async () => {
    try {
      await service.list({} as ListMeasureQuery);
      expect(false).toBe(true);
    } catch (error) {
      expect(error).toStrictEqual({
        code: 400,
        error_code: 'INVALID_DATA',
        error_description: 'miss customer code',
      } as ErrorInfo);
    }
  });

  test('customer not found', async () => {
    try {
      mockCustomerRepo.has.mockReturnValue(new Promise((res) => res(false)));
      await service.list({ customer_code: 'mac' } as ListMeasureQuery);
      expect(false).toBe(true);
    } catch (error) {
      expect(error).toStrictEqual(MEASURE_NOT_FOUND);
    }
  });

  test('no result found', async () => {
    try {
      const response: ListMeasureResponse = {
        customer_code: 'mac',
        measures: [],
      };
      mockCustomerRepo.has.mockReturnValue(new Promise((res) => res(true)));
      mockMeasureRepo.findByCustomerCode.mockReturnValue(
        new Promise((res) => res(response)),
      );
      await service.list({ customer_code: 'mac' } as ListMeasureQuery);
      expect(false).toBe(true);
    } catch (error) {
      expect(error).toStrictEqual(MEASURE_NOT_FOUND);
      expect(mockMeasureRepo.findByCustomerCode).toHaveBeenCalled();
    }
  });

  test('success', async () => {
    try {
      const response: ListMeasureResponse = {
        customer_code: 'mac',
        measures: [{} as MeasureEntity],
      };
      mockCustomerRepo.has.mockReturnValue(new Promise((res) => res(true)));
      mockMeasureRepo.findByCustomerCode.mockReturnValue(
        new Promise((res) => res(response)),
      );
      const result = await service.list({
        customer_code: 'mac',
      } as ListMeasureQuery);
      expect(mockMeasureRepo.findByCustomerCode).toHaveBeenCalled();
      expect(result).toStrictEqual(response);
    } catch (error) {
      expect(false).toBe(true);
    }
  });
});
