import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { BookOpen, Plus, Search, ArrowRight } from 'lucide-react-taro'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Network } from '@/network'

interface TrainingMaterial {
  id: number
  title: string
  description: string
  file_url: string
  created_at: string
}

export default function Training() {
  const [materials, setMaterials] = useState<TrainingMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')

  // 页面显示时刷新数据（从上传页面返回时）
  useDidShow(() => {
    fetchMaterials()
  })

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      setLoading(true)
      const res = await Network.request({
        url: '/api/training/list',
        method: 'GET'
      })
      if (res.data?.code === 200) {
        // 后端返回 { materials: [...] }，需要取 res.data.data.materials
        const materialsData = res.data.data?.materials || res.data.data || []
        setMaterials(Array.isArray(materialsData) ? materialsData : [])
      }
    } catch (err) {
      console.error('获取培训资料失败', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    m.description.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  const navigateTo = (path: string) => {
    if (path.startsWith('/')) {
      Taro.navigateTo({ url: path })
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchKeyword(value)
  }

  return (
    <View className="min-h-screen bg-slate-50 pb-safe">
      {/* 顶部标题 */}
      <View className="bg-white px-4 py-4 border-b border-slate-100">
        <Text className="block text-xl font-bold text-slate-800">培训资料</Text>
        <Text className="block text-sm text-slate-500 mt-1">教练学习手册与培训资料</Text>
      </View>

      {/* 搜索框 */}
      <View className="px-4 py-3">
        <View className="bg-white rounded-xl px-4 py-3 flex items-center gap-3">
          <Search size={18} color="#94a3b8" />
          <Input
            value={searchKeyword}
            onInput={(e: { detail: { value: string } }) => handleSearchChange(e.detail.value)}
            placeholder="搜索培训资料..."
            className="flex-1 bg-transparent"
          />
        </View>
      </View>

      {/* 添加按钮 */}
      <View className="px-4 pb-3">
        <Button className="w-full" onClick={() => Taro.navigateTo({ url: '/pages/training/upload' })}>
          <Plus size={18} color="#ffffff" />
          <Text className="ml-2 text-white">上传培训资料</Text>
        </Button>
      </View>

      {/* 资料列表 */}
      <View className="px-4 pb-4">
        {loading ? (
          <View className="bg-white rounded-xl p-8 text-center">
            <Text className="block text-slate-500">加载中...</Text>
          </View>
        ) : filteredMaterials.length > 0 ? (
          filteredMaterials.map((material) => (
            <View 
              key={material.id}
              className="bg-white rounded-xl mb-3 overflow-hidden"
              onClick={() => {
                // 缓存当前材料数据供详情页使用
                Taro.setStorageSync('materialDetail', material)
                navigateTo(`/pages/training/detail?id=${material.id}`)
              }}
            >
              <View className="p-4">
                <View className="flex items-start gap-3">
                  <View className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={24} color="#6366f1" />
                  </View>
                  <View className="flex-1">
                    <Text className="block text-base font-medium text-slate-800">{material.title}</Text>
                    <Text className="block text-sm text-slate-500 mt-1 line-clamp-2">{material.description}</Text>
                    <Text className="block text-xs text-slate-400 mt-2">
                      {new Date(material.created_at).toLocaleDateString('zh-CN')}
                    </Text>
                  </View>
                  <ArrowRight size={20} color="#94a3b8" />
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-white rounded-xl p-8 text-center">
            <BookOpen size={48} color="#cbd5e1" />
            <Text className="block text-slate-500 mt-3">暂无培训资料</Text>
            <Text className="block text-sm text-slate-400 mt-1">点击上方按钮上传培训资料</Text>
          </View>
        )}
      </View>

      {/* 底部安全区域 */}
      <View className="h-safe" />
    </View>
  )
}
