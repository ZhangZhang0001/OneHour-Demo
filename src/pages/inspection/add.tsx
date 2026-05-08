import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react-taro'
import { Network } from '@/network'

// 区域配置
const AREAS = [
  { id: 'A', name: 'A区', description: '跑步机——龙门架' },
  { id: 'B', name: 'B区', description: '龙门架——私教区' },
  { id: 'C', name: 'C区', description: '龙门架——私教区' },
]

// 器械列表
const DEFAULT_EQUIPMENT = {
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

  useEffect(() => {
    loadEquipment()
  }, [])

  const loadEquipment = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/equipment/list',
      })
      console.log('器械列表响应:', res)
      if (res.data.code === 200 && res.data.data && res.data.data.length > 0) {
        const data = res.data.data
        const grouped: { A: Equipment[], B: Equipment[], C: Equipment[] } = { A: [], B: [], C: [] }
        data.forEach((item: any) => {
          const area = item.area || 'A'
          if (grouped[area]) {
            grouped[area].push({ id: item.id, name: item.name })
          }
        })
        setEquipmentList(grouped)
      }
    } catch (err) {
      console.error('加载器械列表失败', err)
    } finally {
      setLoading(false)
    }
  }

  const currentEquipment = equipmentList[selectedArea as keyof typeof equipmentList] || []

  const handleSubmit = async () => {
    if (!selectedEquipment) {
      Taro.showToast({ title: '请选择器械', icon: 'none' })
      return
    }
    if (!status) {
      Taro.showToast({ title: '请选择状态', icon: 'none' })
      return
    }
    if (!inspector.trim()) {
      Taro.showToast({ title: '请输入检查人', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      const res = await Network.request({
        url: '/api/inspection/add',
        method: 'POST',
        data: {
          equipmentId: selectedEquipment.id,
          equipmentName: selectedEquipment.name,
          area: selectedArea,
          status,
          inspector: inspector.trim(),
          remark: remark.trim(),
        },
      })
      console.log('提交响应:', res)
      if (res.data.code === 200) {
        Taro.showToast({ title: '提交成功', icon: 'success' })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } else {
        Taro.showToast({ title: res.data.msg || '提交失败', icon: 'none' })
      }
    } catch (err) {
      console.error('提交失败', err)
      Taro.showToast({ title: '提交失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className="min-h-screen bg-gray-50 pb-safe">
      {/* 顶部导航 */}
      <View className="bg-white px-4 py-3 flex items-center border-b border-gray-100 sticky top-0 z-10">
        <View onClick={() => Taro.navigateBack()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#374151" />
        </View>
        <Text className="block text-lg font-semibold text-gray-800 ml-2">新增巡检记录</Text>
      </View>

      <View className="p-4 space-y-4">
        {/* 区域选择 */}
        <Card>
          <CardHeader>
            <CardTitle>选择区域</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {AREAS.map((area) => (
              <View
                key={area.id}
                onClick={() => {
                  setSelectedArea(area.id)
                  setSelectedEquipment(null)
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedArea === area.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Text className={`block font-medium ${selectedArea === area.id ? 'text-blue-600' : 'text-gray-700'}`}>
                  {area.name}
                </Text>
                <Text className={`block text-sm mt-1 ${selectedArea === area.id ? 'text-blue-400' : 'text-gray-400'}`}>
                  {area.description}
                </Text>
              </View>
            ))}
          </CardContent>
        </Card>

        {/* 器械选择 */}
        <Card>
          <CardHeader>
            <CardTitle>选择器械</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <View className="py-8 text-center">
                <Text className="block text-gray-500">加载中...</Text>
              </View>
            ) : (
              <View className="grid grid-cols-2 gap-2">
                {currentEquipment.map((eq) => (
                  <View
                    key={eq.id}
                    onClick={() => setSelectedEquipment(eq)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      selectedEquipment?.id === eq.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Text className={`block text-sm font-medium ${selectedEquipment?.id === eq.id ? 'text-blue-600' : 'text-gray-700'}`}>
                      {eq.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* 状态选择 */}
        <Card>
          <CardHeader>
            <CardTitle>巡检状态</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex gap-3">
              {[
                { id: 'normal', label: '正常', color: 'green' },
                { id: 'pending', label: '待维修', color: 'orange' },
                { id: 'fault', label: '故障', color: 'red' },
              ].map((item) => (
                <View
                  key={item.id}
                  onClick={() => setStatus(item.id)}
                  className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                    status === item.id
                      ? `border-${item.color}-500 bg-${item.color}-50`
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Text className={`block font-medium ${status === item.id ? `text-${item.color}-600` : 'text-gray-700'}`}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>

        {/* 检查人 */}
        <Card>
          <CardHeader>
            <CardTitle>检查人</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full"
                placeholder="请输入检查人姓名"
                value={inspector}
                onInput={(e) => setInspector(e.detail.value)}
              />
            </View>
          </CardContent>
        </Card>

        {/* 备注 */}
        <Card>
          <CardHeader>
            <CardTitle>备注说明</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="bg-gray-50 rounded-2xl p-4">
              <Textarea
                style={{ width: '100%', minHeight: '100px', backgroundColor: 'transparent' }}
                placeholder="请输入备注说明..."
                value={remark}
                onInput={(e) => setRemark(e.detail.value)}
                maxlength={500}
              />
            </View>
          </CardContent>
        </Card>

        {/* 提交按钮 */}
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 text-base font-medium"
        >
          {submitting ? '提交中...' : '确认提交'}
        </Button>
      </View>

      {/* 底部安全区域 */}
      <View style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }} />
    </View>
  )
}
