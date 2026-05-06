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

  // 获取反馈数量
  async count() {
    const client = getSupabaseClient()
    const result = await client
      .from('feedback')
      .select('*', { count: 'exact', head: true })

    return { count: result.count || 0 }
  }
}
