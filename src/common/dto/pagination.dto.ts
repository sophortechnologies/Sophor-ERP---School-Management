import { ApiPropertyOptional } from '@nestjs/swagger'; 
import { Type } from 'class-transformer'; 
import { IsInt, IsOptional, Min, Max } from 'class-validator'; 
/** 
* Base Pagination DTO 
* Used for list endpoints with pagination 
*/ 
export class PaginationDto { 
@ApiPropertyOptional({ default: 1, minimum: 1 }) 
@Type(() => Number) 
@IsInt() 
@Min(1) 
@IsOptional() 
page: number = 1; 
@ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 }) 
@Type(() => Number) 
@IsInt() 
@Min(1) 
@Max(100) 
@IsOptional() 
limit: number = 20; 
@ApiPropertyOptional() 
@IsOptional() 
sortBy?: string; 
@ApiPropertyOptional({ enum: ['ASC', 'DESC'] }) 
@IsOptional() 
sortOrder?: 'ASC' | 'DESC' = 'ASC'; 
} 
