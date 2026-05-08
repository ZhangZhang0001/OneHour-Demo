import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ArrowLeft, ClipboardList, CircleCheck, Clock, TriangleAlert } from 'lucide-react-taro'
import { Network } from '@/network'

interface InspectionRecord {
  id: number
  equipment_name: string
  equipment_id: number
  area: string
  status: 'normal' | 'pending' | 'fault'
  remark: string
  inspector: string
  created_at: string
  inspection_date: string
}

interface DailyStats {
  date: string
  total: number
  normal: number
  pending: number
  fault: number
  inspectors: string[]
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  normal: { label: '正常', color: 'text-green-600', bgColor: 'bg-green-100' },
  pending: { label: '待维修', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  fault: { label: '故障', color: 'text-red-600', bgColor: 'bg-red-100' },
}

export default function InspectionHistory() {
  const [records, setRecords] = useState<InspectionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    fetchAllRecords()
  }, [])

  const fetchAllRecords = async () => {
    try {
      setLoading(true)
      // 获取所有巡检记录
      const res = await Network.request({ url: '/api/inspection/list' })
      if (res.data?.code === 200) {
        const list = res.data.data?.inspections || res.data.data || []
        setRecords(list)
        
        // 按日期分组统计
        const statsMap = new Map<string, DailyStats>()
        
        list.forEach((record: InspectionRecord) => {
          const date = record.inspection_date || record.created_at?.split('T')[0]
          if (!date) return
          
          if (!statsMap.has(date)) {
            statsMap.set(date, {
              date,
              total: 0,
              normal: 0,
              pending: 0,
              fault: 0,
              inspectors: [],
            })
          }
          
          const stats = statsMap.get(date)!
          stats.total++
          
          if (record.status === 'normal') stats.normal++
          else if (record.status === 'pending') stats.pending++
          else if (record.status === 'fault') stats.fault++
          
          if (record.inspector && !stats.inspectors.includes(record.inspector)) {
            stats.inspectors.push(record.inspector)
          }
        })
        
        // 转换为数组并按日期倒序
        const statsArray = Array.from(statsMap.values())
        statsArray.sort((a, b) => b.date.localeCompare(a.date))
        
        setDailyStats(statsArray)
        
        // 默认选中今天
        const today = new Date().toISOString().split('T')[0]
        const todayStats = statsArray.find(s => s.date === today)
        if (todayStats) {
          setSelectedDate(today)
        } else if (statsArray.length > 0) {
          setSelectedDate(statsArray[0].date)
        }
      }
    } catch (err) {
      console.error('获取巡检记录失败', err)
      Taro.showToast({ title: '获取数据失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = selectedDate
    ? records.filter(r => (r.inspection_date || r.created_at?.split('T')[0]) === selectedDate)
    : []

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (dateStr === today.toISOString().split('T')[0]) return '今天'
    if (dateStr === yesterday.toISOString().split('T')[0]) return '昨天'
    
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig.normal
  }

  return (
    <View className="min-h-screen bg-slate-50 pb-safe">
      {/* 顶部导航 */}
      <View className="bg-white px-4 py-3 flex items-center gap-3 border-b border-slate-100">
        <View 
          className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"
          onClick={() => Taro.navigateBack()}
        >
          <ArrowLeft size={20} color="#374151" />
        </View>
        <Text className="block text-lg font-medium text-slate-800">巡检记录</Text>
      </View>

      {loading ? (
        <View className="px-4 py-8">
          <View className="bg-white rounded-xl p-8 text-center">
            <Text className="block text-slate-500">加载中...</Text>
          </View>
        </View>
      ) : (
        <>
          {/* 日期选择器 */}
          <View className="px-4 py-3 bg-white border-b border-slate-100">
            <Text className="block text-xs text-slate-400 mb-2">选择日期</Text>
            <View className="flex gap-2 overflow-x-auto pb-1">
              {dailyStats.map(stat => (
                <View 
                  key={stat.date}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0 ${
                    selectedDate === stat.date
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                  onClick={() => setSelectedDate(stat.date)}
                >
                  {formatDate(stat.date)} ({stat.total})
                </View>
              ))}
            </View>
          </View>

          {/* 选中日期的统计 */}
          {selectedDate && dailyStats.find(s => s.date === selectedDate) && (
            <View className="px-4 py-3">
              <View className="bg-white rounded-xl p-4">
                <View className="flex items-center justify-between mb-3">
                  <Text className="block text-sm font-medium text-slate-800">
                    {selectedDate === new Date().toISOString().split('T')[0] ? '今日' : selectedDate} 巡检统计
                  </Text>
                  <View className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock size={12} color="#94a3b8" />
                    <Text>{dailyStats.find(s => s.date === selectedDate)?.inspectors.join('、') || '暂无'}</Text>
                  </View>
                </View>
                
                <View className="grid grid-cols-4 gap-2">
                  <View className="bg-indigo-50 rounded-lg p-2 text-center">
                    <Text className="block text-lg font-bold text-indigo-600">
                      {dailyStats.find(s => s.date === selectedDate)?.total || 0}
                    </Text>
                    <Text className="block text-xs text-indigo-500">总计</Text>
                  </View>
                  <View className="bg-green-50 rounded-lg p-2 text-center">
                    <Text className="block text-lg font-bold text-green-600">
                      {dailyStats.find(s => s.date === selectedDate)?.normal || 0}
                    </Text>
                    <Text className="block text-xs text-green-500">正常</Text>
                  </View>
                  <View className="bg-orange-50 rounded-lg p-2 text-center">
                    <Text className="block text-lg font-bold text-orange-600">
                      {dailyStats.find(s => s.date === selectedDate)?.pending || 0}
                    </Text>
                    <Text className="block text-xs text-orange-500">待维修</Text>
                  </View>
                  <View className="bg-red-50 rounded-lg p-2 text-center">
                    <Text className="block text-lg font-bold text-red-600">
                      {dailyStats.find(s => s.date === selectedDate)?.fault || 0}
                    </Text>
                    <Text className="block text-xs text-red-500">故障</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* 巡检记录列表 */}
          <View className="px-4 pb-4">
            <Text className="block text-sm text-slate-500 mb-3">
              共 {filteredRecords.length} 条记录
            </Text>
            
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => {
                const config = getStatusConfig(record.status)
                return (
                  <View 
                    key={record.id}
                    className="bg-white rounded-xl mb-3 overflow-hidden"
                  >
                    <View className="p-4">
                      <View className="flex items-start gap-3">
                        <View className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                          {record.status === 'normal' ? (
                            <CircleCheck size={18} color="#22c55e" />
                          ) : record.status === 'pending' ? (
                            <Clock size={18} color="#f97316" />
                          ) : (
                            <TriangleAlert size={18} color="#ef4444" />
                          )}
                        </View>
                        <View className="flex-1">
                          <View className="flex items-center gap-2 mb-1">
                            <Text className="block text-base font-medium text-slate-800">{record.equipment_name}</Text>
                            <View className={`px-2 py-1 rounded text-xs ${config.bgColor} ${config.color}`}>
                              {config.label}
                            </View>
                          </View>
                          <Text className="block text-sm text-slate-500">
                            {record.area}区 | {record.inspector}
                          </Text>
                          {record.remark && (
                            <View className="mt-2 bg-slate-50 rounded-lg p-2">
                              <Text className="block text-xs text-slate-500">备注：{record.remark}</Text>
                            </View>
                          )}
                          <Text className="block text-xs text-slate-400 mt-2">
                            {new Date(record.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )
              })
            ) : (
              <View className="bg-white rounded-xl p-8 text-center">
                <ClipboardList size={48} color="#cbd5e1" />
                <Text className="block text-slate-500 mt-3">该日期暂无巡检记录</Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  )
}
