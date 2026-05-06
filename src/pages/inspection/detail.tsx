import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { Network } from '@/network'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wrench, Clock, User } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import './detail.css'

interface InspectionDetail {
  id: number
  equipment_name: string
  status: 'normal' | 'pending' | 'fault'
  remark: string
  inspector: string
  created_at: string
}

export default function InspectionDetail() {
  const [detail, setDetail] = useState<InspectionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { id } = Taro.getCurrentInstance().router?.params || {}
    if (id) {
      fetchDetail(Number(id))
    }
  }, [])

  const fetchDetail = async (id: number) => {
    try {
      setLoading(true)
      const res = await Network.request({
        url: '/api/inspection/detail',
        method: 'POST',
        data: { id }
      })
      console.log('巡检详情响应:', res.data)
      if (res.data?.data?.inspection) {
        setDetail(res.data.data.inspection)
      }
    } catch (error) {
      console.error('获取详情失败:', error)
      Taro.showToast({ title: '获取详情失败', icon: 'none' })
    } finally {
      setLoading(false)
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
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  if (loading) {
    return (
      <View className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Text className="block text-slate-400">加载中...</Text>
      </View>
    )
  }

  if (!detail) {
    return (
      <View className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Text className="block text-slate-400">未找到记录</Text>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-slate-50 p-4">
      <Card>
        <CardContent className="p-4">
          <View className="flex items-start gap-4 mb-4">
            <View className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center">
              <Wrench size={32} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-semibold text-slate-800">{detail.equipment_name}</Text>
              <View className="mt-2">
                {getStatusBadge(detail.status)}
              </View>
            </View>
          </View>

          <View className="border-t border-slate-100 pt-4 space-y-3">
            <View className="flex items-center gap-3">
              <User size={16} color="#94a3b8" />
              <Text className="block text-sm text-slate-600">检查人：{detail.inspector}</Text>
            </View>
            <View className="flex items-center gap-3">
              <Clock size={16} color="#94a3b8" />
              <Text className="block text-sm text-slate-600">巡检时间：{formatDate(detail.created_at)}</Text>
            </View>
            {detail.remark && (
              <View className="mt-4 p-3 bg-slate-50 rounded-xl">
                <Text className="block text-sm text-slate-500">备注说明</Text>
                <Text className="block text-base text-slate-800 mt-1">{detail.remark}</Text>
              </View>
            )}
          </View>
        </CardContent>
      </Card>
    </View>
  )
}
