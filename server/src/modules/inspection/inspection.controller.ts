import { Controller, Get, Post, Body } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Controller('inspection')
export class InspectionController {
  // 获取巡检记录列表
  @Get('list')
  async getList() {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('equipment_inspections')
      .select('id, equipment_name, status, remark, inspector, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('获取巡检记录列表失败:', error);
      throw new Error(`获取列表失败: ${error.message}`);
    }
    
    return { code: 200, msg: 'success', data: { inspections: data || [] } };
  }

  // 获取待巡检数量
  @Get('pending-count')
  async getPendingCount() {
    const client = getSupabaseClient();
    const { count, error } = await client
      .from('equipment_inspections')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    if (error) {
      console.error('获取待巡检数量失败:', error);
      throw new Error(`获取数量失败: ${error.message}`);
    }
    
    return { code: 200, msg: 'success', data: { count: count || 0 } };
  }

  // 获取最近巡检记录
  @Get('recent')
  async getRecent() {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('equipment_inspections')
      .select('id, equipment_name, status, inspector, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('获取最近巡检记录失败:', error);
      throw new Error(`获取记录失败: ${error.message}`);
    }
    
    return { code: 200, msg: 'success', data: { inspections: data || [] } };
  }

  // 新增巡检记录
  @Post('add')
  async add(@Body() body: {
    equipment_name: string;
    status: 'normal' | 'pending' | 'fault';
    remark?: string;
    inspector: string;
  }) {
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('equipment_inspections')
      .insert({
        equipment_name: body.equipment_name,
        status: body.status,
        remark: body.remark || '',
        inspector: body.inspector,
      })
      .select()
      .single();
    
    if (error) {
      console.error('新增巡检记录失败:', error);
      throw new Error(`新增记录失败: ${error.message}`);
    }
    
    return { code: 200, msg: '新增成功', data: { inspection: data } };
  }

  // 获取巡检详情
  @Post('detail')
  async getDetail(@Body() body: { id: number }) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('equipment_inspections')
      .select('id, equipment_name, status, remark, inspector, created_at')
      .eq('id', body.id)
      .maybeSingle();
    
    if (error) {
      console.error('获取巡检详情失败:', error);
      throw new Error(`获取详情失败: ${error.message}`);
    }
    
    if (!data) {
      return { code: 404, msg: '记录不存在', data: null };
    }
    
    return { code: 200, msg: 'success', data: { inspection: data } };
  }
}
