export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '新增巡检' })
  : { navigationBarTitleText: '新增巡检' }
