import { Controller, Post, Get, Body } from '@nestjs/common'
import { FeedbackService } from './feedback.service'

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // 提交匿名反馈
  @Post('submit')
  async submit(@Body() body: { content: string; type?: string }) {
    console.log('POST /api/feedback/submit - body:', JSON.stringify(body))

    if (!body.content || body.content.trim().length === 0) {
      return {
        code: 400,
        msg: '反馈内容不能为空',
        data: null,
      }
    }

    if (body.content.length > 500) {
      return {
        code: 400,
        msg: '反馈内容不能超过500字',
        data: null,
      }
    }

    const result = await this.feedbackService.create({
      content: body.content.trim(),
      type: body.type || 'suggestion',
    })

    if (result.error) {
      console.error('Feedback submit error:', result.error)
      return {
        code: 500,
        msg: '提交失败，请稍后重试',
        data: null,
      }
    }

    console.log('Feedback submit success:', JSON.stringify(result.data))
    return {
      code: 200,
      msg: '提交成功，感谢您的反馈！',
      data: result.data,
    }
  }

  // 获取反馈列表（管理员）
  @Get('list')
  async findAll() {
    console.log('GET /api/feedback/list')

    const result = await this.feedbackService.findAll()

    if (result.error) {
      console.error('Feedback list error:', result.error)
      return {
        code: 500,
        msg: '获取列表失败',
        data: [],
      }
    }

    return {
      code: 200,
      msg: 'success',
      data: result.data || [],
    }
  }

  // 获取反馈数量
  @Get('count')
  async count() {
    console.log('GET /api/feedback/count')

    const result = await this.feedbackService.count()

    return {
      code: 200,
      msg: 'success',
      data: { count: result.count },
    }
  }

  // 获取待处理数量
  @Get('pending-count')
  async pendingCount() {
    console.log('GET /api/feedback/pending-count')

    const result = await this.feedbackService.pendingCount()

    return {
      code: 200,
      msg: 'success',
      data: { count: result.count },
    }
  }

  // 标记反馈为已处理
  @Post('resolve')
  async resolve(@Body() body: { id: number }) {
    console.log('POST /api/feedback/resolve - id:', body.id)

    if (!body.id) {
      return {
        code: 400,
        msg: '缺少反馈ID',
        data: null,
      }
    }

    const result = await this.feedbackService.resolve(body.id)

    if (result.error) {
      console.error('Feedback resolve error:', result.error)
      return {
        code: 500,
        msg: '操作失败',
        data: null,
      }
    }

    return {
      code: 200,
      msg: '已标记为处理',
      data: result.data,
    }
  }
}
