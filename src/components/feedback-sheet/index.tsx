import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Textarea } from '@tarojs/components'
import { Network } from '@/network'
import { X, Lightbulb, Package, Info } from 'lucide-react-taro'

interface FeedbackSheetProps {
  open: boolean
  onClose: () => void
}

const typeOptions = [
  { key: 'suggestion', label: '建议', color: 'blue', icon: Lightbulb },
  { key: 'need', label: '需求', color: 'purple', icon: Package },
  { key: 'problem', label: '问题', color: 'red', icon: Info },
]

export default function FeedbackSheet({ open, onClose }: FeedbackSheetProps) {
  const [content, setContent] = useState('')
  const [type, setType] = useState('suggestion')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleContentChange = (e: any) => {
    setContent(e.target.value)
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      Taro.showToast({ title: '请输入反馈内容', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      await Network.request({
        url: '/api/feedback/submit',
        method: 'POST',
        data: { content: content.trim(), type },
      })
      Taro.showToast({ title: '提交成功', icon: 'success' })
      setContent('')
      setType('suggestion')
      onClose()
    } catch (err) {
      console.error('提交反馈失败', err)
      Taro.showToast({ title: '提交失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const getColorClass = (color: string, isSelected: boolean) => {
    if (!isSelected) return 'bg-gray-100 text-gray-600'
    switch (color) {
      case 'blue': return 'bg-blue-500 text-white'
      case 'purple': return 'bg-purple-500 text-white'
      case 'red': return 'bg-red-500 text-white'
      default: return 'bg-blue-500 text-white'
    }
  }

  return (
    <View className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 遮罩 */}
      <View 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      {/* 内容 */}
      <View className="relative w-full bg-white rounded-t-2xl p-4 pb-safe">
        {/* 标题栏 */}
        <View className="flex items-center justify-between mb-4">
          <Text className="block text-lg font-semibold text-gray-900">匿名反馈</Text>
          <View 
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
            onClick={onClose}
          >
            <X size={18} color="#666" />
          </View>
        </View>

        {/* 类型选择 */}
        <View className="mb-4">
          <Text className="block text-sm text-gray-600 mb-2">反馈类型</Text>
          <View className="flex gap-2">
            {typeOptions.map((item) => {
              const Icon = item.icon
              const isSelected = type === item.key
              return (
                <View
                  key={item.key}
                  className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1 ${getColorClass(item.color, isSelected)}`}
                  onClick={() => setType(item.key)}
                >
                  <Icon size={14} color={isSelected ? '#ffffff' : '#64748b'} />
                  <Text className={`text-sm ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                    {item.label}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>
        
        {/* 输入框 */}
        <View className="bg-gray-50 rounded-xl p-3 mb-4">
          <Textarea
            className="w-full text-sm text-gray-800 min-h-32"
            placeholder="请输入您的反馈内容..."
            value={content}
            onInput={handleContentChange}
            maxlength={500}
          />
        </View>
        
        {/* 提交按钮 */}
        <View 
          className={`rounded-xl py-3 text-center ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
          onClick={loading ? undefined : handleSubmit}
        >
          <Text className="block text-white font-medium">{loading ? '提交中...' : '提交反馈'}</Text>
        </View>
      </View>
    </View>
  )
}
