import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '../../storage/database/supabase-client';

@Injectable()
export class InspectionService {
  private get supabase() {
    return getSupabaseClient(); // 无参数时使用 service_role_key
  }

  // 获取当天日期 YYYY-MM-DD
  private getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
  async initDefaultEquipment(force = false) {
    // 如果 force=true，删除旧数据重新初始化
    if (force) {
      await this.supabase.from('equipment_list').delete().neq('id', 0);
    } else {
      const existing = await this.supabase
        .from('equipment_list')
        .select('id');
      
      // 如果已有数据则跳过
      if (existing.data && existing.data.length > 0) {
        return { success: true, message: '器械已存在，如需重置请使用 force=true' };
      }
    }

    // 默认器械配置（与前端保持一致，共29个）
    const defaultEquipment = [
      // A区器械（跑步机——龙门架）
      { name: '跑步机 1号', area: 'A' },
      { name: '跑步机 2号', area: 'A' },
      { name: '跑步机 3号', area: 'A' },
      { name: '跑步机 4号', area: 'A' },
      { name: '单车 1-4号', area: 'A' },
      { name: '辅助引体机', area: 'A' },
      { name: '划船机', area: 'A' },
      { name: '推肩器', area: 'A' },
      { name: '蝴蝶机', area: 'A' },
      { name: '龙门架+组件', area: 'A' },
      // B区器械（龙门架——私教区）
      { name: '海豹划船', area: 'B' },
      { name: '大剪刀', area: 'B' },
      { name: '反手高位下拉', area: 'B' },
      { name: '哈克深蹲机', area: 'B' },
      { name: '倒蹬机', area: 'B' },
      { name: '臀桥机', area: 'B' },
      { name: '罗马椅', area: 'B' },
      { name: '分动式划船器', area: 'B' },
      { name: '史密斯深蹲架', area: 'B' },
      { name: 'T杆划船', area: 'B' },
      { name: '犀牛蹲', area: 'B' },
      // C区器械（龙门架——私教区）
      { name: '哑铃架', area: 'C' },
      { name: '平板推胸', area: 'C' },
      { name: '斜板推胸', area: 'C' },
      { name: '髋外展机', area: 'C' },
      { name: '坐姿腿弯举', area: 'C' },
      { name: '坐姿腿屈伸', area: 'C' },
      { name: '推胸机', area: 'C' },
      { name: '高位下拉', area: 'C' },
    ];

    const result = await this.supabase
      .from('equipment_list')
      .insert(defaultEquipment)
      .select();

    return { success: true, message: `已初始化 ${defaultEquipment.length} 个器械`, data: result.data };
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

  // 根据ID列表获取器械名称
  async getEquipmentNamesByIds(ids: number[]): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('equipment_list')
      .select('name')
      .in('id', ids);

    if (error) {
      console.error('获取器械名称失败:', error);
      return [];
    }

    return (data || []).map(item => item.name);
  }

  // 添加巡检记录（支持批量）
  async addInspection(data: {
    equipmentIds: number[];
    equipmentNames?: string[];
    area: string;
    status: string;
    remark?: string;
    inspector: string;
  }) {
    const { equipmentIds, equipmentNames, area, status, remark, inspector } = data;
    const todayDate = new Date().toISOString().split('T')[0];
    let updatedCount = 0;
    let insertedCount = 0;

    for (let i = 0; i < equipmentIds.length; i++) {
      const equipmentId = equipmentIds[i];
      const equipmentName = equipmentNames?.[i] || '';

      // 检查当天是否已有该器械的巡检记录
      const startOfDay = todayDate + ' 00:00:00';
      const endOfDay = todayDate + ' 23:59:59';
      const existingResult = await this.supabase
        .from('equipment_inspections')
        .select('id')
        .eq('equipment_id', equipmentId)
        .gte('inspection_date', startOfDay)
        .lte('inspection_date', endOfDay)
        .single();

      if (existingResult.data) {
        // 已存在，更新记录
        await this.supabase
          .from('equipment_inspections')
          .update({
            status,
            remark: remark || null,
            inspector,
            created_at: new Date().toISOString(),
          })
          .eq('id', existingResult.data.id);
        updatedCount++;
      } else {
        // 不存在，插入新记录
        await this.supabase
          .from('equipment_inspections')
          .insert({
            equipment_id: equipmentId,
            equipment_name: equipmentName,
            area,
            status,
            remark: remark || null,
            inspector,
            inspection_date: todayDate,
          });
        insertedCount++;
      }

      // 更新器械表中的状态
      await this.supabase
        .from('equipment_list')
        .update({
          status,
          last_inspection_date: todayDate,
        })
        .eq('id', equipmentId);
    }

    return {
      success: true,
      message: `成功 ${updatedCount > 0 ? `更新 ${updatedCount} 条` : ''}${insertedCount > 0 ? `新增 ${insertedCount} 条` : ''}巡检记录`,
      count: updatedCount + insertedCount,
      updatedCount,
      insertedCount,
    };
  }

