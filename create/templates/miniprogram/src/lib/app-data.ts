export interface AppData {
  count: number
}

const initialAppData: AppData = {
  count: 0,
}

// -------------------------------

const dataKey = 'app-data-v1'

export function loadAppData() {
  return wx.getStorageSync<AppData | undefined>(dataKey) ?? initialAppData
}

export function getAppData() {
  return getApp().globalData as AppData
}

function setAppData(data: AppData): void
function setAppData(callback: (appData: AppData) => AppData): void // eslint-disable-line @typescript-eslint/unified-signatures
function setAppData(callback: (appData: AppData) => void): void // eslint-disable-line @typescript-eslint/unified-signatures
function setAppData(
  dataOrCallback: AppData | ((appData: AppData) => AppData) | ((appData: AppData) => void),
) {
  let data: AppData
  if (typeof dataOrCallback === 'function') {
    const origData = getAppData()
    const result = dataOrCallback(origData)
    if (typeof result === 'object') data = result
    else data = origData
  } else {
    data = dataOrCallback
  }

  getApp().globalData = data
  wx.setStorage({
    key: dataKey,
    data,
    fail(e) {
      console.log('保存 appData 失败', e)
    },
  })
}
export { setAppData }
