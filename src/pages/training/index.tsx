import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { Network } from '@/network'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Upload, Search, Clock, Plus } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import './index.css'

interface TrainingMaterial {
  id: number
  title: string
  description: string
  file_type: string
  file_key: string
  created_at: string
}

export default function TrainingList() {
  const [materials, setMaterials] = useState<TrainingMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMaterial, setNewMaterial] = useState({ title: '', description: '' })
  const [selectedFile, setSelectedFile] = useState<{ path: string; name: string; type: string } | null>(null)

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      setLoading(true)
      const res = await Network.request({ url: '/api/training/list' })
      console.log('培训资料列表响应:', res.data)
      const list = res.data?.data?.materials || []
      setMaterials(list)
    } catch (error) {
      console.error('获取培训资料失败:', error)
      Taro.showToast({ title: '获取资料失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleChooseFile = () => {
    Taro.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        const file = res.tempFiles[0]
        setSelectedFile({
          path: file.path,
          name: file.name,
          type: file.type || 'application/octet-stream'
        })
      }
    })
  }

  const handleUpload = async () => {
    if (!newMaterial.title.trim()) {
      Taro.showToast({ title: '请输入资料标题', icon: 'none' })
      return
    }
    if (!selectedFile) {
      Taro.showToast({ title: '请选择文件', icon: 'none' })
      return
    }

    try {
      setUploading(true)
      Taro.showLoading({ title: '上传中...' })

      // 上传文件到存储
      const uploadRes = await Network.uploadFile({
        url: '/api/training/upload',
        filePath: selectedFile.path,
        name: 'file',
        header: { 'Content-Type': 'multipart/form-data' }
      })
      
      console.log('上传响应:', uploadRes)
      const result = JSON.parse(uploadRes.data)
      
      if (result.code === 200) {
        Taro.showToast({ title: '上传成功', icon: 'success' })
        setShowAddModal(false)
        setNewMaterial({ title: '', description: '' })
        setSelectedFile(null)
        fetchMaterials()
      } else {
        Taro.showToast({ title: result.msg || '上传失败', icon: 'none' })
      }
    } catch (error) {
      console.error('上传失败:', error)
      Taro.showToast({ title: '上传失败', icon: 'none' })
    } finally {
      setUploading(false)
      Taro.hideLoading()
    }
  }

  const handleViewMaterial = async (material: TrainingMaterial) => {
    try {
      Taro.showLoading({ title: '获取链接...' })
      const res = await Network.request({
        url: '/api/training/view',
        method: 'POST',
        data: { file_key: material.file_key }
      })
      console.log('获取查看链接响应:', res.data)
      Taro.hideLoading()

      if (res.data?.data?.url) {
        Network.downloadFile({
          url: res.data.data.url,
          success: (downloadRes) => {
            if (downloadRes.statusCode === 200) {
              Taro.openDocument({
                filePath: downloadRes.filePath,
                success: () => {
                  console.log('打开文档成功')
                },
                fail: () => {
                  Taro.showToast({ title: '无法打开此文件类型', icon: 'none' })
                }
              })
            }
          },
          fail: () => {
            Taro.showToast({ title: '下载失败', icon: 'none' })
          }
        })
      }
    } catch (error) {
      console.error('获取查看链接失败:', error)
      Taro.hideLoading()
      Taro.showToast({ title: '获取失败', icon: 'none' })
    }
  }

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    m.description.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  const getFileTypeBadge = (fileType: string) => {
    const typeMap: Record<string, { label: string; color: string }> = {
      'application/pdf': { label: 'PDF', color: 'bg-red-500' },
      'application/msword': { label: 'DOC', color: 'bg-blue-500' },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { label: 'DOCX', color: 'bg-blue-500' },
      'image/': { label: '图片', color: 'bg-green-500' }
    }
    for (const [key, value] of Object.entries(typeMap)) {
      if (fileType.includes(key.replace('/', ''))) {
        return <Badge className={`${value.color} text-white`}>{value.label}</Badge>
      }
    }
    return <Badge className="bg-gray-500 text-white">文件</Badge>
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  return (
    <View className="min-h-screen bg-slate-50 pb-safe">
      <ScrollView className="p-4" scrollY>
        {/* 搜索栏 */}
        <View className="mb-4">
          <View className="bg-white rounded-xl px-4 py-3 flex items-center gap-3">
            <Search size={18} color="#94a3b8" />
            <Input
              className="flex-1 bg-transparent border-none p-0"
              placeholder="搜索培训资料..."
              value={searchKeyword}
              onInput={(e) => setSearchKeyword(e.detail.value)}
            />
          </View>
        </View>

        {/* 上传按钮 */}
        <Button 
          className="w-full mb-4 bg-blue-600 hover:bg-blue-700" 
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} color="#fff" />
          <Text className="ml-2">上传新资料</Text>
        </Button>

        {/* 资料列表 */}
        {loading ? (
          <View className="text-center py-12">
            <Text className="block text-slate-400">加载中...</Text>
          </View>
        ) : filteredMaterials.length > 0 ? (
          <View className="space-y-3">
            {filteredMaterials.map((material) => (
              <Card key={material.id} onClick={() => handleViewMaterial(material)}>
                <CardContent className="p-4">
                  <View className="flex items-start gap-3">
                    <View className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <FileText size={24} color="#1e40af" />
                    </View>
                    <View className="flex-1 min-w-0">
                      <View className="flex items-center gap-2 mb-1">
                        <Text className="block text-base font-medium text-slate-800 truncate">{material.title}</Text>
                        {getFileTypeBadge(material.file_type)}
                      </View>
                      {material.description && (
                        <Text className="block text-sm text-slate-500 truncate">{material.description}</Text>
                      )}
                      <View className="flex items-center gap-3 mt-2">
                        <View className="flex items-center gap-1">
                          <Clock size={12} color="#94a3b8" />
                          <Text className="block text-xs text-slate-400">{formatDate(material.created_at)}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText size={48} color="#cbd5e1" />
              <Text className="block text-slate-400 mt-3">暂无培训资料</Text>
              <Text className="block text-sm text-slate-400 mt-1">点击上方按钮上传新资料</Text>
            </CardContent>
          </Card>
        )}
      </ScrollView>

      {/* 上传弹窗 */}
      {showAddModal && (
        <View className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <View className="w-full bg-white rounded-t-2xl p-4 pb-8">
            <View className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" />
            <Text className="block text-lg font-semibold text-slate-800 mb-4">上传培训资料</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="block text-sm text-slate-600 mb-1">资料标题</Text>
                <Input
                  className="bg-slate-50 rounded-xl px-4 py-3"
                  placeholder="请输入资料标题"
                  value={newMaterial.title}
                  onInput={(e) => setNewMaterial({ ...newMaterial, title: e.detail.value })}
                />
              </View>
              
              <View>
                <Text className="block text-sm text-slate-600 mb-1">资料描述（可选）</Text>
                <Input
                  className="bg-slate-50 rounded-xl px-4 py-3"
                  placeholder="请输入资料描述"
                  value={newMaterial.description}
                  onInput={(e) => setNewMaterial({ ...newMaterial, description: e.detail.value })}
                />
              </View>
              
              <View>
                <Text className="block text-sm text-slate-600 mb-1">选择文件</Text>
                <View 
                  className="bg-slate-50 rounded-xl p-4 border-2 border-dashed border-slate-300 text-center"
                  onClick={handleChooseFile}
                >
                  {selectedFile ? (
                    <View>
                      <FileText size={32} color="#1e40af" />
                      <Text className="block text-sm text-slate-600 mt-2">{selectedFile.name}</Text>
                    </View>
                  ) : (
                    <View>
                      <Upload size={32} color="#94a3b8" />
                      <Text className="block text-sm text-slate-400 mt-2">点击选择文件</Text>
                      <Text className="block text-xs text-slate-400">支持 PDF、Word、图片等格式</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View className="flex gap-3 pt-2">
                <Button 
                  className="flex-1 bg-slate-100 text-slate-700" 
                  onClick={() => {
                    setShowAddModal(false)
                    setNewMaterial({ title: '', description: '' })
                    setSelectedFile(null)
                  }}
                >
                  取消
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700" 
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? '上传中...' : '确认上传'}
                </Button>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
