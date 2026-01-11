import { IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CreateParentDto {
  @IsInt()
  userId: number;   // existing user ID

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
