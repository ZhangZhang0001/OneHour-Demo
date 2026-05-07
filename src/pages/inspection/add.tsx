import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Check } from 'lucide-react-taro'
import { Network } from '@/network'

// ABC区域配置
const AREAS = [
  { id: 'A', name: 'A区', description: '有氧区' },
  { id: 'B', name: 'B区', description: '力量区' },
  { id: 'C', name: 'C区', description: '自由重量区' },
]

// 默认器械列表
const DEFAULT_EQUIPMENT = {
  A: [
    { id: 1, name: '跑步机 1号' },
    { id: 2, name: '跑步机 2号' },
    { id: 3, name: '跑步机 3号' },
    { id: 4, name: '椭圆机 1号' },
    { id: 5, name: '椭圆机 2号' },
    { id: 6, name: '健身车 1号' },
  ],
  B: [
    { id: 7, name: '史密斯机 1号' },
    { id: 8, name: '深蹲架 1号' },
    { id: 9, name: '卧推架 1号' },
    { id: 10, name: '蝴蝶机 1号' },
    { id: 11, name: '划船机 1号' },
    { id: 12, name: '龙门架 1号' },
  ],
  C: [
    { id: 13, name: '哑铃架 1号' },
    { id: 14, name: '哑铃架 2号' },
    { id: 15, name: '壶铃架 1号' },
    { id: 16, name: '杠铃架 1号' },
    { id: 17, name: '腹肌板 1号' },
    { id: 18, name: '多功能训练架 1号' },
  ],
}

interface Equipment {
  id: number
  name: string
}

