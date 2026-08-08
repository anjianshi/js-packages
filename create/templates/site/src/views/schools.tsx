import { useNavigate } from 'react-router'
import { usePageTitle } from '@anjianshi/utils/env-react'

const schools = [
  { id: 1, name: '学校-1' },
  { id: 2, name: '学校-2' },
  { id: 3, name: '学校-3' },
]

export function Schools() {
  usePageTitle('学校列表')
  const navigate = useNavigate()

  function goDetail(id: number) {
    void navigate('/schools/' + id.toString())
  }

  return <div className="page">
    <div css={s.title}>学校列表</div>
    <div css={s.list}>
      {schools.map(school => <div key={school.id} className="item">
        <div className="name">{school.name}</div>
        <a onClick={() => goDetail(school.id)}>详情</a>
      </div>)}
    </div>
  </div>
}

const s = {
  title: css`
    margin-bottom: 20px;
  `,

  list: css`
    width: 12em;
    .item {
      display: flex;
      .name {
        flex: 1;
      }
    }
  `,
}