  // 获取待处理巡检（有磨损+故障）
  async getPendingInspections() {
    const result = await this.supabase
      .from('equipment_inspections')
      .select('*')
      .in('status', ['pending', 'fault'])
      .order('created_at', { ascending: false })
      .limit(20);
    
    return result.data || [];
  }

  // 获取今天未巡检的器械
  async getTodayUninspected() {
    const today = this.getToday();
    
    // 获取今天已巡检的器械ID
    const todayInspected = await this.supabase
      .from('equipment_inspections')
      .select('equipment_id')
      .eq('inspection_date', today);

    const todayInspectedIds = todayInspected.data?.map(item => item.equipment_id).filter(Boolean) || [];

    // 获取所有器械
    const allEquipment = await this.supabase
      .from('equipment_list')
      .select('*')
      .order('area')
      .order('name');

    // 过滤出今天未巡检的器械
    const uninspected = allEquipment.data?.filter(
      item => !todayInspectedIds.includes(item.id)
    ) || [];

    return uninspected;
  }

  // 获取今天未巡检数量
  async getTodayUninspectedCount() {
    const uninspected = await this.getTodayUninspected();
    return {
      count: uninspected.length,
      list: uninspected.slice(0, 5), // 返回前5个用于展示
    };
  }

  // 每日重置：删除昨天的巡检记录，为新的一天做准备
  async resetDailyInspection() {
    const today = this.getToday();
    
    // 获取昨天的日期
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yYear = yesterday.getFullYear();
    const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
    const yDay = String(yesterday.getDate()).padStart(2, '0');
    const yesterdayStr = `${yYear}-${yMonth}-${yDay}`;

    // 删除昨天的巡检记录
    const deleteResult = await this.supabase
      .from('equipment_inspections')
      .delete()
      .neq('inspection_date', today); // 删除所有不是今天的记录

    return {
      success: true,
      today,
      message: `已重置巡检状态，今日需巡检 ${await this.getTodayUninspectedCount().then(r => r.count)} 台器械`,
    };
  }

  // 获取最近巡检记录
  async getRecentInspections(limit: number = 5) {
    const today = this.getToday();
    
    const result = await this.supabase
      .from('equipment_inspections')
      .select('*')
      .eq('inspection_date', today)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return result.data || [];
  }

  // 获取统计数据
  async getStats() {
    const today = this.getToday();
    
    const todayResult = await this.supabase
      .from('equipment_inspections')
      .select('id, status')
      .eq('inspection_date', today);

    const pendingResult = await this.supabase
      .from('equipment_inspections')
      .select('id')
      .eq('inspection_date', today)
      .eq('status', 'pending');

    const faultResult = await this.supabase
      .from('equipment_inspections')
      .select('id')
      .eq('inspection_date', today)
      .eq('status', 'fault');

    // 获取总器械数
    const equipmentResult = await this.supabase
      .from('equipment_list')
      .select('id');

    const totalEquipment = equipmentResult.data?.length || 0;
    const todayInspected = todayResult.data?.length || 0;
    const todayPending = pendingResult.data?.length || 0;
    const todayFault = faultResult.data?.length || 0;

    return {
      totalEquipment,
      todayInspected,
      todayPending,
      todayFault,
      todayUninspected: totalEquipment - todayInspected,
    };
  }

  // 根据ID获取设备信息
  async getEquipmentById(id: number) {
    const result = await this.supabase
      .from('equipment_list')
      .select('*')
      .eq('id', id)
      .single();
    
    return result.data;
  }

  // 更新设备状态和巡检时间
  async updateEquipmentStatus(id: number, status: string) {
    const today = this.getToday();
    
    const result = await this.supabase
      .from('equipment_list')
      .update({
        status: status,
        last_inspection_date: today,
      })
      .eq('id', id)
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

  // 获取按区域统计的巡检进度
  async getAreaProgress() {
    const today = this.getToday();
    const areas = ['A', 'B', 'C'];
    const areaNames: Record<string, string> = {
      A: '有氧区',
      B: '力量区',
      C: '自由重量区',
    };
    
    const progress: Record<string, any> = {};
    
    for (const area of areas) {
      // 获取该区域器械总数
      const totalResult = await this.supabase
        .from('equipment_list')
        .select('id')
        .eq('area', area);
      
      // 获取该区域今天已巡检数
      const inspectedResult = await this.supabase
        .from('equipment_inspections')
        .select('id')
        .eq('inspection_date', today)
        .eq('area', area);
      
      // 获取该区域有磨损数
      const pendingResult = await this.supabase
        .from('equipment_inspections')
        .select('id')
        .eq('inspection_date', today)
        .eq('area', area)
        .in('status', ['pending', 'fault']);
      
      const total = totalResult.data?.length || 0;
      const inspected = inspectedResult.data?.length || 0;
      const pending = pendingResult.data?.length || 0;
      
      progress[area] = {
        name: areaNames[area],
        total,
        inspected,
        pending,
        uninspected: total - inspected,
        percentage: total > 0 ? Math.round((inspected / total) * 100) : 0,
      };
    }
    
    return progress;
  }
}
