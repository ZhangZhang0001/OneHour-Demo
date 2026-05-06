import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Network } from '@/network'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Wrench, Plus, ArrowRight, Clock } from 'lucide-react-taro'
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

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 获取培训资料数量
      const trainingRes = await Network.request({ url: '/api/training/count' })
      console.log('培训资料数量响应:', trainingRes.data)
      const trainingCount = trainingRes.data?.data?.count || 0

      // 获取待巡检数量
      const pendingRes = await Network.request({ url: '/api/inspection/pending-count' })
      console.log('待巡检数量响应:', pendingRes.data)
      const pendingCount = pendingRes.data?.data?.count || 0

      // 获取最近巡检记录
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

        {/* 最近巡检记录 */}
        <View className="flex items-center justify-between mb-3">
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
    </View>
  )
}
