import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadService } from './services/upload.service';
import { CustomerRepository } from './repository/customer.repository';
import { MeasureRepository } from './repository/measure.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from './entity/customer.entiry';
import { MeasureEntity } from './entity/measure.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '0.0.0.0',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [CustomerEntity, MeasureEntity],
      synchronize: true,
      autoLoadEntities: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, UploadService, CustomerRepository, MeasureRepository],
})
export class AppModule {}
