import { Breadcrumb as AntdBreadcrumb, type BreadcrumbProps } from 'antd'
import { Link } from 'react-router'

// 字符串是纯文本节点；对象是可点击节点
type Item =
  | string
  | {
      path: string
      title: string
    }

type ItemRender = Required<BreadcrumbProps>['itemRender']

export function Breadcrumb({ items }: { items: (string | Item)[] }) {
  const antdItems = useMemo(
    () =>
      items.map(item =>
        typeof item === 'string' ? { title: item } : { href: item.path, title: item.title },
      ),
    [items],
  )

  const itemRender: ItemRender = item => {
    return item.href ? (
      <Link to={item.href} css={s.link}>
        {item.title}
      </Link>
    ) : (
      <span>{item.title}</span>
    )
  }

  return <AntdBreadcrumb
    css={{ margin: '16px 16px 0' }}
    itemRender={itemRender}
    items={antdItems}
  />
}

const s = {
  link: css`
    &:hover {
      background-color: transparent;
      color: var(--ant-color-link);
    }
  `,
}
