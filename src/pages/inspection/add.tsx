import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { ArrowLeft } from 'lucide-react-taro'
import { Input } from '@/components/ui/input'
import { Network } from '@/network'

// 区域配置
const AREAS = [
  { id: 'A', name: 'A区', description: '跑步机——龙门架' },
  { id: 'B', name: 'B区', description: '龙门架——私教区' },
  { id: 'C', name: 'C区', description: '龙门架——私教区' },
]

// 器械列表
const DEFAULT_EQUIPMENT: Record<string, Array<{ id: number; name: string }>> = {
  A: [
    { id: 1, name: '跑步机 1号' },
    { id: 2, name: '跑步机 2号' },
    { id: 3, name: '跑步机 3号' },
    { id: 4, name: '跑步机 4号' },
    { id: 5, name: '单车 1-4号' },
    { id: 6, name: '辅助引体机' },
    { id: 7, name: '划船机' },
    { id: 8, name: '推肩器' },
    { id: 9, name: '蝴蝶机' },
    { id: 10, name: '龙门架+组件' },
  ],
  B: [
    { id: 11, name: '海豹划船' },
    { id: 12, name: '大剪刀' },
    { id: 13, name: '反手高位下拉' },
    { id: 14, name: '哈克深蹲机' },
    { id: 15, name: '倒蹬机' },
    { id: 16, name: '臀桥机' },
    { id: 17, name: '罗马椅' },
    { id: 18, name: '分动式划船器' },
    { id: 19, name: '史密斯深蹲架' },
    { id: 20, name: 'T杆划船' },
    { id: 21, name: '犀牛蹲' },
  ],
  C: [
    { id: 22, name: '哑铃架' },
    { id: 23, name: '平板推胸' },
    { id: 24, name: '斜板推胸' },
    { id: 25, name: '髋外展机' },
    { id: 26, name: '坐姿腿弯举' },
    { id: 27, name: '坐姿腿屈伸' },
    { id: 28, name: '推胸机' },
    { id: 29, name: '高位下拉' },
  ],
}

const STORAGE_KEY = 'last_inspector'

