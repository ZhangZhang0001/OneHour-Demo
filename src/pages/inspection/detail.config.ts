export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '巡检详情' })
  : { navigationBarTitleText: '巡检详情' }
