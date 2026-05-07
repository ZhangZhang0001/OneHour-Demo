import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Network } from '@/network'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { BookOpen, Wrench, ArrowRight, Clock, MessageSquare, CircleAlert, CircleCheck } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import './index.css'

interface UninspectedEquipment {
  id: number
  name: string
  area: string
}

export default function Index() {
  const [stats, setStats] = useState<{ trainingCount: number; uninspectedCount: number }>({
    trainingCount: 0,
    uninspectedCount: 0
  })
  const [uninspectedList, setUninspectedList] = useState<UninspectedEquipment[]>([])
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [feedbackContent, setFeedbackContent] = useState('')
  const [feedbackType, setFeedbackType] = useState('suggestion')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 获取培训资料数量
      const trainingRes = await Network.request({ url: '/api/training/count' })
      console.log('培训资料数量响应:', trainingRes.data)
      const trainingCount = trainingRes.data?.data?.count || 0

      // 获取今日未巡检数量
      const uninspectedRes = await Network.request({ url: '/api/inspection/today-uninspected-count' })
      console.log('今日未巡检响应:', uninspectedRes.data)
      const uninspectedCount = uninspectedRes.data?.data?.count || 0
      const uninspectedEquipment = uninspectedRes.data?.data?.list || []

      setStats({ trainingCount, uninspectedCount })
      setUninspectedList(uninspectedEquipment)
    } catch (error) {
      console.error('获取数据失败:', error)
    }
  }

  const getAreaLabel = (area: string) => {
    const areaMap: Record<string, string> = {
      A: '有氧区',
      B: '力量区',
      C: '自由重量区'
    }
    return areaMap[area] || area
  }

  const formatDate = () => {
    const now = new Date()
    return `${now.getMonth() + 1}月${now.getDate()}日`
  }

  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim()) {
      Taro.showToast({ title: '请输入反馈内容', icon: 'none' })
      return
    }

    if (feedbackContent.length > 500) {
      Taro.showToast({ title: '反馈内容不能超过500字', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      const res = await Network.request({
        url: '/api/feedback/submit',
        method: 'POST',
        data: {
          content: feedbackContent.trim(),
          type: feedbackType
        }
      })
      console.log('提交反馈响应:', res.data)

      if (res.data?.code === 200) {
        Taro.showToast({ title: '提交成功，感谢您的反馈！', icon: 'success' })
        setShowFeedbackDialog(false)
        setFeedbackContent('')
        setFeedbackType('suggestion')
      } else {
        Taro.showToast({ title: res.data?.msg || '提交失败', icon: 'none' })
      }
    } catch (error) {
      console.error('提交反馈失败:', error)
      Taro.showToast({ title: '提交失败，请稍后重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const menuItems = [
    {
      title: '培训资料',
      desc: '查看学习手册和培训资料',
      icon: <BookOpen size={24} color="#1e40af" />,
      path: '/pages/training/index',
      bgColor: 'bg-blue-50'
    },
    {
      title: '器械巡检',
      desc: '记录器械巡检情况',
      icon: <Wrench size={24} color="#1e40af" />,
      path: '/pages/inspection/index',
      bgColor: 'bg-blue-50'
    }
  ]

  const feedbackTypes = [
    { value: 'suggestion', label: '建议' },
    { value: 'need', label: '需求' },
    { value: 'problem', label: '问题' }
  ]

  return (
    <View className="min-h-screen bg-slate-50 pb-safe">
      <ScrollView className="p-4 pb-safe" scrollY>
        {/* 头部欢迎 */}
        <View className="mb-6">
          <Text className="block text-2xl font-bold text-slate-800">健身房管理系统</Text>
          <Text className="block text-sm text-slate-500 mt-1">欢迎使用内部管理工具</Text>
        </View>

        {/* 统计卡片 */}
        <View className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <View className="flex items-center gap-3">
                <View className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <BookOpen size={24} color="#1e40af" />
                </View>
                <View>
                  <Text className="block text-2xl font-bold text-slate-800">{stats.trainingCount}</Text>
                  <Text className="block text-sm text-slate-500">培训资料</Text>
                </View>
              </View>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <View className="flex items-center gap-3">
                <View className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Wrench size={24} color="#f97316" />
                </View>
                <View>
                  <Text className="block text-2xl font-bold text-slate-800">{stats.uninspectedCount}</Text>
                  <Text className="block text-sm text-slate-500">今日待巡检</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* 功能入口 */}
        <Text className="block text-lg font-semibold text-slate-800 mb-3">快捷功能</Text>
        <View className="space-y-3 mb-6">
          {menuItems.map((item) => (
            <Card key={item.title} onClick={() => Taro.switchTab({ url: item.path })}>
              <CardContent className="p-4">
                <View className="flex items-center gap-4">
                  <View className={`w-14 h-14 rounded-xl ${item.bgColor} flex items-center justify-center`}>
                    {item.icon}
                  </View>
                  <View className="flex-1">
                    <Text className="block text-base font-medium text-slate-800">{item.title}</Text>
                    <Text className="block text-sm text-slate-500 mt-1">{item.desc}</Text>
                  </View>
                  <ArrowRight size={20} color="#94a3b8" />
                </View>
              </CardContent>
            </Card>
          ))}
        </View>

        {/* 匿名反馈入口 */}
        <Card onClick={() => setShowFeedbackDialog(true)}>
          <CardContent className="p-4">
            <View className="flex items-center gap-4">
              <View className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center">
                <MessageSquare size={24} color="#7c3aed" />
              </View>
              <View className="flex-1">
                <Text className="block text-base font-medium text-slate-800">匿名反馈</Text>
                <Text className="block text-sm text-slate-500 mt-1">匿名提出建议或需求</Text>
              </View>
              <ArrowRight size={20} color="#94a3b8" />
            </View>
          </CardContent>
        </Card>

        {/* 今日待巡检 */}
        <View className="flex items-center justify-between mt-6 mb-3">
          <View className="flex items-center gap-2">
            <Text className="block text-lg font-semibold text-slate-800">今日待巡检</Text>
            <Text className="block text-xs text-slate-400">{formatDate()}</Text>
            {stats.uninspectedCount > 0 && (
              <View className="px-2 py-1 rounded-full bg-red-500">
                <Text className="block text-xs text-white">{stats.uninspectedCount}</Text>
              </View>
            )}
          </View>
          <View 
            className="flex items-center gap-1 text-blue-600" 
            onClick={() => Taro.switchTab({ url: '/pages/inspection/index' })}
          >
            <Text className="block text-sm">去巡检</Text>
            <ArrowRight size={14} color="#2563eb" />
          </View>
        </View>

        {uninspectedList.length > 0 ? (
          <ScrollView scrollX className="mb-6" style={{ display: 'flex', flexDirection: 'row' }}>
            <View className="flex gap-3">
              {uninspectedList.map((item) => (
                <Card key={item.id} className="w-48 flex-shrink-0">
                  <CardContent className="p-4">
                    <View className="flex items-center gap-2 mb-2">
                      <CircleAlert size={16} color="#f97316" />
                      <View className="px-2 py-1 rounded-full bg-slate-100">
                        <Text className="block text-xs text-slate-600">{getAreaLabel(item.area)}</Text>
                      </View>
                    </View>
                    <Text className="block text-base font-medium text-slate-800">{item.name}</Text>
                    <View className="flex items-center gap-1 mt-2">
                      <Clock size={10} color="#94a3b8" />
                      <Text className="block text-xs text-slate-400">待巡检</Text>
                    </View>
                  </CardContent>
                </Card>
              ))}
            </View>
          </ScrollView>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <CircleCheck size={32} color="#22c55e" className="mx-auto mb-2" />
              <Text className="block text-slate-600">太棒了！今日巡检已全部完成</Text>
            </CardContent>
          </Card>
        )}
      </ScrollView>

      {/* 匿名反馈弹窗 */}
      <Dialog 
        open={showFeedbackDialog} 
        onOpenChange={(open) => setShowFeedbackDialog(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>匿名反馈</DialogTitle>
          </DialogHeader>
          <View className="space-y-4">
            <View>
              <Text className="block text-sm font-medium text-slate-700 mb-2">反馈类型</Text>
              <View className="flex gap-2">
                {feedbackTypes.map((type) => (
                  <View
                    key={type.value}
                    onClick={() => setFeedbackType(type.value)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      feedbackType === type.value 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Text className="block">{type.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View>
              <Text className="block text-sm font-medium text-slate-700 mb-2">反馈内容</Text>
              <View className="bg-slate-50 rounded-xl p-3">
                <Textarea
                  style={{ width: '100%', minHeight: '120px', backgroundColor: 'transparent' }}
                  placeholder="请输入您的反馈内容（建议、需求、问题等）..."
                  maxlength={500}
                  value={feedbackContent}
                  onInput={(e: any) => setFeedbackContent(e.detail.value)}
                />
              </View>
              <Text className="block text-xs text-slate-400 mt-1 text-right">{feedbackContent.length}/500</Text>
            </View>

            <View className="bg-purple-50 rounded-lg p-3">
              <Text className="block text-xs text-purple-600">此反馈完全匿名，不会收集任何个人信息</Text>
            </View>

            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={handleSubmitFeedback}
              disabled={submitting}
            >
              <Text className="text-white">{submitting ? '提交中...' : '提交反馈'}</Text>
            </Button>
          </View>
        </DialogContent>
      </Dialog>
    </View>
  )
}
