import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Network } from '@/network'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { BookOpen, Wrench, Plus, ArrowRight, Clock, MessageSquare } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import './index.css'

interface RecentInspection {
  id: number
  equipment_name: string
  status: 'normal' | 'pending' | 'fault'
  inspector: string
  created_at: string
}

export default function Index() {
  const [stats, setStats] = useState<{ trainingCount: number; pendingCount: number }>({
    trainingCount: 0,
    pendingCount: 0
  })
  const [recentInspections, setRecentInspections] = useState<RecentInspection[]>([])
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [feedbackContent, setFeedbackContent] = useState('')
  const [feedbackType, setFeedbackType] = useState('suggestion')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const trainingRes = await Network.request({ url: '/api/training/count' })
      console.log('培训资料数量响应:', trainingRes.data)
      const trainingCount = trainingRes.data?.data?.count || 0

      const pendingRes = await Network.request({ url: '/api/inspection/pending-count' })
      console.log('待巡检数量响应:', pendingRes.data)
      const pendingCount = pendingRes.data?.data?.count || 0

      const recentRes = await Network.request({ url: '/api/inspection/recent' })
      console.log('最近巡检记录响应:', recentRes.data)
      const recentList = recentRes.data?.data?.inspections || []

      setStats({ trainingCount, pendingCount })
      setRecentInspections(recentList)
    } catch (error) {
      console.error('获取数据失败:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      normal: { label: '正常', color: 'bg-green-500' },
      pending: { label: '待维修', color: 'bg-orange-500' },
      fault: { label: '故障', color: 'bg-red-500' }
    }
    const config = statusMap[status as keyof typeof statusMap] || statusMap.normal
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
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
      <ScrollView className="p-4" scrollY>
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
                  <Text className="block text-2xl font-bold text-slate-800">{stats.pendingCount}</Text>
                  <Text className="block text-sm text-slate-500">待巡检</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* 功能入口 */}
        <Text className="block text-lg font-semibold text-slate-800 mb-3">快捷功能</Text>
        <View className="space-y-3 mb-6">
          {menuItems.map((item) => (
            <Card key={item.title} onClick={() => Taro.navigateTo({ url: item.path })}>
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

        {/* 最近巡检记录 */}
        <View className="flex items-center justify-between mt-6 mb-3">
          <Text className="block text-lg font-semibold text-slate-800">最近巡检</Text>
          <View 
            className="flex items-center gap-1 text-blue-600" 
            onClick={() => Taro.switchTab({ url: '/pages/inspection/index' })}
          >
            <Text className="block text-sm">查看全部</Text>
            <ArrowRight size={14} color="#2563eb" />
          </View>
        </View>

        {recentInspections.length > 0 ? (
          <View className="space-y-3">
            {recentInspections.slice(0, 3).map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <View className="flex items-center justify-between">
                    <View className="flex-1">
                      <Text className="block text-base font-medium text-slate-800">{item.equipment_name}</Text>
                      <View className="flex items-center gap-2 mt-1">
                        <Clock size={12} color="#94a3b8" />
                        <Text className="block text-xs text-slate-400">{formatDate(item.created_at)}</Text>
                      </View>
                    </View>
                    {getStatusBadge(item.status)}
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Text className="block text-slate-400">暂无巡检记录</Text>
              <View 
                className="mt-3 inline-flex items-center gap-1 text-blue-600"
                onClick={() => Taro.navigateTo({ url: '/pages/inspection/add' })}
              >
                <Plus size={14} color="#2563eb" />
                <Text className="block text-sm">添加第一条记录</Text>
              </View>
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
              <Text className="block text-xs text-slate-400 mt-1 text-right">
                {feedbackContent.length}/500
              </Text>
            </View>

            <View className="flex items-center gap-2 bg-purple-50 rounded-lg p-3">
              <View className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center">
                <Text className="text-white text-xs">!</Text>
              </View>
              <Text className="block text-xs text-purple-700">
                此反馈完全匿名，不会收集任何个人信息
              </Text>
            </View>

            <View className="flex gap-3 pt-2">
              <View className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowFeedbackDialog(false)}
                >
                  取消
                </Button>
              </View>
              <View className="flex-1">
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={submitting}
                  onClick={handleSubmitFeedback}
                >
                  <Text className="text-white">{submitting ? '提交中...' : '提交'}</Text>
                </Button>
              </View>
            </View>
          </View>
        </DialogContent>
      </Dialog>
    </View>
  )
}
