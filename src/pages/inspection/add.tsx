import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { ArrowLeft } from 'lucide-react-taro'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Network } from '@/network'

// 区域配置（与后端保持一致）
const AREAS = [
  { id: 'A', name: 'A区', description: '跑步机——龙门架' },
  { id: 'B', name: 'B区', description: '龙门架——私教区' },
  { id: 'C', name: 'C区', description: '龙门架——私教区' },
]

// 器械列表（与后端保持一致）
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

  // 获取当前区域的器械
  const currentEquipments = DEFAULT_EQUIPMENT[selectedArea] || []

  // 切换区域时清空选择
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

  // 全选当前区域器械
  const selectAll = () => {
    const allIds = currentEquipments.map(e => e.id)
    setSelectedEquipments(allIds)
    // 默认全部设为正常
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

  // 更新器械状态
  const updateStatus = (id: number, status: string) => {
    setEquipmentStatus(prev => ({ ...prev, [id]: status }))
  }

  // 更新器械备注
  const updateRemark = (id: number, remark: string) => {
    setEquipmentRemarks(prev => ({ ...prev, [id]: remark }))
  }

  // 提交巡检记录（批量）
  const handleSubmit = async () => {
    if (!inspector.trim()) {
      Taro.showToast({ title: '请输入检查人姓名', icon: 'none' })
      return
    }

    if (selectedEquipments.length === 0) {
      Taro.showToast({ title: '请选择要巡检的器械', icon: 'none' })
      return
    }

    // 检查是否所有选中的器械都已设置状态
    const uncheckedEquipments = selectedEquipments.filter(id => !equipmentStatus[id])
    if (uncheckedEquipments.length > 0) {
      Taro.showToast({ title: '请为所有选中的器械设置状态', icon: 'none' })
      return
    }

    setSubmitting(true)

    try {
      const today = new Date().toISOString().split('T')[0]

      // 批量提交
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

      // 保存检查人姓名到本地存储
      Taro.setStorageSync(STORAGE_KEY, inspector.trim())

      Taro.showToast({ title: '提交成功', icon: 'success' })

      // 返回上一页并触发刷新
      setTimeout(() => {
        const pages = Taro.getCurrentPages()
        const prevPage = pages[pages.length - 2]
        if (prevPage) {
          prevPage.onShow?.()
        }
        Taro.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('提交失败:', error)
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className="min-h-screen bg-gray-50 pb-24">
      {/* 顶部导航 */}
      <View className="bg-slate-700 text-white px-4 py-4">
        <View className="flex items-center gap-3">
          <ArrowLeft size={20} color="white" onClick={() => Taro.navigateBack()} />
          <Text className="block text-lg font-medium">新增巡检记录</Text>
        </View>
      </View>

      <ScrollView scrollY className="p-4" style={{ height: 'calc(100vh - 180px)' }}>
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
              <Badge
                key={area.id}
                variant={selectedArea === area.id ? 'default' : 'outline'}
                className={`px-4 py-2 cursor-pointer ${
                  selectedArea === area.id ? 'bg-slate-700 text-white' : ''
                }`}
                onClick={() => handleAreaChange(area.id)}
              >
                <Text className="block">{area.name}</Text>
              </Badge>
            ))}
          </View>
          <Text className="block text-xs text-gray-500 mt-1">
            {AREAS.find(a => a.id === selectedArea)?.description}
          </Text>
        </View>

        {/* 器械列表 */}
        <View className="mb-4">
          <View className="flex items-center justify-between mb-2">
            <Text className="text-sm font-medium text-gray-700">选择器械</Text>
            <View className="flex gap-2">
              <Text
                className="block text-xs text-blue-500"
                onClick={selectAll}
              >
                全选
              </Text>
              <Text
                className="block text-xs text-gray-500"
                onClick={deselectAll}
              >
                取消
              </Text>
            </View>
          </View>

          {selectedEquipments.length > 0 && (
            <Text className="block text-xs text-gray-500 mb-2">
              已选择 {selectedEquipments.length} 个器械
            </Text>
          )}

          <Card>
            <CardContent className="p-3">
              {currentEquipments.map(equipment => (
                <View
                  key={equipment.id}
                  className={`p-3 mb-2 rounded-lg border ${
                    selectedEquipments.includes(equipment.id)
                      ? 'border-slate-500 bg-slate-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  onClick={() => toggleEquipment(equipment.id)}
                >
                  <View className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedEquipments.includes(equipment.id)}
                      onCheckedChange={() => toggleEquipment(equipment.id)}
                    />
                    <View className="flex-1">
                      <Text className="block text-sm font-medium text-gray-800">
                        {equipment.name}
                      </Text>

                      {selectedEquipments.includes(equipment.id) && (
                        <View className="mt-2">
                          {/* 状态选择 */}
                          <View className="flex gap-2 mb-2">
                            {[
                              { value: 'normal', label: '正常', color: 'bg-green-500' },
                              { value: 'pending', label: '待维修', color: 'bg-amber-500' },
                              { value: 'fault', label: '故障', color: 'bg-red-500' },
                            ].map(opt => (
                              <View
                                key={opt.value}
                                className={`px-3 py-1 rounded-full text-xs cursor-pointer ${
                                  equipmentStatus[equipment.id] === opt.value
                                    ? `${opt.color} text-white`
                                    : 'bg-gray-100 text-gray-600'
                                }`}
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
                          <View className="bg-white rounded-lg px-3 py-2">
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
                  </View>
                </View>
              ))}
            </CardContent>
          </Card>
        </View>
      </ScrollView>

      {/* 底部提交按钮 */}
      <View
        className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200"
        style={{ paddingBottom: `${Taro.getSystemInfoSync().safeArea?.bottom || 16}px` }}
      >
        <Button
          className="w-full bg-slate-700 hover:bg-slate-800"
          onClick={handleSubmit}
          disabled={submitting || selectedEquipments.length === 0}
        >
          <Text className="block text-white">
            {submitting ? '提交中...' : `提交巡检 (${selectedEquipments.length}个)`}
          </Text>
        </Button>
      </View>
    </View>
  )
}
