import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '../../storage/database/supabase-client';

@Injectable()
export class InspectionService {
  private get supabase() {
    return getSupabaseClient(); // 无参数时使用 service_role_key
  }

  // 获取器械列表（按区域分组）
  async getEquipmentList() {
    const result = await this.supabase
      .from('equipment_list')
      .select('*')
      .order('area')
      .order('name');
    
    // 按区域分组
    const grouped = {
      A: [] as any[],
      B: [] as any[],
      C: [] as any[],
    };
    
    if (result.data) {
      result.data.forEach((item: any) => {
        if (grouped[item.area]) {
          grouped[item.area].push(item);
        }
      });
    }
    
    return grouped;
  }

  // 添加器械
  async addEquipment(name: string, area: string) {
    const result = await this.supabase
      .from('equipment_list')
      .insert({ name, area })
      .select()
      .single();
    
    return result.data;
  }

  // 初始化默认器械
  async initDefaultEquipment() {
    const existing = await this.supabase
      .from('equipment_list')
      .select('id');
    
    // 如果已有数据则跳过
    if (existing.data && existing.data.length > 0) {
      return { success: true, message: '器械已存在' };
    }

    // 默认器械配置
    const defaultEquipment = [
      // A区器械（有氧区）
      { name: '跑步机 1号', area: 'A' },
      { name: '跑步机 2号', area: 'A' },
      { name: '跑步机 3号', area: 'A' },
      { name: '椭圆机 1号', area: 'A' },
      { name: '椭圆机 2号', area: 'A' },
      { name: '健身车 1号', area: 'A' },
      // B区器械（力量区）
      { name: '史密斯机 1号', area: 'B' },
      { name: '深蹲架 1号', area: 'B' },
      { name: '卧推架 1号', area: 'B' },
      { name: '蝴蝶机 1号', area: 'B' },
      { name: '划船机 1号', area: 'B' },
      { name: '龙门架 1号', area: 'B' },
      // C区器械（自由重量区）
      { name: '哑铃架 1号', area: 'C' },
      { name: '哑铃架 2号', area: 'C' },
      { name: '壶铃架 1号', area: 'C' },
      { name: '杠铃架 1号', area: 'C' },
      { name: '腹肌板 1号', area: 'C' },
      { name: '多功能训练架 1号', area: 'C' },
    ];

    const result = await this.supabase
      .from('equipment_list')
      .insert(defaultEquipment)
      .select();

    return { success: true, data: result.data };
  }

  // 获取巡检列表
  async getInspectionList(area?: string, status?: string) {
    let query = this.supabase
      .from('equipment_inspections')
      .select('*')
      .order('created_at', { ascending: false });

    if (area) {
      query = query.eq('area', area);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const result = await query;
    return result.data || [];
  }

  // 获取待处理巡检（待维修+故障）
  async getPendingInspections() {
    const result = await this.supabase
      .from('equipment_inspections')
      .select('*')
      .in('status', ['pending', 'fault'])
      .order('created_at', { ascending: false })
      .limit(20);
    
    return result.data || [];
  }

  // 获取未巡检的器械（巡检表中没有记录的器械）
  async getUninspectedEquipment() {
    // 获取所有已巡检的器械ID
    const inspectedResult = await this.supabase
      .from('equipment_inspections')
      .select('equipment_id');

    const inspectedIds = inspectedResult.data?.map(item => item.equipment_id).filter(Boolean) || [];

    // 获取所有器械
    const allEquipmentResult = await this.supabase
      .from('equipment_list')
      .select('*')
      .orderBy('area');

    // 过滤出未巡检的器械
    const uninspected = allEquipmentResult.data?.filter(
      item => !inspectedIds.includes(item.id)
    ) || [];

    return uninspected;
  }

  // 获取最近巡检记录
  async getRecentInspections(limit: number = 5) {
    const result = await this.supabase
      .from('equipment_inspections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return result.data || [];
  }

  // 获取统计数据
  async getStats() {
    const totalResult = await this.supabase
      .from('equipment_inspections')
      .select('id');

    const pendingResult = await this.supabase
      .from('equipment_inspections')
      .select('id')
      .in('status', ['pending', 'fault']);

    return {
      total: totalResult.data?.length || 0,
      pending: pendingResult.data?.length || 0,
    };
  }

  // 新增巡检记录
  async addInspection(data: {
    equipment_name: string;
    equipment_id?: number;
    area: string;
    status: string;
    remark?: string;
    inspector: string;
  }) {
    const result = await this.supabase
      .from('equipment_inspections')
      .insert({
        equipment_name: data.equipment_name,
        equipment_id: data.equipment_id,
        area: data.area,
        status: data.status,
        remark: data.remark || null,
        inspector: data.inspector,
      })
      .select()
      .single();
    
    return result.data;
  }

  // 获取巡检详情
  async getInspectionDetail(id: number) {
    const result = await this.supabase
      .from('equipment_inspections')
      .select('*')
      .eq('id', id)
      .single();
    
    return result.data;
  }

  // 更新巡检状态
  async updateInspectionStatus(id: number, status: string) {
    const result = await this.supabase
      .from('equipment_inspections')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    return result.data;
  }
}
