import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { BookOpen, Wrench, MessageSquare, Sparkles } from 'lucide-react-taro'
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
    <View className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <ScrollView scrollY className="h-screen pb-safe">
        {/* 励志标语区域 */}
        <View className="bg-gradient-to-br from-orange-500 via-orange-400 to-red-500 px-5 py-8 relative overflow-hidden">
          {/* 装饰元素 */}
          <View className="absolute top-4 right-4 opacity-20">
            <Sparkles size={80} color="#fff" />
          </View>
          <View className="absolute bottom-2 left-4 opacity-10">
            <Sparkles size={60} color="#fff" />
          </View>
          
          {/* 引号装饰 */}
          <Text className="block text-6xl text-white opacity-30 font-serif leading-none mb-1">&ldquo;</Text>
          
          {/* 标语主文 */}
          <View className="relative z-10">
            <Text className="block text-white text-xl font-bold leading-relaxed mb-2 drop-shadow-lg">
              不用和别人比
            </Text>
            <Text className="block text-yellow-200 text-lg font-semibold leading-relaxed mb-1">
              每天只赢自己一小时
            </Text>
          </View>
          
          {/* 励志小标签 */}
          <View className="flex flex-row items-center gap-2 mt-4">
            <View className="bg-white bg-opacity-20 rounded-full px-3 py-1">
              <Text className="block text-white text-xs">坚持 · 突破 · 成长</Text>
            </View>
          </View>
        </View>

        {/* 今日概况 */}
        <View className="px-4 -mt-3">
          <View className="bg-white rounded-2xl shadow-lg p-4 mb-4 border border-slate-100">
            <View className="flex items-center gap-2 mb-4">
              <View className="w-1 h-5 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
              <Text className="block text-base font-bold text-slate-800">今日概况</Text>
            </View>
            <View className="grid grid-cols-2 gap-3">
              <View className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                <Text className="block text-2xl font-black text-blue-600">{stats.totalEquipment}</Text>
                <Text className="block text-xs text-blue-500 mt-1 font-medium">器械总数</Text>
              </View>
              <View className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                <Text className="block text-2xl font-black text-green-600">{stats.todayInspected}</Text>
                <Text className="block text-xs text-green-500 mt-1 font-medium">今日已巡检</Text>
              </View>
              <View className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
                <Text className="block text-2xl font-black text-orange-600">{stats.todayPending}</Text>
                <Text className="block text-xs text-orange-500 mt-1 font-medium">待维修</Text>
              </View>
              <View className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
                <Text className="block text-2xl font-black text-red-600">{stats.todayFault}</Text>
                <Text className="block text-xs text-red-500 mt-1 font-medium">故障</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 快捷入口 */}
        <View className="px-4 mb-4">
          <View className="flex items-center gap-2 mb-3">
            <View className="w-1 h-5 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
            <Text className="block text-sm font-bold text-slate-800">快捷入口</Text>
          </View>
          <View className="grid grid-cols-3 gap-3">
            <View 
              className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center border border-slate-100"
              onClick={() => navigateTo('/pages/training/index')}
            >
              <View className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mb-2 shadow-sm">
                <BookOpen size={26} color="#d97706" />
              </View>
              <Text className="block text-xs text-slate-700 font-semibold">培训资料</Text>
            </View>
            <View 
              className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center border border-slate-100"
              onClick={() => navigateTo('/pages/inspection/index')}
            >
              <View className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center mb-2 shadow-sm">
                <Wrench size={26} color="#4f46e5" />
              </View>
              <Text className="block text-xs text-slate-700 font-semibold">器械巡检</Text>
            </View>
            <View 
              className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center border border-slate-100"
              onClick={() => setShowFeedback(true)}
            >
              <View className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-2 shadow-sm">
                <MessageSquare size={26} color="#9333ea" />
              </View>
              <Text className="block text-xs text-slate-700 font-semibold">匿名反馈</Text>
            </View>
          </View>
        </View>

        {/* 未巡检器械 */}
        <View className="px-4 pb-6">
          <View className="flex items-center justify-between mb-3">
            <View className="flex items-center gap-2">
              <View className="w-1 h-5 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
              <Text className="block text-sm font-bold text-slate-800">未巡检器械</Text>
            </View>
            <View className="bg-orange-100 rounded-full px-3 py-1">
              <Text className="block text-xs text-orange-600 font-semibold">{uninspectedList.length} 台</Text>
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
                    <View className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                      item.area === 'A' ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white' :
                      item.area === 'B' ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' :
                      item.area === 'C' ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                      'bg-slate-200 text-slate-600'
                    }`}
                    >
                      {item.area || '?'}
                    </View>
                    <View>
                      <Text className="block text-sm text-slate-800 font-medium">{item.name}</Text>
                      <Text className="block text-xs text-slate-400">{item.area ? `${item.area}区` : '未分区'}</Text>
                    </View>
                  </View>
                  <View className="w-2 h-2 rounded-full bg-orange-400" />
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
