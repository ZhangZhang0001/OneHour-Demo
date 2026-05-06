export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '器械巡检' })
  : { navigationBarTitleText: '器械巡检' }
