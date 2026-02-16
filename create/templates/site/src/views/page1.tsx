import { Button } from 'antd'
import { useNavigate } from 'react-router'
import { AppHeader } from '@/components/AppHeader'
import WebsiteImage from '@/assets/website.png'

export function Page1() {
  const navigate = useNavigate()

  function goPage2() {
    navigate('/page2')
  }

  return (
    <>
      <AppHeader />
      <div css={s.content}>
        <img src={WebsiteImage} />
        <div className="title">Demo App - Page 1</div>
        <div css={{ textAlign: 'center', marginTop: '20px' }}>
          <Button type="primary" onClick={goPage2}>
            Go Page 2
          </Button>
        </div>
      </div>
    </>
  )
}

const s = {
  content: css`
    padding: 200px 0;
    img {
      display: block;
      margin: 0 auto 40px;
      width: 150px;
    }
    .title {
      text-align: center;
      font-size: 20px;
    }
  `,
}
