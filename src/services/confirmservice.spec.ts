import { MeasureRepository } from 'src/repository/measure.repository';
import { ConfirmService } from './confirm.service';
import { ErrorInfo } from './upload.service';
import { MeasureEntity } from 'src/entity/measure.entity';

describe('confirm', () => {
  let confirmService: ConfirmService = null;
  const mockRepo = jest.mocked({} as MeasureRepository);
  beforeEach(() => {
    mockRepo.findById = jest.fn();
    mockRepo.has = jest.fn();
    mockRepo.confirm = jest.fn();
    confirmService = new ConfirmService(mockRepo);
  });
  test('not an integer', async () => {
    try {
      await confirmService.confirm({ confirmed_value: 0.1 });
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toStrictEqual({
        code: 400,
        error_code: 'INVALID_DATA',
        error_description: 'confirmed value is not an integer',
      } as ErrorInfo);
    }
  });
  test('miss uuid', async () => {
    try {
      await confirmService.confirm({ confirmed_value: 1 });
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toStrictEqual({
        code: 400,
        error_code: 'INVALID_DATA',
        error_description: 'miss measure uuid',
      } as ErrorInfo);
    }
  });
  test('miss uuid', async () => {
    try {
      await confirmService.confirm({ confirmed_value: -1 });
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toStrictEqual({
        code: 400,
        error_code: 'INVALID_DATA',
        error_description: 'confirmed value is negative',
      } as ErrorInfo);
    }
  });
  test("don't has this measure", async () => {
    try {
      mockRepo.has.mockReturnValue(new Promise((res) => res(false)));
      await confirmService.confirm({ confirmed_value: 1, measure_uuid: 'has' });
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toStrictEqual({
        code: 404,
        error_code: 'MEASURE_NOT_FOUND',
        error_description: 'measure not found',
      } as ErrorInfo);
    }
  });

  test('double confirmed', async () => {
    try {
      mockRepo.has.mockReturnValue(new Promise((res) => res(true)));
      mockRepo.findById.mockReturnValue(
        new Promise((res) => res({ has_confirmed: true } as MeasureEntity)),
      );
      await confirmService.confirm({ confirmed_value: 1, measure_uuid: 'has' });
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toStrictEqual({
        code: 409,
        error_code: 'CONFIRMATION_DUPLICATE',
        error_description: 'confirmation duplicate',
      } as ErrorInfo);
    }
  });

  test('success', async () => {
    try {
      mockRepo.has.mockReturnValue(new Promise((res) => res(true)));
      mockRepo.findById.mockReturnValue(
        new Promise((res) => res({ has_confirmed: false } as MeasureEntity)),
      );
      await confirmService.confirm({ confirmed_value: 1, measure_uuid: 'has' });
      const [[measure]] = mockRepo.confirm.mock.calls;
      expect(measure).toStrictEqual({
        has_confirmed: false,
        measure_value: 1,
      } as MeasureEntity);
    } catch (error) {
      expect(true).toBe(false);
    }
  });
});
