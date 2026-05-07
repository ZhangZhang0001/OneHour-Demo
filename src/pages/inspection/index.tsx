import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import { Wrench, Plus, CircleCheck, Clock, TriangleAlert, ArrowRight } from 'lucide-react-taro'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Network } from '@/network'
import Taro from '@tarojs/taro'

interface InspectionRecord {
  id: number
  equipment_name: string
  equipment_id: number
  area: string
  status: 'normal' | 'pending' | 'broken'
  remark: string
  inspector: string
  created_at: string
}

type FilterStatus = 'all' | 'normal' | 'pending' | 'broken'

export default function Inspection() {
  const router = useRouter()
  const [records, setRecords] = useState<InspectionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const res = await Network.request({ url: '/api/inspection/list' })
      if (res.data?.code === 200) {
        setRecords(res.data.data || [])
      }
    } catch (err) {
      console.error('获取巡检记录失败', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = filterStatus === 'all' 
    ? records 
    : records.filter(r => r.status === filterStatus)

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'normal':
        return { label: '正常', color: 'bg-green-100 text-green-700', icon: CircleCheck, iconColor: '#22c55e' }
      case 'pending':
        return { label: '待维修', color: 'bg-orange-100 text-orange-700', icon: Clock, iconColor: '#f97316' }
      case 'broken':
        return { label: '故障', color: 'bg-red-100 text-red-700', icon: TriangleAlert, iconColor: '#ef4444' }
      default:
        return { label: '未知', color: 'bg-slate-100 text-slate-700', icon: TriangleAlert, iconColor: '#64748b' }
    }
  }

  const navigateTo = (path: string) => {
    if (path.startsWith('/')) {
      router.push(path)
    }
  }

  return (
    <View className="min-h-screen bg-slate-50 pb-safe">
      {/* 顶部标题 */}
      <View className="bg-white px-4 py-4 border-b border-slate-100">
        <Text className="block text-xl font-bold text-slate-800">器械巡检</Text>
        <Text className="block text-sm text-slate-500 mt-1">每日器械巡检与维护记录</Text>
      </View>

      {/* 添加按钮 */}
      <View className="px-4 py-3">
        <Button className="w-full" onClick={() => navigateTo('/pages/inspection/add')}>
          <Plus size={18} />
          <Text className="ml-2">新增巡检记录</Text>
        </Button>
      </View>

      {/* 筛选标签 */}
      <View className="px-4 pb-3">
        <View className="flex gap-2">
          {[
            { key: 'all', label: '全部' },
            { key: 'normal', label: '正常' },
            { key: 'pending', label: '待维修' },
            { key: 'broken', label: '故障' }
          ].map(item => (
            <View 
              key={item.key}
              className={`px-4 py-2 rounded-full text-sm ${
                filterStatus === item.key 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-slate-600'
              }`}
              onClick={() => setFilterStatus(item.key as FilterStatus)}
            >
              {item.label}
            </View>
          ))}
        </View>
      </View>

      {/* 记录列表 */}
      <View className="px-4 pb-4">
        {loading ? (
          <View className="bg-white rounded-xl p-8 text-center">
            <Text className="block text-slate-500">加载中...</Text>
          </View>
        ) : filteredRecords.length > 0 ? (
          filteredRecords.map((record) => {
            const config = getStatusConfig(record.status)
            const StatusIcon = config.icon
            return (
              <View 
                key={record.id}
                className="bg-white rounded-xl mb-3 overflow-hidden"
                onClick={() => navigateTo(`/pages/inspection/detail?id=${record.id}`)}
              >
                <View className="p-4">
                  <View className="flex items-start gap-3">
                    <View className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Wrench size={24} color="#f97316" />
                    </View>
                    <View className="flex-1">
                      <View className="flex items-center gap-2">
                        <Text className="block text-base font-medium text-slate-800">{record.equipment_name}</Text>
                        <View className={`px-2 py-0.5 rounded text-xs ${config.color}`}>
                          {config.label}
                        </View>
                      </View>
                      <Text className="block text-sm text-slate-500 mt-1">
                        区域：{record.area}区 | 检查人：{record.inspector}
                      </Text>
                      {record.remark && (
                        <Text className="block text-sm text-slate-400 mt-1 line-clamp-1">
                          备注：{record.remark}
                        </Text>
                      )}
                      <Text className="block text-xs text-slate-400 mt-2">
                        {new Date(record.created_at).toLocaleDateString('zh-CN')}
                      </Text>
                    </View>
                    <ArrowRight size={20} color="#94a3b8" />
                  </View>
                </View>
              </View>
            )
          })
        ) : (
          <View className="bg-white rounded-xl p-8 text-center">
            <Wrench size={48} color="#cbd5e1" />
            <Text className="block text-slate-500 mt-3">暂无巡检记录</Text>
            <Text className="block text-sm text-slate-400 mt-1">点击上方按钮新增巡检记录</Text>
          </View>
        )}
      </View>

      {/* 底部安全区域 */}
      <View className="h-safe" />
    </View>
  )
}
