import { Injectable } from '@nestjs/common'
import { getSupabaseClient } from '../../storage/database/supabase-client'

@Injectable()
export class FeedbackService {
  // 提交匿名反馈
  async create(data: { content: string; type: string }) {
    const client = getSupabaseClient()
    const result = await client
      .from('feedback')
      .insert({
        content: data.content,
        type: data.type || 'suggestion',
        status: 'pending', // 默认待处理
      })
      .select()
      .single()

    return result
  }

  // 获取反馈列表（仅管理员可见）
  async findAll() {
    const client = getSupabaseClient()
    const result = await client
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })

    return result
  }

  // 按状态获取反馈列表
  async findByStatus(status: string) {
    const client = getSupabaseClient()
    const result = await client
      .from('feedback')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    return result
  }

  // 标记反馈为已处理
  async resolve(id: number) {
    const client = getSupabaseClient()
    const result = await client
      .from('feedback')
      .update({ status: 'resolved' })
      .eq('id', id)
      .select()
      .single()

    return result
  }

  // 删除反馈
  async delete(id: number) {
    const client = getSupabaseClient()
    const result = await client
      .from('feedback')
      .delete()
      .eq('id', id)

    return result
  }

  // 获取反馈数量
  async count() {
    const client = getSupabaseClient()
    const result = await client
      .from('feedback')
      .select('*', { count: 'exact', head: true })

    return { count: result.count || 0 }
  }

  // 获取待处理数量
  async pendingCount() {
    const client = getSupabaseClient()
    const result = await client
      .from('feedback')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    return { count: result.count || 0 }
  }
}
