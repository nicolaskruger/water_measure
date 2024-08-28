import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadService } from './services/upload.service';
import { CustomerRepository } from './repository/customer.repository';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, UploadService, CustomerRepository],
})
export class AppModule {}
