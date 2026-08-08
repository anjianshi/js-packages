import { EmotionCacheProvider } from '@anjianshi/utils/env-react/emotion'
import { initDayJs } from '@anjianshi/utils/init-dayjs'
import { StyleProvider } from '@ant-design/cssinjs'
import { ConfigProvider, App as AntdApp } from 'antd'
import zhCn from 'antd/locale/zh_CN'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { router } from './router'

import './style.css'

initDayJs()

export function renderApp() {
  function AntdWrapper() {
    return <EmotionCacheProvider>
      <StyleProvider layer>
        <ConfigProvider
          locale={zhCn}
          theme={{
            token: {},
            components: {},
          }}
        >
          <AntdApp>
            <RouterProvider router={router} />
          </AntdApp>
        </ConfigProvider>
      </StyleProvider>
    </EmotionCacheProvider>
  }

  const $root = document.createElement('div')
  $root.id = 'root'
  document.body.appendChild($root)
  const root = createRoot($root)
  root.render(<AntdWrapper />)
}
