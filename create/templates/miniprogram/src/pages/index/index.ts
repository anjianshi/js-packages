import { getAppData, setAppData } from '@/lib/app-data'

Page({
  data: {
    count: getAppData().count,
  },

  click() {
    const count = this.data.count + 1
    this.setData({ count })
    setAppData(current => ({ ...current, count }))
  },
})
