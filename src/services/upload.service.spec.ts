import { UploadService, WaterInfo } from './upload.service';
import * as fs from 'fs';

describe('update service', () => {
  let updateService: UploadService = null;

  beforeEach(() => {
    updateService = new UploadService();
  });
  test('valid base64', async () => {
    const image = fs.readFileSync('./src/services/imageBase64').toString();
    await updateService.update({ image } as WaterInfo);
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
});
