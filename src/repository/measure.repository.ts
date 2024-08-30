import { Inject } from '@nestjs/common';
import { MeasureEntity } from '../entity/measure.entity';
import { WaterInfo, WaterResponse } from '../services/upload.service';
import { DataSource, Like, Repository } from 'typeorm';
import { ListMeasureQuery } from 'src/services/list-measure.service';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import * as fs from 'fs';

export type Measure = Pick<WaterResponse, 'image_url' | 'measure_value'>;

export type MeasureCreate = Pick<
  WaterInfo,
  'measure_datetime' | 'measure_type' | 'customer_code'
> &
  Measure;

export type ListMeasureResponse = {
  customer_code: string;
  measures: MeasureEntity[];
};

const prompt =
  "give me the water measure, if the value can't be found return 0";

export class MeasureRepository {
  private repo: Repository<MeasureEntity>;
  private model: GenerativeModel;
  private fileManager: GoogleAIFileManager;
  constructor(@Inject() dataSource: DataSource) {
    this.repo = dataSource.getRepository(MeasureEntity);
    this.model = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY,
    ).getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
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
  private base64ToFile(base64: string): string {
    const bstr = atob(base64);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    const path = `./bucket/${Math.random()}.png`;

    fs.writeFileSync(path, u8arr);

    return path;
  }
  public async measure(image: string) {
    const generateContent = await this.model.generateContent([
      prompt,
      { inlineData: { data: image, mimeType: 'image/png' } },
    ]);
    const path = this.base64ToFile(image);
    const uploadResponse = await this.fileManager.uploadFile(path, {
      mimeType: 'image/png',
    });
    let measure_value = Math.floor(Number(generateContent.response.text()));
    if (isNaN(measure_value)) measure_value = 0;
    return { image_url: uploadResponse.file.uri, measure_value } as Measure;
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

  public async has(measure_uuid: string) {
    return (await this.repo.findOne({ where: { measure_uuid } })) !== null;
  }

  public async findById(measure_uuid: string) {
    return await this.repo.findOne({ where: { measure_uuid } });
  }

  public async confirm(measure: MeasureEntity) {
    measure.has_confirmed = true;
    await this.repo.save(measure);
  }

  public async findByCustomerCode(
    query: ListMeasureQuery,
  ): Promise<ListMeasureResponse> {
    const { measure_type, customer_code } = query;
    let measures: MeasureEntity[] = [];
    if (measure_type) {
      measures = await this.repo.find({
        where: { customer: { customer_code }, measure_type },
      });
    } else {
      measures = await this.repo.find({
        where: { customer: { customer_code } },
      });
    }
    return {
      customer_code,
      measures,
    };
  }
}
