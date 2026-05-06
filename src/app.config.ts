export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/training/index',
    'pages/training/detail',
    'pages/inspection/index',
    'pages/inspection/add',
    'pages/inspection/detail',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '健身房管理',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#1e40af',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: './assets/tabbar/home.png',
        selectedIconPath: './assets/tabbar/home-active.png'
      },
      {
        pagePath: 'pages/training/index',
        text: '培训资料',
        iconPath: './assets/tabbar/book-open.png',
        selectedIconPath: './assets/tabbar/book-open-active.png'
      },
      {
        pagePath: 'pages/inspection/index',
        text: '器械巡检',
        iconPath: './assets/tabbar/wrench.png',
        selectedIconPath: './assets/tabbar/wrench-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: './assets/tabbar/settings.png',
        selectedIconPath: './assets/tabbar/settings-active.png'
      }
    ]
  }
})
