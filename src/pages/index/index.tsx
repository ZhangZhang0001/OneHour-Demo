import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { BookOpen, Wrench, MessageSquare, Zap } from 'lucide-react-taro'
import { Network } from '@/network'
import FeedbackSheet from '@/components/feedback-sheet'

export default function Index() {
  const [stats, setStats] = useState({
    totalEquipment: 0,
    todayInspected: 0,
    todayPending: 0,
    todayFault: 0,
  })
  const [uninspectedList, setUninspectedList] = useState<any[]>([])
  const [showFeedback, setShowFeedback] = useState(false)

  const fetchData = async () => {
    try {
      const [statsRes, listRes] = await Promise.all([
        Network.request({ url: '/api/inspection/stats' }),
        Network.request({ url: '/api/inspection/today-uninspected' }),
      ])
      
      const statsData = statsRes.data?.data || {}
      setStats({
        totalEquipment: statsData.totalEquipment || 0,
        todayInspected: statsData.todayInspected || 0,
        todayPending: statsData.todayPending || 0,
        todayFault: statsData.todayFault || 0,
      })
      
      const list = listRes.data?.data?.equipment || []
      setUninspectedList(list)
    } catch (err) {
      console.error('获取数据失败', err)
    }
  }

  useEffect(() => {
    fetchData()
    Taro.eventCenter.on('reloadHome', fetchData)
    return () => {
      Taro.eventCenter.off('reloadHome', fetchData)
    }
  }, [])

  const navigateTo = (url: string) => {
    const tabBarPages = ['/pages/index/index', '/pages/training/index', '/pages/inspection/index', '/pages/profile/index']
    if (tabBarPages.includes(url)) {
      Taro.switchTab({ url })
    } else {
      Taro.navigateTo({ url })
    }
  }

  return (
    <View className="min-h-screen bg-slate-50">
      <ScrollView scrollY className="h-screen pb-safe">
        {/* 励志标语区域 - 清新蓝色系 */}
        <View className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 px-5 py-8">
          {/* 装饰线条 */}
          <View className="flex flex-row gap-1 mb-4">
            <View className="w-8 h-1 bg-cyan-400 rounded-full" />
            <View className="w-4 h-1 bg-cyan-300 rounded-full opacity-60" />
            <View className="w-2 h-1 bg-cyan-200 rounded-full opacity-40" />
          </View>
          
          {/* 标语主文 */}
          <View className="mb-3">
            <Text className="block text-white text-xl font-medium leading-relaxed">
              不用和别人比
            </Text>
          </View>
          <View className="flex flex-row items-center gap-2">
            <Text className="block text-cyan-300 text-lg font-normal">
              每天只赢自己一小时
            </Text>
            <Zap size={18} color="#22d3ee" />
          </View>
          
          {/* 励志标签 */}
          <View className="flex flex-row items-center gap-2 mt-5">
            <View className="bg-white bg-opacity-10 rounded-full px-3 py-1">
              <Text className="block text-cyan-200 text-xs">坚持</Text>
            </View>
            <View className="bg-white bg-opacity-10 rounded-full px-3 py-1">
              <Text className="block text-cyan-200 text-xs">突破</Text>
            </View>
            <View className="bg-white bg-opacity-10 rounded-full px-3 py-1">
              <Text className="block text-cyan-200 text-xs">成长</Text>
            </View>
          </View>
        </View>

        {/* 今日概况 */}
        <View className="px-4 -mt-3">
          <View className="bg-white rounded-2xl shadow-sm p-4 mb-4 border border-slate-100">
            <View className="flex items-center gap-2 mb-4">
              <View className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
              <Text className="block text-base font-semibold text-slate-800">今日概况</Text>
            </View>
            <View className="grid grid-cols-2 gap-3">
              <View className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-100">
                <Text className="block text-2xl font-bold text-blue-600">{stats.totalEquipment}</Text>
                <Text className="block text-xs text-blue-500 mt-1">器械总数</Text>
              </View>
              <View className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-100">
                <Text className="block text-2xl font-bold text-green-600">{stats.todayInspected}</Text>
                <Text className="block text-xs text-green-500 mt-1">今日已巡检</Text>
              </View>
              <View className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 border border-amber-100">
                <Text className="block text-2xl font-bold text-amber-600">{stats.todayPending}</Text>
                <Text className="block text-xs text-amber-500 mt-1">待维修</Text>
              </View>
              <View className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-100">
                <Text className="block text-2xl font-bold text-red-600">{stats.todayFault}</Text>
                <Text className="block text-xs text-red-500 mt-1">故障</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 快捷入口 */}
        <View className="px-4 mb-4">
          <View className="flex items-center gap-2 mb-3">
            <View className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
            <Text className="block text-sm font-semibold text-slate-800">快捷入口</Text>
          </View>
          <View className="grid grid-cols-3 gap-3">
            <View 
              className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center border border-slate-100"
              onClick={() => navigateTo('/pages/training/index')}
            >
              <View className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-2">
                <BookOpen size={24} color="#d97706" />
              </View>
              <Text className="block text-xs text-slate-700 font-medium">培训资料</Text>
            </View>
            <View 
              className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center border border-slate-100"
              onClick={() => navigateTo('/pages/inspection/index')}
            >
              <View className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-2">
                <Wrench size={24} color="#4f46e5" />
              </View>
              <Text className="block text-xs text-slate-700 font-medium">器械巡检</Text>
            </View>
            <View 
              className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center border border-slate-100"
              onClick={() => setShowFeedback(true)}
            >
              <View className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-2">
                <MessageSquare size={24} color="#9333ea" />
              </View>
              <Text className="block text-xs text-slate-700 font-medium">匿名反馈</Text>
            </View>
          </View>
        </View>

        {/* 未巡检器械 */}
        <View className="px-4 pb-6">
          <View className="flex items-center justify-between mb-3">
            <View className="flex items-center gap-2">
              <View className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
              <Text className="block text-sm font-semibold text-slate-800">未巡检器械</Text>
            </View>
            <View className="bg-slate-100 rounded-full px-3 py-1">
              <Text className="block text-xs text-slate-500 font-medium">{uninspectedList.length} 台</Text>
            </View>
          </View>
          
          {uninspectedList.length > 0 ? (
            <View className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
              {uninspectedList.map((item, index) => (
                <View 
                  key={item.id || index}
                  className={`p-4 flex items-center justify-between ${index < uninspectedList.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <View className="flex items-center gap-3">
                    <View className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                      item.area === 'A' ? 'bg-blue-100 text-blue-600' :
                      item.area === 'B' ? 'bg-green-100 text-green-600' :
                      item.area === 'C' ? 'bg-amber-100 text-amber-600' :
                      'bg-slate-100 text-slate-600'
                    }`}
                    >
                      {item.area || '?'}
                    </View>
                    <View>
                      <Text className="block text-sm text-slate-800 font-medium">{item.name}</Text>
                      <Text className="block text-xs text-slate-400">{item.area ? `${item.area}区` : '未分区'}</Text>
                    </View>
                  </View>
                  <View className="w-2 h-2 rounded-full bg-slate-300" />
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 flex flex-col items-center">
              <Text className="block text-slate-400 text-sm">今日巡检已完成</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <FeedbackSheet 
        open={showFeedback} 
        onClose={() => setShowFeedback(false)} 
      />
    </View>
  )
}

definePageConfig({
  navigationBarTitleText: '首页',
})
