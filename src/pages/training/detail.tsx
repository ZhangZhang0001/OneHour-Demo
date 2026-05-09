import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Network } from '@/network'
import { BookOpen, Calendar, FileText, ExternalLink, ArrowLeft } from 'lucide-react-taro'

interface MaterialDetail {
  id: number
  title: string
  description: string
  file_type: string
  file_key: string
  created_at: string
}

export default function TrainingDetail() {
  const [material, setMaterial] = useState<MaterialDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewUrl, setViewUrl] = useState('')

  const id = Taro.getStorageSync('currentMaterialId')

  useEffect(() => {
    if (id) {
      Taro.setStorageSync('currentMaterialId', '')
      fetchDetail()
    } else {
      const pages = Taro.getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const options = (currentPage as any).options || {}
      if (options.id) {
        fetchDetailById(options.id)
      }
    }
  }, [])

  const fetchDetail = async () => {
    try {
      setLoading(true)
      // 从列表数据中获取（通过缓存）
      const cached = Taro.getStorageSync('materialDetail')
      if (cached) {
        setMaterial(cached)
        Taro.removeStorageSync('materialDetail')
        // 获取预览链接
        if (cached.file_key) {
          fetchViewUrl(cached.file_key)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchDetailById = async (materialId: string) => {
    try {
      setLoading(true)
      const res = await Network.request({
        url: '/api/training/list',
        method: 'GET'
      })
      if (res.data?.code === 200) {
        const materials = res.data.data?.materials || []
        const found = materials.find((m: any) => m.id === parseInt(materialId))
        if (found) {
          setMaterial(found)
          if (found.file_key) {
            fetchViewUrl(found.file_key)
          }
        }
      }
    } catch (err) {
      console.error('获取详情失败', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchViewUrl = async (fileKey: string) => {
    try {
      const res = await Network.request({
        url: '/api/training/view',
        method: 'POST',
        data: { file_key: fileKey }
      })
      if (res.data?.code === 200) {
        setViewUrl(res.data.data?.url || '')
      }
    } catch (err) {
      console.error('获取预览链接失败', err)
    }
  }

  const handlePreview = () => {
    if (!viewUrl) {
      Taro.showToast({ title: '文件加载中，请稍候', icon: 'none' })
      return
    }
    Taro.showLoading({ title: '正在打开文件...' })
    // 使用 Network.downloadFile 下载文件
    Network.downloadFile({
      url: viewUrl,
      success: (res) => {
        Taro.hideLoading()
        if (res.statusCode === 200) {
          // 对于图片等可以直接预览的文件
          const fileType = material?.file_type || ''
          if (fileType.startsWith('image/')) {
            Taro.previewImage({ urls: [res.tempFilePath || [res.filePath as string]] } as any)
          } else {
            // 其他文件类型，尝试打开
            Taro.openDocument({
              filePath: res.tempFilePath || res.filePath as string,
              fileType: getFileExtension(material?.file_type || '') as any,
              success: () => {
                console.log('打开文件成功')
              },
              fail: () => {
                Taro.showToast({ title: '无法打开此文件类型', icon: 'none' })
              }
            })
          }
        }
      },
      fail: (err) => {
        Taro.hideLoading()
        console.error('下载文件失败', err)
        Taro.showToast({ title: '文件打开失败', icon: 'none' })
      }
    })
  }

  const getFileExtension = (mimeType: string): string => {
    const types: Record<string, string> = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'video/mp4': 'mp4',
    }
    return types[mimeType] || ''
  }

  return (
    <View className="min-h-screen bg-slate-50 p-4">
      {/* 返回按钮 */}
      <View 
        className="flex items-center mb-4"
        onClick={() => Taro.navigateBack()}
      >
        <ArrowLeft size={20} color="#64748b" />
        <Text className="block text-sm text-slate-600 ml-2">返回</Text>
      </View>

      {loading ? (
        <View className="bg-white rounded-xl p-8 text-center">
          <Text className="block text-slate-500">加载中...</Text>
        </View>
      ) : material ? (
        <>
          {/* 标题区域 */}
          <View className="bg-white rounded-xl p-4 mb-4">
            <Text className="block text-xl font-semibold text-slate-800">{material.title}</Text>
            <View className="flex items-center mt-3">
              <Calendar size={14} color="#94a3b8" />
              <Text className="block text-xs text-slate-400 ml-1">
                {new Date(material.created_at).toLocaleDateString('zh-CN')}
              </Text>
            </View>
          </View>

          {/* 描述区域 */}
          {material.description && (
            <View className="bg-white rounded-xl p-4 mb-4">
              <View className="flex items-center mb-2">
                <FileText size={16} color="#6366f1" />
                <Text className="block text-sm font-medium text-slate-700 ml-2">资料描述</Text>
              </View>
              <Text className="block text-sm text-slate-600 leading-relaxed">{material.description}</Text>
            </View>
          )}

          {/* 文件预览按钮 */}
          <View className="bg-white rounded-xl p-4">
            <View className="flex items-center mb-3">
              <BookOpen size={16} color="#6366f1" />
              <Text className="block text-sm font-medium text-slate-700 ml-2">培训文件</Text>
            </View>
            
            <View 
              className="bg-indigo-50 rounded-xl p-4 flex items-center justify-between"
              onClick={handlePreview}
            >
              <View className="flex items-center flex-1">
                <View className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <BookOpen size={20} color="#6366f1" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="block text-sm font-medium text-slate-700">
                    {material.title}
                  </Text>
                  <Text className="block text-xs text-slate-500 mt-1">
                    {material.file_type || '未知格式'}
                  </Text>
                </View>
              </View>
              <View className="flex items-center">
                <Text className="block text-sm text-indigo-600 mr-1">点击查看</Text>
                <ExternalLink size={16} color="#6366f1" />
              </View>
            </View>

            {!viewUrl && (
              <Text className="block text-xs text-slate-400 mt-2 text-center">正在加载文件...</Text>
            )}
          </View>
        </>
      ) : (
        <View className="bg-white rounded-xl p-8 text-center">
          <BookOpen size={48} color="#cbd5e1" />
          <Text className="block text-slate-500 mt-3">未找到该资料</Text>
        </View>
      )}
    </View>
  )
}
