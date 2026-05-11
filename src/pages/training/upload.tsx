import { useState, useRef } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { X, FileText, Plus } from 'lucide-react-taro'
import { Network } from '@/network'

export default function TrainingUpload() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<{ name: string; path: string; size: number } | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 检测是否是小程序环境
  const envType = Taro.getEnv()
  const isMiniApp = envType === Taro.ENV_TYPE.WEAPP || envType === Taro.ENV_TYPE.TT

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // 自动提取文件名（不含扩展名）填入标题
  const autoFillTitle = (fileName: string) => {
    const lastDotIndex = fileName.lastIndexOf('.')
    const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : ''
    const hasKnownExtension = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.jpg', '.jpeg', '.png', '.mp4'].includes(extension.toLowerCase())
    const fileNameWithoutExt = hasKnownExtension 
      ? fileName.substring(0, lastDotIndex).trim() 
      : fileName.trim()
    setTitle(fileNameWithoutExt)
  }

  // 处理 H5 文件选择
  const handleH5FileChange = (e: any) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('H5 选择文件:', file.name, file.size)
      setSelectedFile({
        name: file.name,
        path: file.name, // H5 下使用文件名作为标识
        size: file.size
      })
      autoFillTitle(file.name)
      Taro.showToast({ title: '已选择: ' + file.name, icon: 'none', duration: 2000 })
    }
  }

  // 触发 H5 文件选择
  const triggerH5FileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleSelectFile = () => {
    console.log('点击选择文件, isMiniApp:', isMiniApp, 'envType:', envType)

    if (!isMiniApp) {
      // H5 环境：触发原生文件选择
      triggerH5FileSelect()
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
          autoFillTitle(file.name)
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

    // H5 环境暂不支持上传
    if (!isMiniApp) {
      Taro.showToast({ title: '文件上传仅支持小程序环境', icon: 'none', duration: 3000 })
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
      console.log('result.data:', result.data)

      // 解析响应 - 确保正确获取响应数据
      let responseData: any = result.data
      if (typeof responseData === 'string') {
        responseData = JSON.parse(responseData)
      }
      
      // 检查响应是否成功
      const isSuccess = responseData && responseData.code === 200
      
      if (isSuccess) {
        console.log('上传成功，准备跳转')
        // 先跳转，再显示提示（避免提示被跳转覆盖）
        Taro.navigateBack().catch(() => {
          Taro.reLaunch({ url: '/pages/training/index' })
        })
        Taro.showToast({ title: '上传成功', icon: 'success', duration: 2000 })
      } else {
        console.log('上传失败:', responseData)
        Taro.showToast({ title: responseData?.msg || '上传失败', icon: 'none' })
      }
    } catch (err: any) {
      console.error('上传失败:', err)
      // 显示详细错误信息
      const errorMsg = err.message || '网络错误，请检查网络后重试'
      Taro.showToast({ title: '上传失败: ' + errorMsg, icon: 'none', duration: 3000 })
    } finally {
      setUploading(false)
      Taro.hideLoading()
    }
  }

  return (
    <View className="min-h-screen bg-gray-50 p-4">
      {/* H5 隐藏的文件输入框 */}
      {!isMiniApp && (
        <View style={{ display: 'none' }}>
          <input
            ref={fileInputRef as any}
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.mp4"
            onChange={handleH5FileChange}
          />
        </View>
      )}

      {/* 页面标题 */}
      <View className="mb-6">
        <Text className="block text-xl font-bold text-gray-800">上传培训资料</Text>
        <Text className="block text-sm text-gray-500 mt-1">支持 PDF、Word、Excel、图片、视频等格式</Text>
      </View>

      {/* 标题输入 */}
      <View className="mb-4">
        <Text className="block text-sm font-medium text-gray-700 mb-2">资料标题</Text>
        <View className="bg-white rounded-xl px-4 py-3">
          <Input
            className="w-full text-base"
            placeholder="请输入资料标题"
            value={title}
            onInput={(e: any) => setTitle(e.detail?.value || e.target?.value || title)}
            maxlength={100}
          />
        </View>
      </View>

      {/* 描述输入 */}
      <View className="mb-4">
        <Text className="block text-sm font-medium text-gray-700 mb-2">资料描述</Text>
        <View className="bg-white rounded-xl p-4">
          <Textarea
            style={{ width: '100%', minHeight: '100px', backgroundColor: 'transparent' }}
            placeholder="请输入资料描述（选填）"
            value={description}
            onInput={(e: any) => setDescription(e.detail?.value || e.target?.value || description)}
            maxlength={500}
          />
        </View>
      </View>

      {/* 文件选择 */}
      <View className="mb-6">
        <Text className="block text-sm font-medium text-gray-700 mb-2">选择文件</Text>
        
        {selectedFile ? (
          // 已选择文件显示
          <View className="bg-white rounded-xl p-4 flex flex-row items-center">
            <View className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
              <FileText size={24} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="block text-base font-medium text-gray-800 truncate">{selectedFile.name}</Text>
              <Text className="block text-sm text-gray-500 mt-1">{formatFileSize(selectedFile.size)}</Text>
            </View>
            <View 
              onClick={() => setSelectedFile(null)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ml-2"
            >
              <X size={16} color="#6B7280" />
            </View>
          </View>
        ) : (
          // 未选择文件显示
          <View 
            onClick={handleSelectFile}
            className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center"
          >
            <View className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <Plus size={24} color="#6B7280" />
            </View>
            <Text className="block text-sm text-gray-500">点击选择文件</Text>
            <Text className="block text-xs text-gray-400 mt-1">支持 PDF、Word、Excel、图片、视频</Text>
          </View>
        )}
      </View>

      {/* 上传按钮 */}
      <View className="mt-8">
        <Button 
          onClick={handleUpload} 
          disabled={uploading}
          className="w-full bg-primary text-white"
        >
          {uploading ? '上传中...' : '确认上传'}
        </Button>
      </View>
    </View>
  )
}
