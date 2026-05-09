import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Network } from '@/network'

// 区域配置
const AREAS = [
  { id: 'A', name: 'A区', description: '跑步机——龙门架' },
  { id: 'B', name: 'B区', description: '龙门架——私教区' },
  { id: 'C', name: 'C区', description: '龙门架——私教区' },
]

// 器械配置
const EQUIPMENT = {
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

export default function AddInspection() {
  const [inspector, setInspector] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedEquipments, setSelectedEquipments] = useState<number[]>([])
  const [status, setStatus] = useState<'normal' | 'pending' | 'fault'>('normal')
  const [remark, setRemark] = useState('')
  const [wearLevel, setWearLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [submitting, setSubmitting] = useState(false)

  // 从本地存储读取上次输入的检查人
  useEffect(() => {
    const saved = Taro.getStorageSync('inspector_name')
    if (saved) {
      setInspector(saved)
    }
  }, [])

  // 选择区域
  const handleAreaSelect = (areaId: string) => {
    setSelectedArea(areaId)
    setSelectedEquipments([])
  }

  // 选择/取消选择器械
  const toggleEquipment = (id: number) => {
    const newSelected = selectedEquipments.includes(id)
      ? selectedEquipments.filter(e => e !== id)
      : [...selectedEquipments, id]
    setSelectedEquipments(newSelected)
  }

  // 选择状态时重置相关字段
  const handleStatusChange = (newStatus: 'normal' | 'pending' | 'fault') => {
    setStatus(newStatus)
    // 切换到非故障状态时清空备注
    if (newStatus !== 'fault') {
      setRemark('')
    }
    // 切换到非有磨损状态时重置磨损程度
    if (newStatus !== 'pending') {
      setWearLevel('medium')
    }
  }

  // 全选
  const selectAll = () => {
    if (!selectedArea) return
    const allIds = EQUIPMENT[selectedArea as keyof typeof EQUIPMENT].map(e => e.id)
    setSelectedEquipments(allIds)
  }

  // 取消全选
  const clearAll = () => {
    setSelectedEquipments([])
  }

  // 提交巡检
  const handleSubmit = async () => {
    if (!inspector.trim()) {
      Taro.showToast({ title: '请输入检查人', icon: 'none' })
      return
    }
    if (!selectedArea) {
      Taro.showToast({ title: '请选择区域', icon: 'none' })
      return
    }
    if (selectedEquipments.length === 0) {
      Taro.showToast({ title: '请选择器械', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      const res = await Network.request({
        url: '/api/inspection/add',
        method: 'POST',
        data: {
          inspector,
          area: selectedArea,
          equipmentIds: selectedEquipments,
          status,
          remark: status === 'fault' ? remark : undefined,
          wearLevel: status === 'pending' ? wearLevel : undefined,
        },
      })
      console.log('提交结果:', res.data)

      if (res.data?.code === 200) {
        // 保存检查人姓名
        Taro.setStorageSync('inspector_name', inspector)
        Taro.showToast({ title: '提交成功', icon: 'success' })
        setTimeout(() => {
          // 返回首页刷新数据
          Taro.eventCenter.trigger('reloadHome'); Taro.switchTab({ url: '/pages/index/index' })
        }, 1500)
      } else {
        Taro.showToast({ title: res.data?.msg || '提交失败', icon: 'none' })
      }
    } catch (err) {
      console.error('提交失败:', err)
      Taro.showToast({ title: '提交失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const currentEquipments = selectedArea 
    ? EQUIPMENT[selectedArea as keyof typeof EQUIPMENT] || []
    : []

  return (
    <View className="min-h-screen bg-gray-50 p-4">
      {/* 页面标题 */}
      <View className="mb-6">
        <Text className="block text-xl font-bold text-gray-800">新增巡检记录</Text>
      </View>

      {/* 检查人输入 */}
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
      </View>

      {/* 区域选择 */}
      <View className="mb-4">
        <Text className="block text-sm font-medium text-gray-700 mb-2">选择区域</Text>
        <View className="flex gap-3">
          {AREAS.map((area) => (
            <View
              key={area.id}
              onClick={() => handleAreaSelect(area.id)}
              className={`flex-1 p-3 rounded-xl text-center ${
                selectedArea === area.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              <Text className={`block font-medium ${selectedArea === area.id ? 'text-white' : 'text-gray-800'}`}>
                {area.name}
              </Text>
              <Text className={`block text-xs mt-1 ${selectedArea === area.id ? 'text-blue-100' : 'text-gray-500'}`}>
                {area.description}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 器械选择 */}
      {selectedArea && (
        <View className="mb-4">
          <View className="flex justify-between items-center mb-2">
            <Text className="block text-sm font-medium text-gray-700">
              选择器械（{selectedEquipments.length}/{currentEquipments.length}）
            </Text>
            <View className="flex gap-2">
              <View onClick={selectAll}>
                <Text className="block text-sm text-blue-500">全选</Text>
              </View>
              <View onClick={clearAll}>
                <Text className="block text-sm text-gray-500">取消</Text>
              </View>
            </View>
          </View>
          
          <View className="bg-white rounded-xl p-3">
            {currentEquipments.map((eq) => (
              <View
                key={eq.id}
                onClick={() => toggleEquipment(eq.id)}
                className={`p-3 mb-2 rounded-lg border ${
                  selectedEquipments.includes(eq.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <View className="flex items-center">
                  <View
                    className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                    selectedEquipments.includes(eq.id)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}
                  >
                    {selectedEquipments.includes(eq.id) && (
                      <Text className="block text-white text-xs">✓</Text>
                    )}
                  </View>
                  <Text className={`block ${selectedEquipments.includes(eq.id) ? 'text-blue-700' : 'text-gray-700'}`}>
                    {eq.name}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 状态选择 */}
      {selectedEquipments.length > 0 && (
        <View className="mb-4">
          <Text className="block text-sm font-medium text-gray-700 mb-2">巡检状态</Text>
          <View className="flex gap-3">
            {[
              { key: 'normal', label: '正常', color: 'green' },
              { key: 'pending', label: '有磨损', color: 'orange' },
              { key: 'fault', label: '故障', color: 'red' },
            ].map((item) => (
              <View
                key={item.key}
                onClick={() => handleStatusChange(item.key as typeof status)}
                className={`flex-1 p-3 rounded-xl text-center ${
                  status === item.key
                    ? item.color === 'green' ? 'bg-green-500 text-white'
                    : item.color === 'orange' ? 'bg-orange-500 text-white'
                    : 'bg-red-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                <Text className={`block ${status === item.key ? 'text-white' : 'text-gray-700'}`}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          {/* 故障状态 - 备注输入 */}
          {status === 'fault' && (
            <View className="mt-4">
              <Text className="block text-sm font-medium text-gray-700 mb-2">故障备注</Text>
              <View className="bg-white rounded-xl p-4">
                <Textarea
                  style={{ width: '100%', minHeight: '80px', backgroundColor: 'transparent' }}
                  placeholder="请详细描述故障情况..."
                  maxlength={200}
                  value={remark}
                  onInput={(e) => setRemark(e.detail.value)}
                />
              </View>
              <Text className="block text-xs text-gray-400 mt-1 text-right">{remark.length}/200</Text>
            </View>
          )}

          {/* 有磨损状态 - 磨损程度选择 */}
          {status === 'pending' && (
            <View className="mt-4">
              <Text className="block text-sm font-medium text-gray-700 mb-2">磨损程度</Text>
              <View className="flex gap-3">
                {[
                  { key: 'low', label: '低', desc: '轻微磨损', color: 'yellow' },
                  { key: 'medium', label: '中', desc: '明显磨损', color: 'orange' },
                  { key: 'high', label: '高', desc: '严重磨损', color: 'red' },
                ].map((item) => (
                  <View
                    key={item.key}
                    onClick={() => setWearLevel(item.key as typeof wearLevel)}
                    className={`flex-1 p-3 rounded-xl text-center ${
                      wearLevel === item.key
                        ? item.color === 'yellow' ? 'bg-yellow-500 text-white'
                        : item.color === 'orange' ? 'bg-orange-500 text-white'
                        : 'bg-red-500 text-white'
                        : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    <Text className={`block font-medium ${wearLevel === item.key ? 'text-white' : 'text-gray-700'}`}>
                      {item.label}
                    </Text>
                    <Text className={`block text-xs mt-1 ${wearLevel === item.key ? 'text-white/80' : 'text-gray-400'}`}>
                      {item.desc}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* 提交按钮 */}
      <View className="mt-6">
        <View 
          onClick={submitting ? undefined : handleSubmit}
          className={`py-4 rounded-xl text-center text-lg font-medium ${
            submitting
              ? 'bg-gray-300 text-gray-500'
              : 'bg-blue-500 text-white'
          }`}
        >
          <Text className={submitting ? 'text-gray-500' : 'text-white'}>
            {submitting ? '提交中...' : '提交巡检'}
          </Text>
        </View>
      </View>
    </View>
  )
}
