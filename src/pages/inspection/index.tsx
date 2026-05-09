import { useState, useEffect, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Plus } from 'lucide-react-taro'
import { Network } from '@/network'

interface InspectionRecord {
  id: number
  equipment_name: string
  equipment_id: number
  area: string
  status: 'normal' | 'pending' | 'fault'
  remark: string
  wear_level: 'low' | 'medium' | 'high'
  inspector: string
  created_at: string
}

type FilterStatus = 'all' | 'normal' | 'pending' | 'fault'

export default function Inspection() {
  const [records, setRecords] = useState<InspectionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      const res = await Network.request({ url: '/api/inspection/today-list' })
      console.log('今日巡检记录接口返回:', res.data)
      if (res.data?.code === 200) {
        setRecords(res.data.data?.inspections || [])
      }
    } catch (err) {
      console.error('获取巡检记录失败', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecords()
    const handleReload = () => fetchRecords()
    Taro.eventCenter.on('reloadHome', handleReload)
    return () => {
      Taro.eventCenter.off('reloadHome', handleReload)
    }
  }, [fetchRecords])

  // 筛选记录：全部显示所有记录，状态筛选时每个器械只显示最新一条
  const filteredRecords = filterStatus === 'all' 
    ? records 
    : (() => {
        // 按器械分组，每组只保留最新一条
        const latestByEquipment: Record<string, typeof records[0]> = {}
        // 倒序遍历，确保最新的记录被保留
        const sortedRecords = [...records].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        for (const record of sortedRecords) {
          if (record.status === filterStatus) {
            if (!latestByEquipment[record.equipment_id]) {
              latestByEquipment[record.equipment_id] = record
            }
          }
        }
        return Object.values(latestByEquipment)
      })()

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'normal':
        return { label: '正常', color: 'bg-green-100 text-green-700' }
      case 'pending':
        return { label: '有磨损', color: 'bg-orange-100 text-orange-700' }
      case 'fault':
        return { label: '故障', color: 'bg-red-100 text-red-700' }
      default:
        return { label: '未知', color: 'bg-slate-100 text-slate-700' }
    }
  }

  const navigateTo = (path: string) => {
    if (path.startsWith('/')) {
      Taro.navigateTo({ url: path })
    }
  }

  return (
    <View className="min-h-screen bg-slate-50 pb-safe">
      <View className="bg-white px-4 py-4 border-b border-slate-100">
        <Text className="block text-xl font-bold text-slate-800">器械巡检</Text>
        <Text className="block text-sm text-slate-500 mt-1">每日器械巡检与维护记录</Text>
      </View>

      <View className="px-4 pb-3 pt-3">
        <View 
          className="bg-blue-500 rounded-lg py-3 px-4 flex items-center justify-center"
          onClick={() => navigateTo('/pages/inspection/add')}
        >
          <Plus size={18} color="#ffffff" />
          <Text className="ml-2 text-white font-medium">新增巡检记录</Text>
        </View>
      </View>

      <View className="px-4 pb-3">
        <View className="flex gap-2">
          {[
            { key: 'all', label: '全部' },
            { key: 'normal', label: '正常' },
            { key: 'pending', label: '有磨损' },
            { key: 'fault', label: '故障' }
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
              <Text className={`text-sm ${filterStatus === item.key ? 'text-white' : 'text-slate-600'}`}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="px-4 pb-3">
        <View className="bg-white rounded-lg p-4">
          <View className="flex justify-around">
            <View className="text-center">
              <Text className="block text-2xl font-bold text-slate-800">{records.length}</Text>
              <Text className="block text-xs text-slate-500 mt-1">全部记录</Text>
            </View>
            <View className="text-center">
              <Text className="block text-2xl font-bold text-green-600">
                {(() => {
                  const latestByEquipment: Record<string, typeof records[0]> = {}
                  for (const record of [...records].sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  )) {
                    if (!latestByEquipment[record.equipment_id]) {
                      latestByEquipment[record.equipment_id] = record
                    }
                  }
                  return Object.values(latestByEquipment).filter(r => r.status === 'normal').length
                })()}
              </Text>
              <Text className="block text-xs text-slate-500 mt-1">正常</Text>
            </View>
            <View className="text-center">
              <Text className="block text-2xl font-bold text-orange-600">
                {(() => {
                  const latestByEquipment: Record<string, typeof records[0]> = {}
                  for (const record of [...records].sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  )) {
                    if (!latestByEquipment[record.equipment_id]) {
                      latestByEquipment[record.equipment_id] = record
                    }
                  }
                  return Object.values(latestByEquipment).filter(r => r.status === 'pending').length
                })()}
              </Text>
              <Text className="block text-xs text-slate-500 mt-1">有磨损</Text>
            </View>
            <View className="text-center">
              <Text className="block text-2xl font-bold text-red-600">
                {(() => {
                  const latestByEquipment: Record<string, typeof records[0]> = {}
                  for (const record of [...records].sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  )) {
                    if (!latestByEquipment[record.equipment_id]) {
                      latestByEquipment[record.equipment_id] = record
                    }
                  }
                  return Object.values(latestByEquipment).filter(r => r.status === 'fault').length
                })()}
              </Text>
              <Text className="block text-xs text-slate-500 mt-1">故障</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-4 pb-8">
        {loading ? (
          <View className="py-8 text-center">
            <Text className="block text-slate-400">加载中...</Text>
          </View>
        ) : filteredRecords.length === 0 ? (
          <View className="py-8 text-center">
            <Text className="block text-slate-400">暂无巡检记录</Text>
          </View>
        ) : (
          filteredRecords.map(record => {
            const statusConfig = getStatusConfig(record.status)
            // 获取磨损程度标签
            const getWearLevelLabel = (level: string) => {
              switch (level) {
                case 'low': return '轻微磨损'
                case 'medium': return '明显磨损'
                case 'high': return '严重磨损'
                default: return ''
              }
            }
            return (
              <View key={record.id} className="bg-white rounded-lg p-4 mb-3">
                <View className="flex justify-between items-start">
                  <View>
                    <Text className="block text-base font-medium text-slate-800">
                      {record.equipment_name}
                    </Text>
                    <Text className="block text-sm text-slate-500 mt-1">
                      {record.area}区 | {record.inspector}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full text-xs ${statusConfig.color}`}>
                    <Text className="text-xs">{statusConfig.label}</Text>
                  </View>
                </View>
                {/* 磨损程度标签 */}
                {record.status === 'pending' && record.wear_level && (
                  <View className="mt-2 inline-flex items-center px-2 py-1 rounded-full bg-orange-50 border border-orange-200">
                    <Text className="text-xs text-orange-600">{getWearLevelLabel(record.wear_level)}</Text>
                  </View>
                )}
                {/* 备注信息 */}
                {record.remark && (
                  <View className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100">
                    <Text className="block text-xs text-red-600">
                      <Text className="block text-red-700 font-medium">故障说明：</Text>
                      <Text className="block mt-1">{record.remark}</Text>
                    </Text>
                  </View>
                )}
                <Text className="block text-xs text-slate-400 mt-2">
                  {new Date(record.created_at).toLocaleString('zh-CN')}
                </Text>
              </View>
            )
          })
        )}
      </View>
    </View>
  )
}
