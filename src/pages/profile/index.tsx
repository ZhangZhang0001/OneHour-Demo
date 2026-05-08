import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Dumbbell, Phone, MapPin, Clock, ChevronRight, LogOut } from 'lucide-react-taro'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface GymInfo {
  name: string
  phone: string
  address: string
  hours: string
}

export default function Profile() {
  const [gymInfo] = useState<GymInfo>({
    name: 'ONE HOUR 24无人自助铁馆',
    phone: '18726269055',
    address: '安徽省蚌埠市蚌山区',
    hours: '24小时营业',
  })
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    const userData = Taro.getStorageSync('userInfo')
    if (userData) {
      setUserInfo(userData)
    }
  }, [])

  return (
    <View className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-safe">
      {/* 顶部背景 */}
      <View className="bg-gradient-to-br from-orange-500 via-orange-400 to-red-500 px-5 pt-10 pb-16 relative overflow-hidden">
        {/* 装饰 */}
        <View className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-10 -mt-10" />
        <View className="absolute bottom-0 left-0 w-60 h-60 bg-white opacity-5 rounded-full -ml-20 -mb-20" />
        
        {/* 员工信息卡片 */}
        <View className="relative z-10">
          <View className="flex items-center gap-4">
            <View className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white to-orange-100 shadow-lg flex items-center justify-center">
              {userInfo?.avatar ? (
                <Avatar className="w-full h-full rounded-2xl">
                  <AvatarImage src={userInfo.avatar} />
                  <AvatarFallback className="rounded-2xl">
                    <Dumbbell size={32} color="#ea580c" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Dumbbell size={36} color="#ea580c" />
              )}
            </View>
            <View className="flex-1">
              <Text className="block text-white text-xl font-bold mb-1">{userInfo?.name || '健身房员工'}</Text>
              <Badge variant="secondary" className="bg-white bg-opacity-20 text-white border-0">
                员工
              </Badge>
            </View>
          </View>
        </View>
      </View>

      {/* 健身房信息卡片 */}
      <View className="px-4 -mt-10">
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {/* 标题 */}
            <View className="bg-gradient-to-r from-orange-500 to-red-500 px-5 py-4">
              <View className="flex items-center gap-2">
                <View className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <Dumbbell size={20} color="#fff" />
                </View>
                <View>
                  <Text className="block text-white text-base font-bold">健身房信息</Text>
                  <Text className="block text-white text-opacity-80 text-xs">Gym Information</Text>
                </View>
              </View>
            </View>
            
            {/* 信息列表 */}
            <View className="bg-white px-5 py-4">
              <View className="flex items-center gap-4 py-3 border-b border-slate-100">
                <View className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Dumbbell size={20} color="#ea580c" />
                </View>
                <View className="flex-1">
                  <Text className="block text-xs text-slate-400 mb-1">场馆名称</Text>
                  <Text className="block text-sm text-slate-800 font-semibold">{gymInfo.name}</Text>
                </View>
              </View>
              
              <View className="flex items-center gap-4 py-3 border-b border-slate-100">
                <View className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <Phone size={20} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="block text-xs text-slate-400 mb-1">联系电话</Text>
                  <Text className="block text-sm text-slate-800 font-semibold">{gymInfo.phone}</Text>
                </View>
              </View>
              
              <View className="flex items-center gap-4 py-3 border-b border-slate-100">
                <View className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <MapPin size={20} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <Text className="block text-xs text-slate-400 mb-1">场馆地址</Text>
                  <Text className="block text-sm text-slate-800 font-semibold">{gymInfo.address}</Text>
                </View>
              </View>
              
              <View className="flex items-center gap-4 py-3">
                <View className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Clock size={20} color="#9333ea" />
                </View>
                <View className="flex-1">
                  <Text className="block text-xs text-slate-400 mb-1">营业时间</Text>
                  <Text className="block text-sm text-slate-800 font-semibold">{gymInfo.hours}</Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>

      {/* 功能入口 */}
      <View className="px-4 mt-5">
        <Card className="shadow-md border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <View className="bg-white">
              <View 
                className="flex items-center justify-between px-5 py-4 border-b border-slate-100"
              >
                <View className="flex items-center gap-3">
                  <View className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <ChevronRight size={18} color="#4f46e5" />
                  </View>
                  <Text className="block text-sm text-slate-700">意见反馈</Text>
                </View>
                <ChevronRight size={18} color="#94a3b8" />
              </View>
              
              <View 
                className="flex items-center justify-between px-5 py-4 border-b border-slate-100"
              >
                <View className="flex items-center gap-3">
                  <View className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <ChevronRight size={18} color="#d97706" />
                  </View>
                  <Text className="block text-sm text-slate-700">关于我们</Text>
                </View>
                <ChevronRight size={18} color="#94a3b8" />
              </View>
              
              <View className="flex items-center justify-between px-5 py-4">
                <View className="flex items-center gap-3">
                  <View className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <LogOut size={18} color="#dc2626" />
                  </View>
                  <Text className="block text-sm text-red-600">退出登录</Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>

      {/* 底部版权 */}
      <View className="px-4 py-8 text-center">
        <Text className="block text-xs text-slate-400">ONE HOUR 24无人自助铁馆</Text>
        <Text className="block text-xs text-slate-400 mt-1">© 2024 All Rights Reserved</Text>
      </View>
    </View>
  )
}

definePageConfig({
  navigationBarTitleText: '我的',
})
