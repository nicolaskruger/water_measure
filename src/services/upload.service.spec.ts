import { MeasureType, UploadService, WaterInfo } from './upload.service';
import * as fs from 'fs';
import { CustomerRepository } from 'src/repository/customer.repository';

const validImage = fs.readFileSync('./src/services/imageBase64').toString();
const valideDateTime = '2015-06-22T13:17:21+0000';
const validType: MeasureType = 'WATER';

describe('update service', () => {
  let updateService: UploadService = null;
  const mockCustomerRepository = jest.mocked({} as CustomerRepository);
  beforeEach(() => {
    mockCustomerRepository.create = jest.fn();
    mockCustomerRepository.has = jest.fn();
    updateService = new UploadService(mockCustomerRepository);
  });
  test('valid', async () => {
    await updateService.update({
      image: validImage,
      measure_datetime: valideDateTime,
      measure_type: validType,
    } as WaterInfo);
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
    } catch (error) {
      expect(error).toStrictEqual({
        error_description: 'invalid measure type',
        code: 400,
        error_code: 'INVALID_DATA',
      });
    }
  });
});
