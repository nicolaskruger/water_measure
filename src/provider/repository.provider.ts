import { CustomerEntity } from 'src/entity/customer.entiry';
import { MeasureEntity } from 'src/entity/measure.entity';
import { DataSource } from 'typeorm';

export const repositoryProvider = [
  {
    provide: 'CUSTOMER_PROVIDER',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CustomerEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'MEASURE_PROVIDER',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(MeasureEntity),
    inject: ['DATA_SOURCE'],
  },
];
