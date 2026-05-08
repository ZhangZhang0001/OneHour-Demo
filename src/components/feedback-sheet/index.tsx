import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Textarea } from '@tarojs/components'
import { Network } from '@/network'
import { X } from 'lucide-react-taro'

interface FeedbackSheetProps {
  open: boolean
  onClose: () => void
}

export default function FeedbackSheet({ open, onClose }: FeedbackSheetProps) {
  const [content, setContent] = useState('')
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
        data: { content: content.trim() },
      })
      Taro.showToast({ title: '提交成功', icon: 'success' })
      setContent('')
      onClose()
    } catch (err) {
      console.error('提交反馈失败', err)
      Taro.showToast({ title: '提交失败', icon: 'none' })
    } finally {
      setLoading(false)
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