export default function AddInspection() {
  const [selectedArea, setSelectedArea] = useState<string>('A')
  const [inspector, setInspector] = useState('')
  const [selectedEquipments, setSelectedEquipments] = useState<number[]>([])
  const [equipmentStatus, setEquipmentStatus] = useState<Record<number, string>>({})
  const [equipmentRemarks, setEquipmentRemarks] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // 页面加载时读取上次检查人姓名
  useEffect(() => {
    const lastInspector = Taro.getStorageSync(STORAGE_KEY)
    if (lastInspector) {
      setInspector(lastInspector)
    }
  }, [])

  const currentEquipments = DEFAULT_EQUIPMENT[selectedArea] || []

  // 切换区域
  const handleAreaChange = (areaId: string) => {
    setSelectedArea(areaId)
    setSelectedEquipments([])
    setEquipmentStatus({})
    setEquipmentRemarks({})
  }

  // 切换器械选中状态
  const toggleEquipment = (id: number) => {
    setSelectedEquipments(prev => {
      if (prev.includes(id)) {
        return prev.filter(eid => eid !== id)
      }
      return [...prev, id]
    })
  }

  // 全选
  const selectAll = () => {
    const allIds = currentEquipments.map(e => e.id)
    setSelectedEquipments(allIds)
    const defaultStatus: Record<number, string> = {}
    allIds.forEach(id => {
      defaultStatus[id] = 'normal'
    })
    setEquipmentStatus(defaultStatus)
  }

  // 取消全选
  const deselectAll = () => {
    setSelectedEquipments([])
    setEquipmentStatus({})
    setEquipmentRemarks({})
  }

  // 设置器械状态
  const updateStatus = (id: number, status: string) => {
    setEquipmentStatus(prev => ({ ...prev, [id]: status }))
  }

  // 设置备注
  const updateRemark = (id: number, remark: string) => {
    setEquipmentRemarks(prev => ({ ...prev, [id]: remark }))
  }

  // 提交
  const handleSubmit = async () => {
    if (!inspector.trim()) {
      Taro.showToast({ title: '请输入检查人姓名', icon: 'none' })
      return
    }

    if (selectedEquipments.length === 0) {
      Taro.showToast({ title: '请选择要巡检的器械', icon: 'none' })
      return
    }

    const uncheckedEquipments = selectedEquipments.filter(id => !equipmentStatus[id])
    if (uncheckedEquipments.length > 0) {
      Taro.showToast({ title: '请为所有器械设置状态', icon: 'none' })
      return
    }

    setSubmitting(true)

    try {
      const today = new Date().toISOString().split('T')[0]
      const promises = selectedEquipments.map(equipmentId => {
        const equipment = currentEquipments.find(e => e.id === equipmentId)
        return Network.request({
          url: '/api/inspection/add',
          method: 'POST',
          data: {
            equipment_id: equipmentId,
            equipment_name: equipment?.name || '',
            area: selectedArea,
            status: equipmentStatus[equipmentId] || 'normal',
            remark: equipmentRemarks[equipmentId] || '',
            inspector: inspector.trim(),
            inspection_date: today,
          },
        })
      })

      await Promise.all(promises)
      Taro.setStorageSync(STORAGE_KEY, inspector.trim())
      Taro.showToast({ title: '提交成功', icon: 'success' })

      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('提交失败:', error)
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string, isActive: boolean) => {
    if (!isActive) return 'bg-gray-100 text-gray-600'
    if (status === 'normal') return 'bg-green-500 text-white'
    if (status === 'pending') return 'bg-amber-500 text-white'
    if (status === 'fault') return 'bg-red-500 text-white'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <View className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <View className="bg-slate-700 text-white px-4 py-4 flex items-center gap-3">
        <ArrowLeft size={20} color="white" onClick={() => Taro.navigateBack()} />
        <Text className="block text-lg font-medium">新增巡检记录</Text>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 140px)' }}>
        <View className="p-4">
          {/* 检查人 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">检查人</Text>
            <View className="bg-white rounded-xl px-4 py-3">
              <Input
                className="w-full"
                placeholder="请输入检查人姓名"
                value={inspector}
                onInput={(e) => setInspector(e.detail.value)}
              />
            </View>
            {inspector && (
              <Text className="block text-xs text-blue-500 mt-1">姓名会自动保存，下次自动填充</Text>
            )}
          </View>

          {/* 区域选择 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">选择区域</Text>
            <View className="flex gap-2">
              {AREAS.map(area => (
                <View
                  key={area.id}
                  className={`px-4 py-2 rounded-lg cursor-pointer ${
                    selectedArea === area.id
                      ? 'bg-slate-700 text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                  onClick={() => handleAreaChange(area.id)}
                >
                  <Text className="block text-sm">{area.name}</Text>
                </View>
              ))}
            </View>
            <Text className="block text-xs text-gray-500 mt-1">
              {AREAS.find(a => a.id === selectedArea)?.description}
            </Text>
          </View>

          {/* 全选/取消 */}
          <View className="flex items-center justify-between mb-2">
            <Text className="text-sm font-medium text-gray-700">选择器械</Text>
            <View className="flex gap-4">
              <Text className="text-xs text-blue-500" onClick={selectAll}>全选</Text>
              <Text className="text-xs text-gray-500" onClick={deselectAll}>取消</Text>
            </View>
          </View>

          {selectedEquipments.length > 0 && (
            <Text className="block text-xs text-gray-500 mb-2">
              已选择 {selectedEquipments.length} 个器械
            </Text>
          )}

          {/* 器械列表 */}
          {currentEquipments.map(equipment => {
            const isSelected = selectedEquipments.includes(equipment.id)
            return (
              <View
                key={equipment.id}
                className={`mb-2 p-3 rounded-lg ${
                  isSelected ? 'bg-slate-50 border border-slate-300' : 'bg-white border border-gray-200'
                }`}
                onClick={() => toggleEquipment(equipment.id)}
              >
                <View className="flex items-center gap-2">
                  <View className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected ? 'bg-slate-700 border-slate-700' : 'border-gray-300'
                  }`}
                  >
                    {isSelected && <Text className="block text-white text-xs">✓</Text>}
                  </View>
                  <Text className="flex-1 text-sm text-gray-800">{equipment.name}</Text>
                </View>

                {isSelected && (
                  <View className="mt-2 ml-7">
                    {/* 状态选择 */}
                    <View className="flex gap-2">
                      {[
                        { value: 'normal', label: '正常' },
                        { value: 'pending', label: '待维修' },
                        { value: 'fault', label: '故障' },
                      ].map(opt => (
                        <View
                          key={opt.value}
                          className={`px-3 py-1 rounded-full text-xs ${getStatusColor(opt.value, equipmentStatus[equipment.id] === opt.value)}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            updateStatus(equipment.id, opt.value)
                          }}
                        >
                          <Text className="block">{opt.label}</Text>
                        </View>
                      ))}
                    </View>
                    {/* 备注 */}
                    <View className="mt-2 bg-white rounded-lg px-3 py-2">
                      <Input
                        className="w-full text-xs"
                        placeholder="备注（选填）"
                        value={equipmentRemarks[equipment.id] || ''}
                        onClick={(e) => e.stopPropagation()}
                        onInput={(e) => {
                          e.stopPropagation()
                          updateRemark(equipment.id, e.detail.value)
                        }}
                      />
                    </View>
                  </View>
                )}
              </View>
            )
          })}
        </View>
      </ScrollView>

      {/* 底部提交 */}
      <View
        className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200"
        style={{ paddingBottom: `${Taro.getSystemInfoSync().safeArea?.bottom || 16}px` }}
      >
        <View
          className={`w-full py-3 rounded-xl text-center ${
            submitting || selectedEquipments.length === 0
              ? 'bg-gray-300 text-gray-500'
              : 'bg-slate-700 text-white'
          }`}
          onClick={handleSubmit}
        >
          <Text className="block">
            {submitting ? '提交中...' : `提交巡检 (${selectedEquipments.length}个)`}
          </Text>
        </View>
      </View>
    </View>
  )
}
