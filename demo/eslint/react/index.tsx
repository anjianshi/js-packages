// [检验环境] React
// [检验内容] ESLint 基础功能、文件引用、TypeScript 的类型检查、React Hooks 等专属规则
import { useEffect, useState, useCallback } from 'react'

// ./component 应能正常引用
import { SomeComponent } from './component'

export function App() {
  const [state] = useState(0)
  const { setCustomState } = useCustomHook()
  const output = useCallback((value: number) => console.log(value), [])

  useEffect(() => {
    output(state)
    setCustomState(state)
  }, []) // 有且只有 state 应被要求加入依赖列表

  return (
    <div>
      <div>hello</div>
      <SomeComponent />
    </div>
  )
}

function useCustomHook() {
  const [customState, setCustomState] = useState(3)
  return { customState, setCustomState }
}
