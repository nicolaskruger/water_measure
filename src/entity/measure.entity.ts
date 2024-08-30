import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CustomerEntity } from './customer.entiry';

@Entity()
export class MeasureEntity {
  @PrimaryGeneratedColumn('uuid')
  measure_uuid: string;
  @Column()
  measure_datetime: string;
  @Column()
  measure_type: string;
  @Column()
  has_confirmed: boolean;
  @Column()
  image_url: string;
  @Column()
  measure_value: number;
  @ManyToOne(() => CustomerEntity, (customer) => customer.measures)
  customer: CustomerEntity;
}
