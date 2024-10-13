import { css } from '@emotion/react'
import { config } from '@/lib/config'

export function AppHeader() {
  return <div css={style}>开发模式：{config.inDev ? '是' : '否'}</div>
}

const style = css`
  background-color: lightblue;
  padding: 20px;
  text-align: center;
`
