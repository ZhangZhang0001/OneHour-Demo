import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Network } from '@/network'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Wrench, Check } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import './add.css'

const EQUIPMENT_OPTIONS = [
  '跑步机',
  '椭圆机',
  '动感单车',
  '划船机',
  '史密斯机',
  '杠铃架',
  '哑铃架',
  '卧推凳',
  '深蹲架',
  '引体向上架',
  '龙门架',
  '腿部训练器',
  '腹肌训练器',
  '拉伸架',
  '瑜伽垫',
  '瑜伽球',
  '泡沫轴',
  '其他'
]

export default function AddInspection() {
  const [equipmentName, setEquipmentName] = useState('')
  const [customEquipment, setCustomEquipment] = useState('')
  const [status, setStatus] = useState<'normal' | 'pending' | 'fault'>('normal')
  const [remark, setRemark] = useState('')
  const [inspector, setInspector] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!equipmentName.trim()) {
      Taro.showToast({ title: '请选择器械', icon: 'none' })
      return
    }
    if (!inspector.trim()) {
      Taro.showToast({ title: '请输入检查人', icon: 'none' })
      return
    }

    const finalName = equipmentName === '其他' ? customEquipment.trim() : equipmentName
    if (equipmentName === '其他' && !finalName) {
      Taro.showToast({ title: '请输入器械名称', icon: 'none' })
      return
    }

    try {
      setSubmitting(true)
      Taro.showLoading({ title: '提交中...' })

      const res = await Network.request({
        url: '/api/inspection/add',
        method: 'POST',
        data: {
          equipment_name: finalName,
          status,
          remark: remark.trim(),
          inspector: inspector.trim()
        }
      })
      
      console.log('新增巡检响应:', res.data)
      Taro.hideLoading()

      if (res.data?.code === 200) {
        Taro.showToast({ title: '提交成功', icon: 'success' })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } else {
        Taro.showToast({ title: res.data?.msg || '提交失败', icon: 'none' })
      }
    } catch (error) {
      console.error('提交失败:', error)
      Taro.hideLoading()
      Taro.showToast({ title: '提交失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className="min-h-screen bg-slate-50 pb-20">
      <ScrollView className="p-4" scrollY>
        {/* 器械选择 */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <Text className="block text-base font-medium text-slate-800 mb-3">选择器械</Text>
            <View className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((equipment) => (
                <View
                  key={equipment}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    equipmentName === equipment
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                  onClick={() => {
                    setEquipmentName(equipment)
                    if (equipment !== '其他') {
                      setCustomEquipment('')
                    }
                  }}
                >
                  <Text className={`block text-sm ${equipmentName === equipment ? 'text-white' : 'text-slate-600'}`}>
                    {equipment}
                  </Text>
                </View>
              ))}
            </View>
            
            {equipmentName === '其他' && (
              <View className="mt-3">
                <Input
                  className="bg-white rounded-xl px-4 py-3"
                  placeholder="请输入器械名称"
                  value={customEquipment}
                  onInput={(e) => setCustomEquipment(e.detail.value)}
                />
              </View>
            )}
          </CardContent>
        </Card>

        {/* 巡检状态 */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <Text className="block text-base font-medium text-slate-800 mb-3">巡检状态</Text>
            <View className="flex gap-3">
              <View
                className={`flex-1 p-4 rounded-xl border-2 text-center ${
                  status === 'normal' ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white'
                }`}
                onClick={() => setStatus('normal')}
              >
                <View className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  status === 'normal' ? 'bg-green-500' : 'bg-slate-200'
                }`}
                >
                  <Check size={20} color={status === 'normal' ? '#fff' : '#94a3b8'} />
                </View>
                <Text className={`block text-sm font-medium ${status === 'normal' ? 'text-green-600' : 'text-slate-600'}`}>
                  正常
                </Text>
              </View>
              
              <View
                className={`flex-1 p-4 rounded-xl border-2 text-center ${
                  status === 'pending' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white'
                }`}
                onClick={() => setStatus('pending')}
              >
                <View className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  status === 'pending' ? 'bg-orange-500' : 'bg-slate-200'
                }`}
                >
                  <Wrench size={20} color={status === 'pending' ? '#fff' : '#94a3b8'} />
                </View>
                <Text className={`block text-sm font-medium ${status === 'pending' ? 'text-orange-600' : 'text-slate-600'}`}>
                  待维修
                </Text>
              </View>
              
              <View
                className={`flex-1 p-4 rounded-xl border-2 text-center ${
                  status === 'fault' ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
                }`}
                onClick={() => setStatus('fault')}
              >
                <View className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  status === 'fault' ? 'bg-red-500' : 'bg-slate-200'
                }`}
                >
                  <Text className={status === 'fault' ? 'text-white text-lg' : 'text-slate-400 text-lg'}>!</Text>
                </View>
                <Text className={`block text-sm font-medium ${status === 'fault' ? 'text-red-600' : 'text-slate-600'}`}>
                  故障
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* 检查人和备注 */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <View className="mb-4">
              <Text className="block text-sm text-slate-600 mb-2">检查人</Text>
              <Input
                className="bg-white rounded-xl px-4 py-3"
                placeholder="请输入检查人姓名"
                value={inspector}
                onInput={(e) => setInspector(e.detail.value)}
              />
            </View>
            
            <View>
              <Text className="block text-sm text-slate-600 mb-2">备注说明</Text>
              <View className="bg-slate-50 rounded-xl p-3">
                <Textarea
                  style={{ width: '100%', minHeight: '100px', backgroundColor: 'transparent' }}
                  placeholder="请输入备注说明（可选）"
                  value={remark}
                  onInput={(e) => setRemark(e.detail.value)}
                  maxlength={500}
                />
              </View>
            </View>
          </CardContent>
        </Card>
      </ScrollView>

      {/* 底部提交按钮 */}
      <View 
        className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 py-3"
          onClick={handleSubmit}
          disabled={submitting}
        >
          <Text className="text-white font-medium">{submitting ? '提交中...' : '提交巡检记录'}</Text>
        </Button>
      </View>
    </View>
  )
}
