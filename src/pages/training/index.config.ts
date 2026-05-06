export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '培训资料' })
  : { navigationBarTitleText: '培训资料' }
