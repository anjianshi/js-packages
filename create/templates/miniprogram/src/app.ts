import { type AppData, loadAppData } from '@/lib/app-data'

App<IAppOption<AppData>>({
  globalData: loadAppData(),
  onLaunch() {},
})
