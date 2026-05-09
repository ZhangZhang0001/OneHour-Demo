import { Controller, Get, Post, Body, Param, Query, BadRequestException } from '@nestjs/common';
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
  async initEquipment(@Query('force') force?: string) {
    const result = await this.inspectionService.initDefaultEquipment(force === 'true');
    return { code: 200, msg: 'success', data: result };
  }

  // 获取巡检记录列表
  @Get('list')
  async getList(@Query('area') area?: string, @Query('status') status?: string) {
    const data = await this.inspectionService.getInspectionList(area, status);
    return { code: 200, msg: 'success', data: { inspections: data } };
  }

  // 获取今日巡检记录（用于器械巡检页面）
  @Get('today-list')
  async getTodayList(@Query('area') area?: string, @Query('status') status?: string) {
    const data = await this.inspectionService.getTodayInspectionList(area, status);
    return { code: 200, msg: 'success', data: { inspections: data } };
  }

  // 获取待巡检器械（有磨损+故障）
  @Get('pending-equipment')
  async getPendingEquipment() {
    const data = await this.inspectionService.getPendingInspections();
    return { code: 200, msg: 'success', data: { inspections: data } };
  }

  // 获取今天未巡检的器械
  @Get('today-uninspected')
  async getTodayUninspected() {
    const data = await this.inspectionService.getTodayUninspected();
    return { code: 200, msg: 'success', data: { equipment: data } };
  }

  // 获取今天未巡检数量
  @Get('today-uninspected-count')
  async getTodayUninspectedCount() {
    const data = await this.inspectionService.getTodayUninspectedCount();
    return { code: 200, msg: 'success', data };
  }

  // 每日重置巡检状态
  @Post('reset-daily')
  async resetDaily() {
    const data = await this.inspectionService.resetDailyInspection();
    return { code: 200, msg: 'success', data };
  }

  // 获取区域巡检进度
  @Get('area-progress')
  async getAreaProgress() {
    const data = await this.inspectionService.getAreaProgress();
    return { code: 200, msg: 'success', data };
  }

  // 获取未巡检的器械（兼容旧接口）
  @Get('uninspected')
  async getUninspected() {
    const data = await this.inspectionService.getTodayUninspected();
    return { code: 200, msg: 'success', data: { equipment: data } };
  }

  // 获取最近巡检记录（今天的）
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

  // 获取待巡检数量（有磨损+故障）
  @Get('pending-count')
  async getPendingCount() {
    const data = await this.inspectionService.getStats();
    return { code: 200, msg: 'success', data: { count: data.todayPending } };
  }

  // 新增巡检记录
  @Post('add')
  async add(@Body() body: {
    inspector: string;
    area: string;
    equipmentIds: number[];
    status: 'normal' | 'pending' | 'fault';
    remark?: string;
    wearLevel?: string;
  }) {
    // 验证输入
    if (!body.inspector) {
      throw new BadRequestException('请输入检查人姓名');
    }
    if (!body.equipmentIds || body.equipmentIds.length === 0) {
      throw new BadRequestException('请至少选择一个器械');
    }

    // 批量插入巡检记录
    const equipmentNames = await this.inspectionService.getEquipmentNamesByIds(body.equipmentIds);
    const result = await this.inspectionService.addInspection({
      equipmentIds: body.equipmentIds,
      equipmentNames,
      area: body.area,
      status: body.status,
      remark: body.remark,
      wearLevel: body.wearLevel,
      inspector: body.inspector,
    });

    return { code: 200, msg: 'success', data: { count: result } };
  }

  // 获取巡检详情
  @Get('detail/:id')
  async getDetail(@Param('id') id: string) {
    const data = await this.inspectionService.getInspectionDetail(parseInt(id, 10));
    return { code: 200, msg: 'success', data };
  }
}
