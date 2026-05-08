import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { User, Building2, Phone, Info, MessageSquare, ClipboardList, ArrowRight } from 'lucide-react-taro'
import { Network } from '@/network'

export default function Profile() {
  const [feedbackCount, setFeedbackCount] = useState(0)

  useEffect(() => {
    fetchFeedbackCount()
  }, [])

  const fetchFeedbackCount = async () => {
    try {
      const feedbackRes = await Network.request({ url: '/api/feedback/count' })
      if (feedbackRes.data?.code === 200) {
        setFeedbackCount(feedbackRes.data.data?.count || 0)
      }
    } catch (err) {
      console.error('获取统计数据失败', err)
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

  return (
    <View className="min-h-screen bg-slate-50 pb-safe">
      <View className="p-4">
        {/* 用户信息卡片 */}
        <Card className="mb-4">
          <CardContent className="p-6">
            <View className="flex items-center gap-4">
              <Avatar className="w-20 h-20 bg-blue-100">
                <User size={40} color="#1e40af" />
              </Avatar>
              <View>
                <Text className="block text-xl font-semibold text-slate-800">健身房员工</Text>
                <Text className="block text-sm text-slate-500 mt-1">管理员</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* 数据管理入口 */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <Text className="block text-base font-medium text-slate-800 mb-4">数据管理</Text>
            
            <View className="space-y-3">
              {/* 匿名反馈管理 */}
              <View 
                className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl"
                onClick={() => navigateTo('/pages/feedback/index')}
              >
                <View className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <MessageSquare size={20} color="#9333ea" />
                </View>
                <View className="flex-1">
                  <Text className="block text-sm font-medium text-slate-800">匿名反馈</Text>
                  <Text className="block text-xs text-slate-500">查看员工提交的建议和反馈</Text>
                </View>
                <View className="flex items-center gap-2">
                  <View className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                    {feedbackCount} 条
                  </View>
                  <ArrowRight size={18} color="#94a3b8" />
                </View>
              </View>

              <Separator />

              {/* 巡检记录历史 */}
              <View 
                className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl"
                onClick={() => navigateTo('/pages/inspection/history')}
              >
                <View className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <ClipboardList size={20} color="#4f46e5" />
                </View>
                <View className="flex-1">
                  <Text className="block text-sm font-medium text-slate-800">巡检记录</Text>
                  <Text className="block text-xs text-slate-500">查看历史巡检数据和统计报表</Text>
                </View>
                <ArrowRight size={18} color="#94a3b8" />
              </View>
            </View>
          </CardContent>
        </Card>

        {/* 健身房信息 */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <Text className="block text-base font-medium text-slate-800 mb-4">健身房信息</Text>
            
            <View className="space-y-3">
              <View className="flex items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Building2 size={16} color="#1e40af" />
                </View>
                <View className="flex-1">
                  <Text className="block text-xs text-slate-400">健身房名称</Text>
                  <Text className="block text-sm text-slate-800">GYMSIDE 健身工作室</Text>
                </View>
              </View>
              
              <Separator />
              
              <View className="flex items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Phone size={16} color="#1e40af" />
                </View>
                <View className="flex-1">
                  <Text className="block text-xs text-slate-400">联系电话</Text>
                  <Text className="block text-sm text-slate-800">400-XXX-XXXX</Text>
                </View>
              </View>
              
              <Separator />
              
              <View className="flex items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Info size={16} color="#1e40af" />
                </View>
                <View className="flex-1">
                  <Text className="block text-xs text-slate-400">版本信息</Text>
                  <Text className="block text-sm text-slate-800">v1.0.0</Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>
    </View>
  )
}
