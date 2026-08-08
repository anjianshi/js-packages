import { Tag } from 'antd'
import { config } from '@/lib/config'

export function DevStatus() {
  return config.inDev ? (
    <Tag color="green" variant="solid">
      开发模式
    </Tag>
  ) : (
    <Tag variant="solid" color="#999">
      非开发模式
    </Tag>
  )
}