export default function AddInspection() {
  const [selectedArea, setSelectedArea] = useState<string>('A')
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [equipmentList, setEquipmentList] = useState<{ A: Equipment[], B: Equipment[], C: Equipment[] }>(DEFAULT_EQUIPMENT)
  const [status, setStatus] = useState<string>('normal')
  const [inspector, setInspector] = useState<string>('')
  const [remark, setRemark] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 从本地存储恢复检查人
  useEffect(() => {
    const savedInspector = Taro.getStorageSync('lastInspector')
    if (savedInspector) {
      setInspector(savedInspector)
    }
  }, [])

  // 获取器械列表
  useEffect(() => {
    fetchEquipmentList()
  }, [])

  const fetchEquipmentList = async () => {
    try {
      setLoading(true)
      const res = await Network.request({
        url: '/api/inspection/equipment-list',
      })
      console.log('器械列表:', res.data)
      if (res.data?.data) {
        const data = res.data.data
        const formatted = {
          A: data.A?.length > 0 ? data.A : DEFAULT_EQUIPMENT.A,
          B: data.B?.length > 0 ? data.B : DEFAULT_EQUIPMENT.B,
          C: data.C?.length > 0 ? data.C : DEFAULT_EQUIPMENT.C,
        }
        setEquipmentList(formatted)
      }
    } catch (err) {
      console.error('获取器械列表失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 提交巡检记录
  const handleSubmit = async () => {
    if (!selectedEquipment) {
      Taro.showToast({ title: '请选择器械', icon: 'none' })
      return
    }
    if (!inspector.trim()) {
      Taro.showToast({ title: '请输入检查人', icon: 'none' })
      return
    }

    try {
      setSubmitting(true)
      const res = await Network.request({
        url: '/api/inspection/add',
        method: 'POST',
        data: {
          equipment_name: selectedEquipment.name,
          equipment_id: selectedEquipment.id,
          area: selectedArea,
          status,
          remark: remark.trim(),
          inspector: inspector.trim(),
        },
      })
      console.log('提交结果:', res.data)

      // 保存检查人到本地存储
      Taro.setStorageSync('lastInspector', inspector.trim())

      Taro.showToast({ title: '提交成功', icon: 'success' })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (err) {
      console.error('提交失败:', err)
      Taro.showToast({ title: '提交失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const currentEquipments = equipmentList[selectedArea as keyof typeof equipmentList] || []

  const StatusDot = ({ type }: { type: string }) => {
    const colors: Record<string, string> = {
      normal: 'bg-green-500',
      pending: 'bg-orange-500',
      fault: 'bg-red-500',
    }
    return <View className={`w-2 h-2 rounded-full ${colors[type]}`} />
  }

  return (
    <View className="min-h-screen bg-gray-50 pb-24">
      <View className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => Taro.navigateBack()}
        >
          <ArrowLeft size={20} color="#374151" />
        </Button>
        <Text className="block text-lg font-medium text-gray-800">新增巡检记录</Text>
      </View>

      <View className="p-4 space-y-4">
        {/* 区域选择 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <Text className="block text-gray-800">选择区域</Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex gap-3">
              {AREAS.map((area) => (
                <View
                  key={area.id}
                  className={`flex-1 p-3 rounded-xl border-2 text-center ${
                    selectedArea === area.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  onClick={() => {
                    setSelectedArea(area.id)
                    setSelectedEquipment(null)
                  }}
                >
                  <Text className={`block font-medium ${selectedArea === area.id ? 'text-blue-600' : 'text-gray-700'}`}>
                    {area.name}
                  </Text>
                  <Text className={`block text-xs mt-1 ${selectedArea === area.id ? 'text-blue-400' : 'text-gray-400'}`}>
                    {area.description}
                  </Text>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>

        {/* 器械选择 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex justify-between items-center">
              <Text className="block text-gray-800">选择器械</Text>
              <Text className="block text-sm font-normal text-gray-400">
                {AREAS.find(a => a.id === selectedArea)?.name}
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <View className="text-center py-4">
                <Text className="block text-gray-400">加载中...</Text>
              </View>
            ) : (
              <View className="grid grid-cols-2 gap-2">
                {currentEquipments.map((equipment) => (
                  <View
                    key={equipment.id}
                    className={`p-3 rounded-xl border-2 flex items-center justify-between ${
                      selectedEquipment?.id === equipment.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    onClick={() => setSelectedEquipment(equipment)}
                  >
                    <Text className={`text-sm flex-1 pr-2 ${selectedEquipment?.id === equipment.id ? 'text-blue-600' : 'text-gray-700'}`}>
                      {equipment.name}
                    </Text>
                    {selectedEquipment?.id === equipment.id && (
                      <Check size={16} color="#3b82f6" />
                    )}
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* 状态选择 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <Text className="block text-gray-800">检查状态</Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex flex-col gap-3">
              <View
                className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
                  status === 'normal' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
                onClick={() => setStatus('normal')}
              >
                <StatusDot type="normal" />
                <Text className={`flex-1 text-sm ${status === 'normal' ? 'text-green-600' : 'text-gray-700'}`}>正常</Text>
                {status === 'normal' && <Check size={16} color="#22c55e" />}
              </View>
              <View
                className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
                  status === 'pending' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                }`}
                onClick={() => setStatus('pending')}
              >
                <StatusDot type="pending" />
                <Text className={`flex-1 text-sm ${status === 'pending' ? 'text-orange-600' : 'text-gray-700'}`}>待维修</Text>
                {status === 'pending' && <Check size={16} color="#f97316" />}
              </View>
              <View
                className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
                  status === 'fault' ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
                onClick={() => setStatus('fault')}
              >
                <StatusDot type="fault" />
                <Text className={`flex-1 text-sm ${status === 'fault' ? 'text-red-600' : 'text-gray-700'}`}>故障</Text>
                {status === 'fault' && <Check size={16} color="#ef4444" />}
              </View>
            </View>
          </CardContent>
        </Card>

        {/* 检查人 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Text className="block text-gray-800">检查人</Text>
              <View className="bg-blue-100 px-2 py-1 rounded text-xs text-blue-600">
                自动记忆
              </View>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                value={inspector}
                onInput={(e) => setInspector(e.detail.value)}
                placeholder="请输入检查人姓名"
                className="bg-transparent border-0 p-0 h-auto text-base"
              />
            </View>
            {inspector && (
              <Text className="block text-xs text-gray-400 mt-2">
                下次会自动填充此姓名
              </Text>
            )}
          </CardContent>
        </Card>

        {/* 备注 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <Text className="block text-gray-800">备注说明</Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View className="bg-gray-50 rounded-xl p-4">
              <Textarea
                value={remark}
                onInput={(e) => setRemark(e.detail.value)}
                placeholder="可选填写，如发现的问题描述..."
                maxlength={200}
                style={{ width: '100%', minHeight: '80px', backgroundColor: 'transparent' }}
              />
            </View>
          </CardContent>
        </Card>
      </View>

      {/* 底部提交按钮 */}
      <View
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4"
        style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
      >
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
          disabled={!selectedEquipment || !inspector.trim() || submitting}
          onClick={handleSubmit}
        >
          <Save size={18} color="#ffffff" className="mr-2" />
          <Text className="block text-white">{submitting ? '提交中...' : '提交巡检记录'}</Text>
        </Button>
      </View>
    </View>
  )
}
