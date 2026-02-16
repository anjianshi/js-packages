import { AppHeader } from '@/components/AppHeader'
import WebsiteImage from '@/assets/website.png'

export function Page2() {
  return (
    <>
      <AppHeader />
      <div css={s.content}>
        <img src={WebsiteImage} />
        <div className="title">Demo App - Page 2</div>
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
