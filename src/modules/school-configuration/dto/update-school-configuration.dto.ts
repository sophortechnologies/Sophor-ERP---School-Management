import { PartialType } from '@nestjs/swagger';
import { CreateSchoolConfigurationDto } from './create-school-configuration.dto';

export class UpdateSchoolConfigurationDto extends PartialType(CreateSchoolConfigurationDto) {}