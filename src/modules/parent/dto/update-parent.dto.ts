import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateParentDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
