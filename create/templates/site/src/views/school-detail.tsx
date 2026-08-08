import { usePageTitle } from '@anjianshi/utils/env-react'
import { useParams } from 'react-router'
import { Breadcrumb } from '@/components/Breadcrumb'

export function SchoolDetail() {
  usePageTitle('学校详情')
  const params = useParams<{ id: string }>()

  return <>
    <Breadcrumb items={[{ path: '/schools', title: '学校列表' }, '学校详情']} />
    <div className="page">学校详情 - {params.id}</div>
  </>
}
