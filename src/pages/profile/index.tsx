import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Dumbbell, Phone, Settings, Bell, FileText, Info, ChevronRight } from 'lucide-react-taro'

interface GymInfo {
  name: string
  phone: string
}

export default function Profile() {
  const [gymInfo] = useState<GymInfo>({
    name: 'ONE HOUR 24无人自助铁馆',
    phone: '18726269055',
  })
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    const userData = Taro.getStorageSync('userInfo')
    if (userData) {
      setUserInfo(userData)
    }
  }, [])

  const menuItems = [
    { icon: Bell, label: '消息通知', color: 'bg-blue-50', iconColor: '#3b82f6' },
    { icon: FileText, label: '帮助与反馈', color: 'bg-green-50', iconColor: '#16a34a' },
    { icon: Settings, label: '设置', color: 'bg-slate-50', iconColor: '#64748b' },
    { icon: Info, label: '关于我们', color: 'bg-purple-50', iconColor: '#9333ea' },
  ]

  return (
    <View className="min-h-screen bg-slate-50 pb-safe">
      {/* 顶部区域 */}
      <View className="bg-white px-5 pt-12 pb-6">
        <View className="flex items-center gap-4">
          <View className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
            {userInfo?.avatar ? (
              <View className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${userInfo.avatar})` }} />
            ) : (
              <Dumbbell size={28} color="#64748b" />
            )}
          </View>
          <View>
            <Text className="block text-lg font-semibold text-slate-800">{userInfo?.name || '健身房员工'}</Text>
            <Text className="block text-sm text-slate-400 mt-1">员工</Text>
          </View>
        </View>
      </View>

      {/* 健身房信息 */}
      <View className="px-4 mt-4">
        <View className="bg-white rounded-2xl p-5">
          <Text className="block text-sm font-medium text-slate-500 mb-4">健身房信息</Text>
          
          <View className="flex items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Dumbbell size={20} color="#ea580c" />
            </View>
            <View className="flex-1">
              <Text className="block text-xs text-slate-400 mb-1">场馆名称</Text>
              <Text className="block text-sm text-slate-800 font-medium">{gymInfo.name}</Text>
            </View>
          </View>
          
          <View className="flex items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Phone size={20} color="#16a34a" />
            </View>
            <View className="flex-1">
              <Text className="block text-xs text-slate-400 mb-1">联系电话</Text>
              <Text className="block text-sm text-slate-800 font-medium">{gymInfo.phone}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 功能菜单 */}
      <View className="px-4 mt-4">
        <View className="bg-white rounded-2xl overflow-hidden">
          {menuItems.map((item, index) => (
            <View 
              key={item.label}
              className={`flex items-center justify-between px-5 py-4 ${index < menuItems.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <View className="flex items-center gap-3">
                <View className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.color}`}>
                  <item.icon size={18} color={item.iconColor} />
                </View>
                <Text className="block text-sm text-slate-700">{item.label}</Text>
              </View>
              <ChevronRight size={18} color="#cbd5e1" />
            </View>
          ))}
        </View>
      </View>

      {/* 底部版权 */}
      <View className="px-4 py-8 text-center">
        <Text className="block text-xs text-slate-400">{gymInfo.name}</Text>
      </View>
    </View>
  )
}

definePageConfig({
  navigationBarTitleText: '我的',
})
