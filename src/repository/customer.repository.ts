import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomerRepository {
  public async has(code: string): Promise<boolean> {
    return true;
  }
  public async create(code: string) {}
}
