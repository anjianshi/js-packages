import { usePageTitle } from '@anjianshi/utils/env-react'

export function Students() {
  usePageTitle('学生列表')

  return <div className="page">学生列表</div>
}
