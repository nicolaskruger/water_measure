import { MeasureType, UploadService, WaterInfo } from './upload.service';
import * as fs from 'fs';
import { CustomerRepository } from 'src/repository/customer.repository';
import { Measure, MeasureRepository } from 'src/repository/measure.repository';

const validImage = fs.readFileSync('./src/services/imageBase64').toString();
const valideDateTime = '2015-06-22T13:17:21+0000';
const validType: MeasureType = 'WATER';

const validInfo: WaterInfo = {
  customer_code: 'nintendo',
  image: validImage,
  measure_datetime: valideDateTime,
  measure_type: validType,
};

describe('update service', () => {
  let updateService: UploadService = null;
  const mockCustomerRepository = jest.mocked({} as CustomerRepository);
  const mockMeasureRepository = jest.mocked({} as MeasureRepository);
  beforeEach(() => {
    mockCustomerRepository.create = jest.fn();
    mockCustomerRepository.has = jest.fn();
    mockMeasureRepository.create = jest.fn();
    mockMeasureRepository.isDoubleReport = jest.fn();
    mockMeasureRepository.measure = jest.fn();
    mockMeasureRepository.measure.mockReturnValue(
      new Promise((res) =>
        res({
          image_url: '123',
          measure_value: 1,
        } as Measure),
      ),
    );
    updateService = new UploadService(
      mockCustomerRepository,
      mockMeasureRepository,
    );
  });
  test('valid', async () => {
    await updateService.update(validInfo);
  });
  test('invalid base64', async () => {
    const image = '';
    try {
      await updateService.update({ image } as WaterInfo);
    } catch (error) {
      expect(error).toStrictEqual({
        error_description: 'invalid image format',
        code: 400,
        error_code: 'INVALID_DATA',
      });
    }
  });

  test('invalid date-time', async () => {
    try {
      await updateService.update({
        image: validImage,
        measure_datetime: '',
      } as WaterInfo);
    } catch (error) {
      expect(error).toStrictEqual({
        error_description: 'invalid measure datetime',
        code: 400,
        error_code: 'INVALID_DATA',
      });
    }
  });

  test('invalid type', async () => {
    try {
      await updateService.update({
        image: validImage,
        measure_datetime: valideDateTime,
      } as WaterInfo);
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toStrictEqual({
        error_description: 'invalid measure type',
        code: 400,
        error_code: 'INVALID_DATA',
      });
    }
  });

  test('call create customer', async () => {
    mockCustomerRepository.has.mockReturnValue(new Promise((res) => res(true)));
    await updateService.update(validInfo);
    expect(mockCustomerRepository.create.mock.calls.length).toBe(1);
  });

  test('not call create customer', async () => {
    mockCustomerRepository.has.mockReturnValue(
      new Promise((res) => res(false)),
    );
    await updateService.update(validInfo);
    expect(mockCustomerRepository.create.mock.calls.length).toBe(0);
  });

  test('double report error', async () => {
    mockMeasureRepository.isDoubleReport.mockReturnValue(
      new Promise((res) => res(true)),
    );
    try {
      await updateService.update(validInfo);
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toStrictEqual({
        code: 409,
        error_code: 'DOUBLE_REPORT',
        error_description: '"Leitura do mês já realizada',
      });
    }
  });
  test('success ', async () => {
    await updateService.update(validInfo);
    expect(mockMeasureRepository.create).toHaveBeenCalled();
  });
});
