import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Network } from '@/network'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Wrench, Plus, Search, Clock, ArrowRight } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import './index.css'

interface Inspection {
  id: number
  equipment_name: string
  status: 'normal' | 'pending' | 'fault'
  remark: string
  inspector: string
  created_at: string
}

export default function InspectionList() {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchInspections()
  }, [])

  const fetchInspections = async () => {
    try {
      setLoading(true)
      const res = await Network.request({ url: '/api/inspection/list' })
      console.log('巡检记录列表响应:', res.data)
      const list = res.data?.data?.inspections || []
      setInspections(list)
    } catch (error) {
      console.error('获取巡检记录失败:', error)
      Taro.showToast({ title: '获取记录失败', icon: 'none' })
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
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const filteredInspections = inspections.filter(i => {
    const matchSearch = i.equipment_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                        i.inspector.toLowerCase().includes(searchKeyword.toLowerCase())
    const matchStatus = statusFilter === 'all' || i.status === statusFilter
    return matchSearch && matchStatus
  })

  const statusOptions = [
    { value: 'all', label: '全部' },
    { value: 'normal', label: '正常' },
    { value: 'pending', label: '待维修' },
    { value: 'fault', label: '故障' }
  ]

  return (
    <View className="min-h-screen bg-slate-50 pb-safe">
      <ScrollView className="p-4 pb-safe" scrollY>
        {/* 搜索栏 */}
        <View className="mb-4">
          <View className="bg-white rounded-xl px-4 py-3 flex items-center gap-3">
            <Search size={18} color="#94a3b8" />
            <Input
              className="flex-1 bg-transparent border-none p-0"
              placeholder="搜索器械或检查人..."
              value={searchKeyword}
              onInput={(e) => setSearchKeyword(e.detail.value)}
            />
          </View>
        </View>

        {/* 状态筛选 */}
        <View className="flex gap-2 mb-4 overflow-x-auto">
          {statusOptions.map((option) => (
            <View
              key={option.value}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                statusFilter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600'
              }`}
              onClick={() => setStatusFilter(option.value)}
            >
              <Text className={`block text-sm ${statusFilter === option.value ? 'text-white' : 'text-slate-600'}`}>
                {option.label}
              </Text>
            </View>
          ))}
        </View>

        {/* 新增按钮 */}
        <Button 
          className="w-full mb-4 bg-blue-600 hover:bg-blue-700" 
          onClick={() => Taro.navigateTo({ url: '/pages/inspection/add' })}
        >
          <Plus size={18} color="#fff" />
          <Text className="ml-2">新增巡检记录</Text>
        </Button>

        {/* 巡检记录列表 */}
        {loading ? (
          <View className="text-center py-12">
            <Text className="block text-slate-400">加载中...</Text>
          </View>
        ) : filteredInspections.length > 0 ? (
          <View className="space-y-3">
            {filteredInspections.map((inspection) => (
              <Card 
                key={inspection.id} 
                onClick={() => Taro.navigateTo({ url: `/pages/inspection/detail?id=${inspection.id}` })}
              >
                <CardContent className="p-4">
                  <View className="flex items-start justify-between">
                    <View className="flex items-start gap-3 flex-1">
                      <View className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                        <Wrench size={24} color="#f97316" />
                      </View>
                      <View className="flex-1 min-w-0">
                        <Text className="block text-base font-medium text-slate-800">{inspection.equipment_name}</Text>
                        {inspection.remark && (
                          <Text className="block text-sm text-slate-500 mt-1 truncate">{inspection.remark}</Text>
                        )}
                        <View className="flex items-center gap-3 mt-2">
                          <View className="flex items-center gap-1">
                            <Clock size={12} color="#94a3b8" />
                            <Text className="block text-xs text-slate-400">{formatDate(inspection.created_at)}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <View className="flex flex-col items-end gap-2">
                      {getStatusBadge(inspection.status)}
                      <ArrowRight size={16} color="#94a3b8" />
                    </View>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Wrench size={48} color="#cbd5e1" />
              <Text className="block text-slate-400 mt-3">暂无巡检记录</Text>
              <Text className="block text-sm text-slate-400 mt-1">点击上方按钮添加巡检记录</Text>
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </View>
  )
}
