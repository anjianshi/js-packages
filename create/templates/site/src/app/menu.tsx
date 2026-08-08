import {
  DashboardOutlined,
  ApartmentOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { Menu, type MenuProps } from 'antd'
import { useNavigate, useMatches } from 'react-router'

type MenuInfo = Parameters<Required<MenuProps>['onClick']>[0]
type MenuItem = Required<MenuProps>['items'][number]

/**
 * 菜单对应的页面路由，不在此表的菜单则不跳转
 */
const routes = [
  { key: 'dashboard', path: '/' },
  { key: 'schools', path: '/schools' },
  { key: 'school-ranking', path: '/schools/ranking' },
  { key: 'students', path: '/students' },
  { key: 'student-score', path: '/students/score' },
  { key: 'setting', path: '/setting' },
]

const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    label: '信息概览',
    icon: <DashboardOutlined />,
  },

  {
    key: 'school-manage',
    label: '学校管理',
    icon: <ApartmentOutlined />,
    children: [
      {
        key: 'schools',
        label: '学校列表',
      },
      {
        key: 'school-ranking',
        label: '学校排名',
      },
    ],
  },

  {
    key: 'student-manage',
    label: '学生管理',
    icon: <UserOutlined />,
    children: [
      {
        key: 'students',
        label: '学生列表',
      },
      {
        key: 'student-score',
        label: '成绩管理',
      },
    ],
  },

  {
    key: 'setting',
    label: '系统设置',
    icon: <SettingOutlined />,
  },
]

/**
 * 返回指定 key 的菜单项的完整 keyPath
 */
function getKeyPath(key: string, items?: MenuItem[]): string[] {
  items ??= menuItems
  for (const item of items) {
    if (item?.key === undefined) continue
    if (item.key === key) return [key]
    if ('children' in item && item.children) {
      const subKeyPath = getKeyPath(key, item.children)
      if (subKeyPath.length) return [String(item.key), ...subKeyPath]
    }
  }
  return []
}

export function AppMenu() {
  const navigate = useNavigate()
  const matches = useMatches()

  const { defaultSelectedKeys, defaultOpenKeys } = useMemo(() => {
    const currentPath = matches[matches.length - 1]?.pathname ?? null
    const currentRoute = routes.find(v => v.path === currentPath)
    if (currentRoute) {
      return {
        defaultSelectedKeys: [currentRoute.key],
        defaultOpenKeys: getKeyPath(currentRoute.key).filter(key => key !== currentRoute.key),
      }
    }
    return { defaultSelectedKeys: [], defaultOpenKeys: [] }
  }, [matches])

  function onClick(info: MenuInfo) {
    const route = routes.find(v => v.key === info.key)
    if (route) void navigate(route.path)
  }

  return <Menu
    mode="inline"
    items={menuItems}
    defaultSelectedKeys={defaultSelectedKeys}
    defaultOpenKeys={defaultOpenKeys}
    onClick={onClick}
  />
}
