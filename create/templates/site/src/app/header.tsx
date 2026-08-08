import ImageLogo from '@/assets/logo.png'
import { DevStatus } from '@/components/DevStatus'

export function AppHeader() {
  return <div css={s.wrap}>
    <img css={s.logo} src={ImageLogo} />
    <div css={s.siteName}>演示项目</div>
    <DevStatus />
  </div>
}

const s = {
  wrap: css`
    align-items: center;
    display: flex;
    padding: 8px 24px;
  `,

  logo: css`
    height: 42px;
    width: 42px;
    margin-right: 20px;
  `,

  siteName: css`
    flex: 1;
    font-size: 16px;
    letter-spacing: 1px;
    white-space: nowrap;
  `,
}
