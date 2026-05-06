import { View, Text } from '@tarojs/components'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { User, Building2, Phone, Info } from 'lucide-react-taro'
import './index.css'

export default function Profile() {
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
                  <Text className="block text-sm text-slate-800">XX 健身工作室</Text>
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

        {/* 功能说明 */}
        <Card>
          <CardContent className="p-4">
            <Text className="block text-base font-medium text-slate-800 mb-4">功能说明</Text>
            
            <View className="space-y-3">
              <View className="p-3 bg-slate-50 rounded-xl">
                <Text className="block text-sm font-medium text-slate-700 mb-1">培训资料管理</Text>
                <Text className="block text-xs text-slate-500">管理教练培训手册和学习资料，支持上传、查看、下载等功能</Text>
              </View>
              
              <View className="p-3 bg-slate-50 rounded-xl">
                <Text className="block text-sm font-medium text-slate-700 mb-1">器械巡检记录</Text>
                <Text className="block text-xs text-slate-500">记录健身房器械的巡检情况，及时发现并处理设备故障</Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>
    </View>
  )
}
