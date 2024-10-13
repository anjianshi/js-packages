import { initDayJs } from '@anjianshi/utils/init-dayjs'
import { ConfigProvider, App as AntdApp } from 'antd'
import zhCn from 'antd/locale/zh_CN'
import type React from 'react'
import { createRoot } from 'react-dom/client'

initDayJs()

export function renderApp(App: () => React.ReactNode) {
  function AntdWrapper() {
    return <ConfigProvider
      locale={zhCn}
      theme={{
        token: {},
        components: {},
      }}
    >
      <AntdApp>
        <App />
      </AntdApp>
    </ConfigProvider>
  }

  const $root = document.createElement('div')
  $root.id = 'root'
  document.body.appendChild($root)
  const root = createRoot($root)
  root.render(<AntdWrapper />)
}
