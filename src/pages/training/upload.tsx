import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload, X, FileText, Plus } from 'lucide-react-taro'
import { Network } from '@/network'

export default function TrainingUpload() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<{ name: string; path: string; size: number } | null>(null)
  const [uploading, setUploading] = useState(false)

  // 检测是否是小程序环境
  const envType = Taro.getEnv()
  const isMiniApp = envType === Taro.ENV_TYPE.WEAPP || envType === Taro.ENV_TYPE.TT

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleSelectFile = () => {
    console.log('点击选择文件, isMiniApp:', isMiniApp, 'envType:', envType)

    if (!isMiniApp) {
      Taro.showToast({ title: '请在微信/抖音小程序中使用', icon: 'none', duration: 3000 })
      return
    }

    try {
      // 小程序端使用 chooseMessageFile
      Taro.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'mp4']
      }).then(res => {
        console.log('选择文件结果:', res)
        if (res.tempFiles && res.tempFiles.length > 0) {
          const file = res.tempFiles[0]
          setSelectedFile({
            name: file.name,
            path: file.path,
            size: file.size
          })
          Taro.showToast({ title: '已选择: ' + file.name, icon: 'none', duration: 2000 })
        }
      }).catch(err => {
        console.error('选择文件失败:', err)
        Taro.showToast({ title: '选择文件失败: ' + (err.errMsg || '未知错误'), icon: 'none' })
      })
    } catch (err: any) {
      console.error('选择文件异常:', err)
      Taro.showToast({ title: '选择文件失败', icon: 'none' })
    }
  }

  const handleUpload = async () => {
    console.log('点击上传, title:', title, 'selectedFile:', selectedFile)

    if (!title.trim()) {
      Taro.showToast({ title: '请输入资料标题', icon: 'none' })
      return
    }
    if (!selectedFile) {
      Taro.showToast({ title: '请先选择要上传的文件', icon: 'none' })
      return
    }

    setUploading(true)
    Taro.showLoading({ title: '上传中...' })

    try {
      console.log('开始上传文件:', selectedFile.path)
      
      // 使用 Network.uploadFile 上传文件（跨端兼容）
      const result = await Network.uploadFile({
        url: '/api/training/upload',
        filePath: selectedFile.path,
        name: 'file',
        formData: {
          title: title.trim(),
          description: description.trim()
        }
      })

      console.log('上传结果:', result)

      // 解析响应
      const response = result.data as { code?: number; msg?: string }
      if (response.code === 200 || response.code === 0) {
        Taro.showToast({ title: '上传成功', icon: 'success' })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } else {
        Taro.showToast({ title: response.msg || '上传失败', icon: 'none' })
      }
    } catch (err: any) {
      console.error('上传失败:', err)
      Taro.showToast({ title: '上传失败: ' + (err.message || '请重试'), icon: 'none' })
    } finally {
      setUploading(false)
      Taro.hideLoading()
    }
  }

  return (
    <View className="min-h-screen bg-gray-50 p-4">
      {/* 页面标题 */}
      <View className="mb-6">
        <Text className="block text-xl font-bold text-gray-800">上传培训资料</Text>
        <Text className="block text-sm text-gray-500 mt-1">支持 PDF、Word、Excel、图片、视频等格式</Text>
      </View>

      {/* 文件选择区域 */}
      <View className="mb-4">
        <Text className="block text-base font-medium text-gray-700 mb-2">选择文件 *</Text>
        {selectedFile ? (
          <View className="bg-white rounded-xl p-4 border border-gray-200">
            <View className="flex items-center justify-between">
              <View className="flex items-center flex-1">
                <FileText size={24} color="#3b82f6" />
                <View className="flex-1 ml-3">
                  <Text className="block text-sm font-medium text-gray-800 truncate">{selectedFile.name}</Text>
                  <Text className="block text-xs text-gray-500 mt-1">{formatFileSize(selectedFile.size)}</Text>
                </View>
              </View>
              <View 
                className="ml-3 p-2"
                onClick={() => {
                  setSelectedFile(null)
                  Taro.showToast({ title: '已取消选择', icon: 'none' })
                }}
              >
                <X size={20} color="#9ca3af" />
              </View>
            </View>
          </View>
        ) : (
          <View 
            className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 flex flex-col items-center justify-center"
            onClick={handleSelectFile}
          >
            <Upload size={32} color="#9ca3af" />
            <Text className="block text-sm text-gray-500 mt-2">点击选择文件</Text>
            <Text className="block text-xs text-gray-400 mt-1">PDF/Word/Excel/图片/视频</Text>
            {!isMiniApp && (
              <Text className="block text-xs text-amber-500 mt-2">（小程序专享）</Text>
            )}
          </View>
        )}
      </View>

      {/* 标题输入 */}
      <View className="mb-4">
        <Text className="block text-base font-medium text-gray-700 mb-2">资料标题 *</Text>
        <View className="bg-white rounded-xl px-4 py-3 border border-gray-200">
          <Input
            className="w-full"
            placeholder="请输入资料标题"
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            maxlength={100}
          />
        </View>
        <Text className="block text-xs text-gray-400 mt-1 text-right">{title.length}/100</Text>
      </View>

      {/* 描述输入 */}
      <View className="mb-6">
        <Text className="block text-base font-medium text-gray-700 mb-2">资料描述</Text>
        <View className="bg-white rounded-xl p-4 border border-gray-200">
          <Textarea
            style={{ width: '100%', minHeight: '100px', backgroundColor: 'transparent' }}
            placeholder="请输入资料描述（选填）"
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={500}
          />
        </View>
        <Text className="block text-xs text-gray-400 mt-1 text-right">{description.length}/500</Text>
      </View>

      {/* 提交按钮 */}
      <View className="mt-4">
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-base font-medium"
          onClick={handleUpload}
          disabled={uploading}
        >
          <Plus size={18} color="#ffffff" />
          <Text className="ml-2 text-white">{uploading ? '上传中...' : '确认上传'}</Text>
        </Button>
      </View>

      {/* 提示信息 */}
      <View className="mt-6 bg-blue-50 rounded-xl p-4">
        <Text className="block text-sm text-blue-700">
          上传说明：{'\n'}
          1. 支持 PDF、Word、Excel、图片、视频等格式{'\n'}
          2. 文件大小建议不超过 50MB{'\n'}
          3. 请确保填写资料标题{'\n'}
          {!isMiniApp && '4. 此功能仅在小程序中可用'}
        </Text>
      </View>
    </View>
  )
}
