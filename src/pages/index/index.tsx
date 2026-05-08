import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { BookOpen, Wrench, CircleCheck, MessageSquare } from 'lucide-react-taro'
import { Input } from '@/components/ui/input'
import { Network } from '@/network'

interface Stat {
  totalEquipment: number
  todayInspected: number
  todayPending: number
  todayFault: number
}

interface UninspectedEquipment {
  id: number
  name: string
  area: string
}

export default function Index() {
  const [stats, setStats] = useState<Stat>({ totalEquipment: 0, todayInspected: 0, todayPending: 0, todayFault: 0 })
  const [uninspectedList, setUninspectedList] = useState<UninspectedEquipment[]>([])
  const [, setLoading] = useState(true)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'need' | 'problem'>('suggestion')
  const [feedbackContent, setFeedbackContent] = useState('')

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
        const data = statsRes.data.data
        setStats({
          totalEquipment: data.totalEquipment || 0,
          todayInspected: data.todayInspected || 0,
          todayPending: data.todayPending || 0,
          todayFault: data.todayFault || 0,
        })
      }
      if (uninspectedRes.data?.code === 200) {
        const list = uninspectedRes.data.data?.equipment || uninspectedRes.data.data || []
        setUninspectedList(Array.isArray(list) ? list : [])
      }
    } catch (err) {
      console.error('获取数据失败', err)
    } finally {
      setLoading(false)
    }
  }

  const navigateTo = (path: string) => {
    if (path.startsWith('/')) {
      const tabBarPages = ['/pages/index/index', '/pages/training/index', '/pages/inspection/index', '/pages/profile/index']
      if (tabBarPages.includes(path)) {
        Taro.switchTab({ url: path })
      } else {
        Taro.navigateTo({ url: path })
      }
    }
  }

  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim()) {
      Taro.showToast({ title: '请输入反馈内容', icon: 'none' })
      return
    }
    try {
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
    }
  }

  return (
    <View className="min-h-screen bg-slate-100">
      <ScrollView scrollY className="h-screen pb-safe">
        {/* 顶部欢迎语 */}
        <View className="bg-gradient-to-r from-slate-700 to-slate-600 px-4 py-6 shadow-lg">
          <Text className="block text-white text-lg font-medium mb-1">不用和别人比</Text>
          <Text className="block text-blue-300 text-base">每天只赢自己一小时</Text>
        </View>

        {/* 今日概况 */}
        <View className="px-4 -mt-4">
          <View className="bg-white rounded-2xl shadow-md p-4 mb-4">
            <Text className="block text-base font-semibold text-slate-800 mb-3">今日概况</Text>
            <View className="grid grid-cols-2 gap-3">
              <View className="bg-blue-50 rounded-xl p-3">
                <Text className="block text-2xl font-bold text-blue-600">{stats.totalEquipment}</Text>
                <Text className="block text-xs text-blue-500 mt-1">器械总数</Text>
              </View>
              <View className="bg-green-50 rounded-xl p-3">
                <Text className="block text-2xl font-bold text-green-600">{stats.todayInspected}</Text>
                <Text className="block text-xs text-green-500 mt-1">今日已巡检</Text>
              </View>
              <View className="bg-orange-50 rounded-xl p-3">
                <Text className="block text-2xl font-bold text-orange-600">{stats.todayPending}</Text>
                <Text className="block text-xs text-orange-500 mt-1">待维修</Text>
              </View>
              <View className="bg-red-50 rounded-xl p-3">
                <Text className="block text-2xl font-bold text-red-600">{stats.todayFault}</Text>
                <Text className="block text-xs text-red-500 mt-1">故障</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 快捷入口 */}
        <View className="px-4 mb-4">
          <Text className="block text-sm font-medium text-slate-600 mb-3">快捷入口</Text>
          <View className="grid grid-cols-3 gap-3">
            <View 
              className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center"
              onClick={() => navigateTo('/pages/training/index')}
            >
              <View className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                <BookOpen size={24} color="#d97706" />
              </View>
              <Text className="block text-xs text-slate-700 font-medium">培训资料</Text>
            </View>
            <View 
              className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center"
              onClick={() => navigateTo('/pages/inspection/index')}
            >
              <View className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                <Wrench size={24} color="#4f46e5" />
              </View>
              <Text className="block text-xs text-slate-700 font-medium">器械巡检</Text>
            </View>
            <View 
              className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center"
              onClick={() => setShowFeedback(true)}
            >
              <View className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                <MessageSquare size={24} color="#9333ea" />
              </View>
              <Text className="block text-xs text-slate-700 font-medium">匿名反馈</Text>
            </View>
          </View>
        </View>

        {/* 未巡检器械 */}
        <View className="px-4 pb-4">
          <View className="flex items-center justify-between mb-3">
            <Text className="block text-sm font-medium text-slate-600">未巡检器械</Text>
            <Text className="block text-xs text-slate-400">{uninspectedList.length} 台</Text>
          </View>
          
          {uninspectedList.length > 0 ? (
            <View className="bg-white rounded-xl shadow-sm overflow-hidden">
              {uninspectedList.map((item, index) => (
                <View 
                  key={item.id || index}
                  className={`p-3 flex items-center justify-between ${index < uninspectedList.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <View className="flex items-center gap-3">
                    <View className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      item.area === 'A' ? 'bg-blue-100 text-blue-600' :
                      item.area === 'B' ? 'bg-green-100 text-green-600' :
                      item.area === 'C' ? 'bg-amber-100 text-amber-600' :
                      'bg-slate-100 text-slate-600'
                    }`}
                    >
                      {item.area || '?'}
                    </View>
                    <View>
                      <Text className="block text-sm text-slate-800">{item.name}</Text>
                      <Text className="block text-xs text-slate-400">{item.area ? `${item.area}区` : '未分区'}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-xl p-6 shadow-sm flex flex-col items-center">
              <CircleCheck size={40} color="#22c55e" />
              <Text className="block text-sm text-slate-600 mt-2">今日巡检已全部完成</Text>
            </View>
          )}
        </View>

        {/* 反馈弹窗 */}
        {showFeedback && (
          <View className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50" onClick={() => setShowFeedback(false)}>
            <View className="w-full bg-white rounded-t-3xl p-6 pb-safe" onClick={(e) => e.stopPropagation()}>
              <View className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" />
              <Text className="block text-lg font-semibold text-slate-800 mb-4">匿名反馈</Text>
              
              <View className="flex gap-2 mb-4">
                {[
                  { key: 'suggestion', label: '建议', color: 'blue' },
                  { key: 'need', label: '需求', color: 'purple' },
                  { key: 'problem', label: '问题', color: 'red' },
                ].map((item) => (
                  <View
                    key={item.key}
                    className={`px-4 py-2 rounded-full text-sm ${
                      feedbackType === item.key
                        ? `bg-${item.color}-500 text-white`
                        : 'bg-slate-100 text-slate-600'
                    }`}
                    onClick={() => setFeedbackType(item.key as any)}
                  >
                    {item.label}
                  </View>
                ))}
              </View>
              
              <View className="bg-slate-50 rounded-2xl p-4 mb-4">
                <Text className="block text-sm text-slate-500 mb-2">反馈内容</Text>
                <View className="bg-white rounded-xl px-3 py-3">
                  <Input
                    className="w-full text-sm text-slate-800"
                    placeholder="请输入您的反馈..."
                    value={feedbackContent}
                    onInput={(e: any) => setFeedbackContent(e.detail.value)}
                    style={{ minHeight: '80px', textAlign: 'left' }}
                  />
                </View>
              </View>
              
              <View className="flex gap-3">
                <View className="flex-1" onClick={() => setShowFeedback(false)}>
                  <View className="w-full bg-slate-100 text-slate-600 rounded-xl py-3 text-center">取消</View>
                </View>
                <View className="flex-1" onClick={handleSubmitFeedback}>
                  <View className="w-full bg-blue-500 text-white rounded-xl py-3 text-center">提交</View>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
