import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ArrowLeft, MessageSquare, Lightbulb, Package, Info, Check } from 'lucide-react-taro'
import { Network } from '@/network'

interface FeedbackItem {
  id: number
  content: string
  type: string
  status: string
  handle_time: string | null
  created_at: string
}

const typeConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof Lightbulb }> = {
  suggestion: { label: '建议', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Lightbulb },
  need: { label: '需求', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Package },
  problem: { label: '问题', color: 'text-red-600', bgColor: 'bg-red-100', icon: Info },
}

export default function FeedbackList() {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    fetchFeedbackList()
  }, [])

  const fetchFeedbackList = async () => {
    try {
      setLoading(true)
      const res = await Network.request({ url: '/api/feedback/list' })
      if (res.data?.code === 200) {
        const list = res.data.data || []
        list.sort((a: FeedbackItem, b: FeedbackItem) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setFeedbackList(list)
      }
    } catch (err) {
      console.error('获取反馈列表失败', err)
      Taro.showToast({ title: '获取数据失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const filteredList = filterType === 'all' 
    ? feedbackList 
    : feedbackList.filter(item => item.type === filterType)

  const getTypeConfig = (type: string) => {
    return typeConfig[type] || typeConfig.suggestion
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const formatHandleTime = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  // 标记已处理
  const handleResolve = async (id: number) => {
    try {
      const res = await Network.request({
        url: '/api/feedback/resolve',
        method: 'POST',
        data: { id },
      })
      if (res.data?.code === 200) {
        Taro.showToast({ title: '已标记处理', icon: 'success' })
        fetchFeedbackList()
      } else {
        Taro.showToast({ title: res.data?.msg || '操作失败', icon: 'none' })
      }
    } catch (err) {
      console.error('操作失败', err)
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const pendingCount = feedbackList.filter(f => f.status === '0').length
  const resolvedCount = feedbackList.filter(f => f.status === '1').length

  return (
    <View className="min-h-screen bg-slate-50 pb-safe">
      {/* 顶部导航 */}
      <View className="bg-white px-4 py-3 flex items-center gap-3 border-b border-slate-100">
        <View 
          className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"
          onClick={() => Taro.navigateBack()}
        >
          <ArrowLeft size={20} color="#374151" />
        </View>
        <Text className="block text-lg font-medium text-slate-800">匿名反馈</Text>
      </View>

      {/* 统计信息 */}
      <View className="px-4 py-3 bg-white border-b border-slate-100">
        <View className="flex gap-3">
          <View className="flex-1 bg-orange-50 rounded-xl p-3 text-center">
            <Text className="block text-2xl font-bold text-orange-600">{pendingCount}</Text>
            <Text className="block text-xs text-orange-500 mt-1">待处理</Text>
          </View>
          <View className="flex-1 bg-green-50 rounded-xl p-3 text-center">
            <Text className="block text-2xl font-bold text-green-600">{resolvedCount}</Text>
            <Text className="block text-xs text-green-500 mt-1">已处理</Text>
          </View>
        </View>
      </View>

      {/* 筛选标签 */}
      <View className="px-4 py-3 bg-white border-b border-slate-100">
        <View className="flex gap-2">
          {[
            { key: 'all', label: '全部' },
            { key: 'suggestion', label: '建议' },
            { key: 'need', label: '需求' },
            { key: 'problem', label: '问题' },
          ].map(item => (
            <View 
              key={item.key}
              className={`px-4 py-2 rounded-full text-sm ${
                filterType === item.key 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-slate-100 text-slate-600'
              }`}
              onClick={() => setFilterType(item.key)}
            >
              {item.label}
            </View>
          ))}
        </View>
      </View>

      {/* 反馈列表 */}
      <View className="px-4 py-4">
        {loading ? (
          <View className="bg-white rounded-xl p-8 text-center">
            <Text className="block text-slate-500">加载中...</Text>
          </View>
        ) : filteredList.length > 0 ? (
          filteredList.map((item) => {
            const config = getTypeConfig(item.type)
            const isResolved = item.status === '1'
            
            return (
              <View 
                key={item.id}
                className={`bg-white rounded-xl mb-3 overflow-hidden ${isResolved ? 'opacity-60' : ''}`}
              >
                <View className="p-4">
                  <View className="flex items-center gap-3 mb-3">
                    <View className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                      <config.icon size={18} color={config.color.includes('blue') ? '#2563eb' : config.color.includes('purple') ? '#9333ea' : '#dc2626'} />
                    </View>
                    <View className="flex-1">
                      <Text className={`block text-sm font-medium ${isResolved ? 'text-slate-500' : 'text-slate-800'}`}>{config.label}</Text>
                      <Text className="block text-xs text-slate-400">{formatDate(item.created_at)}</Text>
                    </View>
                    {isResolved ? (
                      // 已处理状态标签
                      <View className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-600 flex items-center gap-1">
                        <Check size={12} color="#16a34a" />
                        <Text className="text-xs text-green-600">已处理</Text>
                      </View>
                    ) : (
                      // 待处理状态标签
                      <View className={`px-3 py-1 rounded-full text-xs ${config.bgColor} ${config.color}`}>
                        {config.label}
                      </View>
                    )}
                  </View>
                  
                  <View className="bg-slate-50 rounded-xl p-3 mb-3">
                    <Text className={`block text-sm leading-relaxed ${isResolved ? 'text-slate-400' : 'text-slate-700'}`}>{item.content}</Text>
                  </View>

                  {/* 处理时间 */}
                  {isResolved && item.handle_time && (
                    <Text className="block text-xs text-green-600 mb-2">
                      处理时间：{formatHandleTime(item.handle_time)}
                    </Text>
                  )}

                  {/* 操作按钮 - 仅待处理显示 */}
                  {!isResolved && (
                    <View className="flex justify-end mt-2">
                      <View
                        className="flex items-center gap-1 px-4 py-2 rounded-full bg-green-500 text-white"
                        onClick={() => handleResolve(item.id)}
                      >
                        <Check size={14} color="#ffffff" />
                        <Text className="text-xs text-white">标记已处理</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )
          })
        ) : (
          <View className="bg-white rounded-xl p-8 text-center">
            <MessageSquare size={48} color="#cbd5e1" />
            <Text className="block text-slate-500 mt-3">暂无反馈记录</Text>
            <Text className="block text-sm text-slate-400 mt-1">员工提交的建议将显示在这里</Text>
          </View>
        )}
      </View>
    </View>
  )
}
