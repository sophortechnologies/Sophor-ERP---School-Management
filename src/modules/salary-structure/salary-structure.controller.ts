import { Controller } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiConsumes,
  ApiQuery,
  ApiBody 
} from '@nestjs/swagger';
@ApiTags('Salaryt Structure')
@Controller('salary-structure')
export class SalaryStructureController {}
