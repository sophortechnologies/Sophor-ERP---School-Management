import { Module } from '@nestjs/common';
import { BillConfigService } from './bill-config.service';
import { BillConfigController } from './bill-config.controller';

@Module({
  controllers: [BillConfigController],
  providers: [BillConfigService],
})
export class BillConfigModule {}
