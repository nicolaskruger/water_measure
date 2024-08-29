import { Inject, Injectable } from '@nestjs/common';
import { CustomerEntity } from '../entity/customer.entiry';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CustomerRepository {
  private repo: Repository<CustomerEntity>;
  constructor(@Inject() dataSource: DataSource) {
    this.repo = dataSource.getRepository(CustomerEntity);
  }
  public async has(code: string): Promise<boolean> {
    const { length } = await this.repo.find({ where: { customer_code: code } });
    return length === 1;
  }
  public async create(code: string) {
    await this.repo.save(this.repo.create({ customer_code: code }));
  }
}
