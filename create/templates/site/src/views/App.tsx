import { css } from '@emotion/react'
import { AppHeader } from '@/components/AppHeader'
import WebsiteImage from '@/assets/website.png'

import '@/lib/style.css'

export function App() {
  return <>
    <AppHeader />
    <div css={s.content}>
      <img src={WebsiteImage} />
      <div className="title">Demo App</div>
    </div>
  </>
}

const s = {
  content: css`
    padding: 200px 0;
    img {
      display: block;
      margin: 0 auto 100px;
      width: 300px;
    }
    .title {
      text-align: center;
      font-size: 20px;
    }
  `,
}
