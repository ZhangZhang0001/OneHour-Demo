import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Textarea } from '@tarojs/components'
import { Network } from '@/network'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface FeedbackSheetProps {
  open: boolean
  onClose: () => void
}

export default function FeedbackSheet({ open, onClose }: FeedbackSheetProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

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
        data: { content },
      })
      Taro.showToast({ title: '提交成功', icon: 'success' })
      setContent('')
      onClose()
    } catch (err) {
      Taro.showToast({ title: '提交失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>匿名反馈</SheetTitle>
        </SheetHeader>
        <View className="mt-6 space-y-4">
          <Text className="block text-sm text-slate-600">
            欢迎提出您的宝贵意见，我们会认真对待每一条反馈。
          </Text>
          <View className="bg-slate-50 rounded-2xl p-4">
            <Textarea
              value={content}
              placeholder="请输入您的反馈..."
              maxlength={500}
              onInput={handleContentChange}
              style={{ width: '100%', minHeight: '120px', backgroundColor: 'transparent' }}
            />
          </View>
          <View className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? '提交中...' : '提交'}
            </Button>
          </View>
        </View>
      </SheetContent>
    </Sheet>
  )
}
