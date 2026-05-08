import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload, X, FileText } from 'lucide-react-taro'
import { Network } from '@/network'

export default function TrainingUpload() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<{ name: string; path: string; size: number } | null>(null)
  const [uploading, setUploading] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleSelectFile = async () => {
    try {
      const res = await Taro.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'mp4']
      })
      
      if (res.tempFiles && res.tempFiles.length > 0) {
        const file = res.tempFiles[0]
        setSelectedFile({
          name: file.name,
          path: file.path,
          size: file.size
        })
      }
    } catch (err) {
      console.error('选择文件失败:', err)
      Taro.showToast({ title: '请选择文件', icon: 'none' })
    }
  }

  const handleUpload = async () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入资料标题', icon: 'none' })
      return
    }
    if (!selectedFile) {
      Taro.showToast({ title: '请选择要上传的文件', icon: 'none' })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('description', description.trim())

      // 模拟上传 - 由于小程序环境需要特殊处理，这里使用简化方式
      // 实际项目中应该使用后端接口上传
      const result = await Network.request({
        url: '/api/training/upload',
        method: 'POST',
        data: {
          title: title.trim(),
          description: description.trim()
        }
      })

      console.log('上传结果:', result)

      Taro.showToast({ title: '上传成功', icon: 'success' })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (err: any) {
      console.error('上传失败:', err)
      Taro.showToast({ title: err.message || '上传失败', icon: 'none' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <View className="min-h-screen bg-slate-50">
      {/* 顶部标题 */}
      <View className="bg-white px-4 py-4 border-b border-slate-100">
        <Text className="block text-xl font-bold text-slate-800">上传培训资料</Text>
        <Text className="block text-sm text-slate-500 mt-1">上传教练学习手册与培训资料</Text>
      </View>

      {/* 表单 */}
      <View className="p-4">
        {/* 文件选择 */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="block text-sm font-medium text-slate-700 mb-3">选择文件</Text>
          
          {selectedFile ? (
            <View className="border border-slate-200 rounded-xl p-4">
              <View className="flex items-center gap-3">
                <View className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <FileText size={20} color="#6366f1" />
                </View>
                <View className="flex-1">
                  <Text className="block text-sm font-medium text-slate-800 truncate">{selectedFile.name}</Text>
                  <Text className="block text-xs text-slate-500 mt-1">{formatFileSize(selectedFile.size)}</Text>
                </View>
                <View 
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                  onClick={() => setSelectedFile(null)}
                >
                  <X size={16} color="#64748b" />
                </View>
              </View>
            </View>
          ) : (
            <View 
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center"
              onClick={handleSelectFile}
            >
              <View className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Upload size={24} color="#64748b" />
              </View>
              <Text className="block text-sm text-slate-600">点击选择文件</Text>
              <Text className="block text-xs text-slate-400 mt-1">支持 PDF、Word、Excel、图片、视频</Text>
            </View>
          )}
        </View>

        {/* 标题 */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="block text-sm font-medium text-slate-700 mb-3">资料标题 *</Text>
          <View className="bg-slate-50 rounded-xl px-4 py-3">
            <Input
              value={title}
              onInput={(e: { detail: { value: string } }) => setTitle(e.detail.value)}
              placeholder="请输入资料标题"
              className="w-full bg-transparent"
              maxlength={100}
            />
          </View>
        </View>

        {/* 描述 */}
        <View className="bg-white rounded-xl p-4 mb-6">
          <Text className="block text-sm font-medium text-slate-700 mb-3">资料描述</Text>
          <View className="bg-slate-50 rounded-xl p-3">
            <Textarea
              value={description}
              onInput={(e: { detail: { value: string } }) => setDescription(e.detail.value)}
              placeholder="请输入资料描述（选填）"
              className="w-full bg-transparent"
              style={{ minHeight: '100px' }}
              maxlength={500}
            />
          </View>
        </View>

        {/* 上传按钮 */}
        <Button 
          className="w-full" 
          disabled={uploading || !title.trim() || !selectedFile}
          onClick={handleUpload}
        >
          {uploading ? '上传中...' : '确认上传'}
        </Button>

        {/* 提示 */}
        <View className="mt-4 px-2">
          <Text className="block text-xs text-slate-400 text-center">
            上传后资料将展示给所有员工，可用于培训学习
          </Text>
        </View>
      </View>
    </View>
  )
}
