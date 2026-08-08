import { Layout } from 'antd'
import { Outlet } from 'react-router'
import { AppHeader } from './header'
import { AppMenu } from './menu'

export function AppLayout() {
  const [siderCollapsed, setSiderCollapsed] = useState(false)

  return <Layout css={s.root}>
    <Layout.Header css={s.header}>
      <AppHeader />
    </Layout.Header>

    <Layout>
      <Layout.Sider
        css={s.sider}
        theme="light"
        collapsible
        collapsed={siderCollapsed}
        onCollapse={setSiderCollapsed}
      >
        <AppMenu />
      </Layout.Sider>

      <Layout css={s.main}>
        <Outlet />
      </Layout>
    </Layout>
  </Layout>
}

const s = {
  root: css`
    height: 100vh;
    overflow: hidden;
  `,

  header: css`
    background-color: #fff;
    border-bottom: 1px solid #f5f5f5;
    padding: 0;
    height: auto;
    line-height: unset;
  `,

  sider: css`
    padding-top: 4px;
    .ant-layout-sider-children {
      overflow-y: auto;
    }
  `,

  main: css`
    & > .page {
      background-color: #fff;
      border-radius: 3px;
      box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.05);
      flex: 1;
      margin: 16px;
      padding: 16px;
    }
  `,
}
