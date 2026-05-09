import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ArrowLeft, MessageSquare, Lightbulb, Package, Info, BadgeCheck, Trash2, Clock } from 'lucide-react-taro'
import { Network } from '@/network'

interface FeedbackItem {
  id: number
  content: string
  type: string
  status: 'pending' | 'resolved'
  created_at: string
}

const typeConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof Lightbulb }> = {
  suggestion: { label: '建议', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Lightbulb },
  need: { label: '需求', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Package },
  problem: { label: '问题', color: 'text-red-600', bgColor: 'bg-red-100', icon: Info },
}

export default function FeedbackList() {
  const [pendingList, setPendingList] = useState<FeedbackItem[]>([])
  const [resolvedList, setResolvedList] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending')

  useEffect(() => {
    fetchLists()
  }, [])

  const fetchLists = async () => {
    try {
      setLoading(true)
      // 并行获取待处理和已处理列表
      const [pendingRes, resolvedRes] = await Promise.all([
        Network.request({ url: '/api/feedback/list-by-status?status=pending' }),
        Network.request({ url: '/api/feedback/list-by-status?status=resolved' }),
      ])
      
      if (pendingRes.data?.code === 200) {
        setPendingList(pendingRes.data.data || [])
      }
      if (resolvedRes.data?.code === 200) {
        setResolvedList(resolvedRes.data.data || [])
      }
    } catch (err) {
      console.error('获取反馈列表失败', err)
      Taro.showToast({ title: '获取数据失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const getTypeConfig = (type: string) => {
    return typeConfig[type] || typeConfig.suggestion
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
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
        fetchLists()
      } else {
        Taro.showToast({ title: res.data?.msg || '操作失败', icon: 'none' })
      }
    } catch (err) {
      console.error('操作失败', err)
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  // 删除反馈
  const handleDelete = async (id: number) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条反馈吗？删除后不可恢复',
      confirmColor: '#ef4444',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await Network.request({
              url: '/api/feedback/delete',
              method: 'POST',
              data: { id },
            })
            if (result.data?.code === 200) {
              Taro.showToast({ title: '已删除', icon: 'success' })
              fetchLists()
            } else {
              Taro.showToast({ title: result.data?.msg || '删除失败', icon: 'none' })
            }
          } catch (err) {
            console.error('删除失败', err)
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      },
    })
  }

  const currentList = activeTab === 'pending' ? pendingList : resolvedList

  const renderFeedbackCard = (item: FeedbackItem) => {
    const config = getTypeConfig(item.type)
    return (
      <View key={item.id} className="bg-white rounded-xl mb-3 overflow-hidden">
        <View className="p-4">
          <View className="flex items-center gap-3 mb-3">
            <View className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
              <config.icon size={18} color={config.color.includes('blue') ? '#2563eb' : config.color.includes('purple') ? '#9333ea' : '#dc2626'} />
            </View>
            <View className="flex-1">
              <Text className="block text-sm font-medium text-slate-800">{config.label}</Text>
              <Text className="block text-xs text-slate-400">{formatDate(item.created_at)}</Text>
            </View>
            <View className={`px-3 py-1 rounded-full text-xs ${config.bgColor} ${config.color}`}>
              {config.label}
            </View>
          </View>
          <View className="bg-slate-50 rounded-xl p-3 mb-3">
            <Text className="block text-sm text-slate-700 leading-relaxed">{item.content}</Text>
          </View>
          
          {/* 操作按钮区域 */}
          <View className="flex justify-end gap-3 mt-2">
            {activeTab === 'pending' ? (
              // 待处理：显示"标记已处理"按钮
              <View
                className="flex items-center gap-1 px-4 py-2 rounded-full bg-green-500 text-white"
                onClick={() => handleResolve(item.id)}
              >
                <BadgeCheck size={14} color="#ffffff" />
                <Text className="text-xs text-white">标记已处理</Text>
              </View>
            ) : (
              // 已处理：显示"删除"按钮
              <View
                className="flex items-center gap-1 px-4 py-2 rounded-full bg-red-500 text-white"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 size={14} color="#ffffff" />
                <Text className="text-xs text-white">删除</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }

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

      {/* Tab切换 */}
      <View className="px-4 py-3 bg-white border-b border-slate-100">
        <View className="flex gap-2">
          <View
            className={`flex-1 py-3 rounded-xl text-center ${
              activeTab === 'pending' 
                ? 'bg-orange-500 text-white' 
                : 'bg-slate-100 text-slate-600'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            <View className="flex items-center justify-center gap-2">
              <Clock size={16} color={activeTab === 'pending' ? '#ffffff' : '#64748b'} />
              <Text className={`text-sm font-medium ${activeTab === 'pending' ? 'text-white' : 'text-slate-600'}`}>
                待处理 ({pendingList.length})
              </Text>
            </View>
          </View>
          <View
            className={`flex-1 py-3 rounded-xl text-center ${
              activeTab === 'resolved' 
                ? 'bg-green-500 text-white' 
                : 'bg-slate-100 text-slate-600'
            }`}
            onClick={() => setActiveTab('resolved')}
          >
            <View className="flex items-center justify-center gap-2">
              <BadgeCheck size={16} color={activeTab === 'resolved' ? '#ffffff' : '#64748b'} />
              <Text className={`text-sm font-medium ${activeTab === 'resolved' ? 'text-white' : 'text-slate-600'}`}>
                已处理 ({resolvedList.length})
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 反馈列表 */}
      <View className="px-4 py-4">
        {loading ? (
          <View className="bg-white rounded-xl p-8 text-center">
            <Text className="block text-slate-500">加载中...</Text>
          </View>
        ) : currentList.length > 0 ? (
          currentList.map(renderFeedbackCard)
        ) : (
          <View className="bg-white rounded-xl p-8 text-center">
            <MessageSquare size={48} color="#cbd5e1" />
            <Text className="block text-slate-500 mt-3">
              {activeTab === 'pending' ? '暂无待处理反馈' : '暂无已处理反馈'}
            </Text>
            <Text className="block text-sm text-slate-400 mt-1">
              {activeTab === 'pending' ? '所有反馈都已处理完毕' : '已处理的反馈会显示在这里'}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}
