import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import { Home, BookOpen, Wrench, Settings, Plus, Clock, CircleCheck, Triangle, Circle, ArrowRight, MessageSquare, TrendingUp, BarChart3, Send } from 'lucide-react-taro'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Network } from '@/network'
import Taro from '@tarojs/taro'

interface Stat {
  todayUninspected: number
  pendingRepairs: number
  totalInspections: number
}

interface UninspectedEquipment {
  id: number
  name: string
  area: string
}

export default function Index() {
  const router = useRouter()
  const [stats, setStats] = useState<Stat>({ todayUninspected: 0, pendingRepairs: 0, totalInspections: 0 })
  const [uninspectedList, setUninspectedList] = useState<UninspectedEquipment[]>([])
  const [loading, setLoading] = useState(true)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'need' | 'problem'>('suggestion')
  const [feedbackContent, setFeedbackContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsRes, uninspectedRes] = await Promise.all([
        Network.request({ url: '/api/inspection/stats' }),
        Network.request({ url: '/api/inspection/today-uninspected' })
      ])
      
      if (statsRes.data?.code === 200) {
        setStats(statsRes.data.data)
      }
      if (uninspectedRes.data?.code === 200) {
        setUninspectedList(uninspectedRes.data.data || [])
      }
    } catch (err) {
      console.error('获取数据失败', err)
    } finally {
      setLoading(false)
    }
  }

  const navigateTo = (path: string) => {
    if (path.startsWith('/')) {
      router.push(path)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim()) {
      Taro.showToast({ title: '请输入反馈内容', icon: 'none' })
      return
    }
    try {
      setSubmitting(true)
      const res = await Network.request({
        url: '/api/feedback/submit',
        method: 'POST',
        data: { content: feedbackContent.trim(), type: feedbackType }
      })
      if (res.data?.code === 200) {
        Taro.showToast({ title: '提交成功，感谢您的反馈！', icon: 'success' })
        setShowFeedback(false)
        setFeedbackContent('')
        setFeedbackType('suggestion')
      } else {
        Taro.showToast({ title: res.data?.msg || '提交失败', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className="min-h-screen bg-slate-50 pb-safe">
      {/* 顶部标题 */}
      <View className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-5">
        <Text className="block text-white text-2xl font-bold">健身房管理</Text>
        <Text className="block text-blue-100 text-sm mt-1">欢迎使用内部管理系统</Text>
      </View>

      {/* 滚动内容区域 */}
      <View className="px-4 py-4">
        {/* 统计卡片 */}
        <View className="grid grid-cols-3 gap-3 mb-4">
          <View className="bg-white rounded-xl p-3 shadow-sm">
            <View className="flex items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Triangle size={16} color="#f97316" />
              </View>
              <View>
                <Text className="block text-xl font-bold text-slate-800">{stats.todayUninspected}</Text>
                <Text className="block text-xs text-slate-500">今日待巡检</Text>
              </View>
            </View>
          </View>
          <View className="bg-white rounded-xl p-3 shadow-sm">
            <View className="flex items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <Circle size={16} color="#ef4444" />
              </View>
              <View>
                <Text className="block text-xl font-bold text-slate-800">{stats.pendingRepairs}</Text>
                <Text className="block text-xs text-slate-500">待维修</Text>
              </View>
            </View>
          </View>
          <View className="bg-white rounded-xl p-3 shadow-sm">
            <View className="flex items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CircleCheck size={16} color="#22c55e" />
              </View>
              <View>
                <Text className="block text-xl font-bold text-slate-800">{stats.totalInspections}</Text>
                <Text className="block text-xs text-slate-500">总巡检</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 快捷入口 */}
        <Text className="block text-base font-semibold text-slate-800 mb-3">快捷入口</Text>
        <View className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <View 
            className="flex items-center px-4 py-4 border-b border-slate-100"
            onClick={() => navigateTo('/pages/training/index')}
          >
            <View className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <BookOpen size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="block text-base font-medium text-slate-800">培训资料</Text>
              <Text className="block text-sm text-slate-500">教练学习手册与培训资料</Text>
            </View>
            <ArrowRight size={20} color="#94a3b8" />
          </View>
          <View 
            className="flex items-center px-4 py-4"
            onClick={() => navigateTo('/pages/inspection/index')}
          >
            <View className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
              <Wrench size={20} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="block text-base font-medium text-slate-800">器械巡检</Text>
              <Text className="block text-sm text-slate-500">每日器械巡检与维护记录</Text>
            </View>
            <ArrowRight size={20} color="#94a3b8" />
          </View>
        </View>

        {/* 未巡检提醒 */}
        <View className="flex items-center justify-between mb-3">
          <Text className="block text-base font-semibold text-slate-800">未巡检器械</Text>
          <View className="flex items-center gap-2">
            <View className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              {uninspectedList.length} 个待巡检
            </View>
            <Text 
              className="text-sm text-blue-600"
              onClick={() => navigateTo('/pages/inspection/index')}
            >
              查看全部
            </Text>
          </View>
        </View>

        {uninspectedList.length > 0 ? (
          <View className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
            <ScrollView scrollX className="whitespace-nowrap">
              <View className="flex px-4 py-3">
                {uninspectedList.map((item) => (
                  <View 
                    key={item.id}
                    className="inline-block w-28 mr-3 bg-orange-50 rounded-lg px-3 py-2 text-center border border-orange-100"
                    onClick={() => navigateTo('/pages/inspection/add')}
                  >
                    <Text className="block text-sm font-medium text-orange-700">{item.name}</Text>
                    <Text className="block text-xs text-orange-500 mt-1">区域{item.area}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        ) : (
          <View className="bg-green-50 rounded-xl p-4 mb-4 border border-green-100">
            <View className="flex items-center gap-2">
              <CircleCheck size={20} color="#22c55e" />
              <Text className="block text-green-700 font-medium">太棒了！暂无未巡检器械</Text>
            </View>
          </View>
        )}

        {/* 匿名反馈 */}
        <View className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 mb-4" onClick={() => setShowFeedback(true)}>
          <View className="flex items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <MessageSquare size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="block text-white font-medium">匿名反馈</Text>
              <Text className="block text-purple-100 text-sm">提出建议或需求，完全匿名</Text>
            </View>
            <ArrowRight size={20} color="white" />
          </View>
        </View>

        {/* 底部安全区域 */}
        <View className="h-safe" />
      </View>

      {/* 反馈弹窗 */}
      {showFeedback && (
        <View className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowFeedback(false)}>
          <View className="bg-white w-full rounded-t-2xl p-5 pb-safe" onClick={(e) => e.stopPropagation()}>
            <View className="flex items-center justify-between mb-4">
              <Text className="block text-lg font-semibold text-slate-800">匿名反馈</Text>
              <View 
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                onClick={() => setShowFeedback(false)}
              >
                <Text className="text-slate-500">✕</Text>
              </View>
            </View>
            
            <Text className="block text-sm text-slate-500 mb-3">选择反馈类型</Text>
            <View className="flex gap-2 mb-4">
              <View 
                className={`px-4 py-2 rounded-full text-sm ${feedbackType === 'suggestion' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                onClick={() => setFeedbackType('suggestion')}
              >
                建议
              </View>
              <View 
                className={`px-4 py-2 rounded-full text-sm ${feedbackType === 'need' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                onClick={() => setFeedbackType('need')}
              >
                需求
              </View>
              <View 
                className={`px-4 py-2 rounded-full text-sm ${feedbackType === 'problem' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                onClick={() => setFeedbackType('problem')}
              >
                问题
              </View>
            </View>

            <Text className="block text-sm text-slate-500 mb-2">反馈内容</Text>
            <View className="bg-slate-50 rounded-xl p-3 mb-4">
              <Textarea
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.detail.value)}
                placeholder="请输入您的反馈内容..."
                maxlength={200}
                style={{ width: '100%', minHeight: '100px', backgroundColor: 'transparent' }}
              />
            </View>

            <View className="flex items-center gap-2 text-xs text-slate-400 mb-4">
              <MessageSquare size={14} />
              <Text>此反馈完全匿名，不会收集任何个人信息</Text>
            </View>

            <Button 
              className="w-full" 
              onClick={handleSubmitFeedback}
              disabled={submitting}
            >
              {submitting ? '提交中...' : '提交反馈'}
            </Button>
          </View>
        </View>
      )}
    </View>
  )
}
