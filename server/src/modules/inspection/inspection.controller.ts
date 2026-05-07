import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { InspectionService } from './inspection.service';

@Controller('inspection')
export class InspectionController {
  constructor(private readonly inspectionService: InspectionService) {}

  // 获取器械列表（按区域分组）
  @Get('equipment-list')
  async getEquipmentList() {
    const data = await this.inspectionService.getEquipmentList();
    return { code: 200, msg: 'success', data };
  }

  // 初始化默认器械
  @Post('init-equipment')
  async initEquipment() {
    const result = await this.inspectionService.initDefaultEquipment();
    return { code: 200, msg: 'success', data: result };
  }

  // 获取巡检记录列表
  @Get('list')
  async getList(@Query('area') area?: string, @Query('status') status?: string) {
    const data = await this.inspectionService.getInspectionList(area, status);
    return { code: 200, msg: 'success', data: { inspections: data } };
  }

  // 获取待巡检器械
  @Get('pending-equipment')
  async getPendingEquipment() {
    const data = await this.inspectionService.getPendingInspections();
    return { code: 200, msg: 'success', data: { inspections: data } };
  }

  // 获取未巡检的器械
  @Get('uninspected')
  async getUninspected() {
    const data = await this.inspectionService.getUninspectedEquipment();
    return { code: 200, msg: 'success', data: { equipment: data } };
  }

  // 获取最近巡检记录
  @Get('recent')
  async getRecent(@Query('limit') limit?: string) {
    const data = await this.inspectionService.getRecentInspections(
      limit ? parseInt(limit, 10) : 5
    );
    return { code: 200, msg: 'success', data: { inspections: data } };
  }

  // 获取统计数据
  @Get('stats')
  async getStats() {
    const data = await this.inspectionService.getStats();
    return { code: 200, msg: 'success', data };
  }

  // 获取待巡检数量（待维修+故障）
  @Get('pending-count')
  async getPendingCount() {
    const data = await this.inspectionService.getStats();
    return { code: 200, msg: 'success', data: { count: data.pending } };
  }

  // 新增巡检记录
  @Post('add')
  async add(@Body() body: {
    equipment_name: string;
    equipment_id?: number;
    area: string;
    status: 'normal' | 'pending' | 'fault';
    remark?: string;
    inspector: string;
  }) {
    const data = await this.inspectionService.addInspection(body);
    return { code: 200, msg: 'success', data };
  }

  // 获取巡检详情
  @Get('detail/:id')
  async getDetail(@Param('id') id: string) {
    const data = await this.inspectionService.getInspectionDetail(parseInt(id, 10));
    return { code: 200, msg: 'success', data };
  }

  // 更新巡检状态
  @Post('update-status/:id')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string }
  ) {
    const data = await this.inspectionService.updateInspectionStatus(
      parseInt(id, 10),
      body.status
    );
    return { code: 200, msg: 'success', data };
  }
}
