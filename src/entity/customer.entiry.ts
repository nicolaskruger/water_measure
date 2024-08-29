import { Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { MeasureEntity } from './measure.entity';

@Entity()
export class CustomerEntity {
  @PrimaryColumn()
  customer_code: string;
  @OneToMany(() => MeasureEntity, (mesure) => mesure.customer)
  measures: MeasureEntity[];
}
