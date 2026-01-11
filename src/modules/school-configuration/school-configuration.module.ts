import { Module } from '@nestjs/common';
import { SchoolConfigurationController } from './school-configuration.controller';
import { SchoolConfigurationService } from './school-configuration.service';

@Module({
  controllers: [SchoolConfigurationController],
  providers: [SchoolConfigurationService],
  exports: [SchoolConfigurationService],
})
export class SchoolConfigurationModule {}
