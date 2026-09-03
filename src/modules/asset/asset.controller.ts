// src/modules/asset/asset.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssignAssetDto } from './dto/assign-asset.dto';
import { TransferAssetDto } from './dto/transfer-asset.dto';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { DisposeAssetDto } from './dto/dispose-asset.dto';
import { AssetQueryDto } from './dto/asset-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Assets')
@ApiBearerAuth()
@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
@Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
@Permissions('asset:create')
create(@Body() dto: CreateAssetDto, @Req() req) {
  return this.assetService.createAssetWithBudget(dto, req.user.id);  // ← TO THIS
}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('asset:view')
  @ApiOperation({ summary: 'Get all assets' })
  @ApiResponse({ status: 200, description: 'List of assets' })
  findAll(@Query() query: AssetQueryDto) {
    return this.assetService.findAll(query);
  }

  @Get('dashboard/stats')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('asset:view')
  @ApiOperation({ summary: 'Get asset dashboard statistics' })
  getDashboardStats() {
    return this.assetService.getDashboardStats();
  }

  @Get('reports/register')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('asset:view')
  @ApiOperation({ summary: 'Get complete asset register report' })
  getAssetReport() {
    return this.assetService.getAssetReport();
  }

  @Get('maintenance/due')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('asset:view')
  @ApiOperation({ summary: 'Get assets due for maintenance' })
  getDueForMaintenance() {
    return this.assetService.getDueForMaintenance();
  }

  @Get('warranty/expiring')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('asset:view')
  @ApiOperation({ summary: 'Get assets with warranty expiring soon' })
  getWarrantyExpiringSoon() {
    return this.assetService.getWarrantyExpiringSoon();
  }

  @Get('tag/:assetTag')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STAFF')
  @Permissions('asset:view')
  @ApiOperation({ summary: 'Find asset by tag (barcode/QR)' })
  @ApiParam({ name: 'assetTag', description: 'Asset tag number' })
  findByTag(@Param('assetTag') assetTag: string) {
    return this.assetService.findByAssetTag(assetTag);
  }

@Get('user/:userId')
@Roles('SUPER_ADMIN', 'ADMIN')
@Permissions('asset:view')
@ApiOperation({ summary: 'Get assets assigned to a user' })
@ApiParam({ name: 'userId', type: Number })
getAssetsByUser(@Param('userId', ParseIntPipe) userId: number) {
  return this.assetService.getAssetsByUser(userId);
}

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'TEACHER', 'STAFF')
  @Permissions('asset:view')
  @ApiOperation({ summary: 'Get asset by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assetService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('asset:update')
  @ApiOperation({ summary: 'Update asset' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateAssetDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAssetDto, @Req() req) {
    return this.assetService.updateAsset(id, dto, req.user.id);
  }

  @Post(':id/assign')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('asset:assign')
  @ApiOperation({ summary: 'Assign asset to user/department' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: AssignAssetDto })
  assign(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignAssetDto, @Req() req) {
    return this.assetService.assignAsset(id, dto, req.user.id);
  }

  @Post(':id/return')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('asset:assign')
  @ApiOperation({ summary: 'Return asset from assignment' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ schema: { properties: { condition: { type: 'string' } } } })
  returnAsset(
    @Param('id', ParseIntPipe) id: number,
    @Body('condition') condition: string,
    @Req() req,
  ) {
    return this.assetService.returnAsset(id, condition, req.user.id);
  }

  @Post(':id/transfer')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('asset:assign')
  @ApiOperation({ summary: 'Transfer asset to another location/user' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: TransferAssetDto })
  transfer(@Param('id', ParseIntPipe) id: number, @Body() dto: TransferAssetDto, @Req() req) {
    return this.assetService.transferAsset(id, dto, req.user.id);
  }

  @Post(':id/maintenance')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('asset:maintain')
  @ApiOperation({ summary: 'Schedule maintenance for asset' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: CreateMaintenanceDto })
  scheduleMaintenance(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateMaintenanceDto,
    @Req() req,
  ) {
    return this.assetService.scheduleMaintenance(id, dto, req.user.id);
  }

  @Post(':id/dispose')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('asset:dispose')
  @ApiOperation({ summary: 'Dispose asset' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: DisposeAssetDto })
  dispose(@Param('id', ParseIntPipe) id: number, @Body() dto: DisposeAssetDto, @Req() req) {
    return this.assetService.disposeAsset(id, dto, req.user.id);
  }

  @Post('depreciation/monthly')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('asset:depreciate')
  @ApiOperation({ summary: 'Run monthly depreciation for all assets' })
  runMonthlyDepreciation() {
    return this.assetService.runMonthlyDepreciation();
  }

  @Get(':id/depreciation/schedule')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('asset:view')
  @ApiOperation({ summary: 'Get depreciation schedule for asset' })
  @ApiParam({ name: 'id', type: Number })
  getDepreciationSchedule(@Param('id', ParseIntPipe) id: number) {
    return this.assetService.findOne(id);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @Permissions('asset:delete')
  @ApiOperation({ summary: 'Delete asset (soft delete)' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.assetService.deleteAsset(id, req.user.id);
  }
}