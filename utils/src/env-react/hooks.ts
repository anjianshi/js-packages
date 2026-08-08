import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * 生成一个 state 以及与其值同步的 ref
 */
export function useStateWithRef<T>(initialValue: T | (() => T)) {
  const [state, setState] = useState(initialValue)
  const ref = useRef(state)

  const setStateWithRef: typeof setState = useCallback((value: T | ((prevState: T) => T)) => {
    setState(prevState => {
      const newValue =
        typeof value === 'function' ? (value as (prevState: T) => T)(prevState) : value
      ref.current = newValue
      return newValue
    })
  }, [])

  return [state, setStateWithRef, ref] as const
}

/**
 * 在 useEffect() 中执行异步操作。
 * 因是异步运行，对清理机制的处理有所变化。
 *
 * 原本 useEffect() 中，通过返回一个函数来设置清理条件，在异步操作中不适用。
 * 此外，同步内容是一定会在执行完只后才有可能触发清理的，但异步内容有可能在运行完之前，依赖就已经变化，触发了清理。
 *
 * 这里通过一个 context 对象来应对异步的情况。
 * context.cancelled 值代表此次运行是否已被取消（清理），异步操作执行过程中如果发现此值变为 true，则可停止执行了。
 * context.onCancelled(() => {}) 可注册一个回调，此次执行被清理时触发。多次调用仅保留最后一次的回调。
 *
 * 注意：需要配置 ESLint react-hooks/exhaustive-deps 规则以保证 deps 参与依赖检查
 * 详见 https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps
 */
export function useAsyncEffect(
  callback: (context: AsyncEffectContext) => Promise<void>,
  deps: unknown[] = [],
) {
  useEffect(() => {
    let onCancel: (() => void) | null = null
    const context = {
      cancelled: false,
      onCancel(callback: () => void) {
        onCancel = callback
      },
    }

    void callback(context)
    return () => {
      context.cancelled = true
      if (onCancel) onCancel()
    }
  }, deps) // eslint-disable-line ts-react-hooks/exhaustive-deps
}
export interface AsyncEffectContext {
  cancelled: boolean
  onCancel: (callback: () => void) => void
}

/**
 * 设置浏览器页面标题
 */
export function usePageTitle(title: string) {
  /**
   * 记录组件加载前的页面标题，组件卸载后还原此标题。
   *
   * 与后续操作分成两个 useEffect 是因为 title 参数可能在组件生命周期内多次变化，
   * 但原始标题只应在加载时记录一次，
   * 不然会把此组件上一次设置的标题记录成原始标题。
   */
  const previousTitleRef = useRef('')
  useEffect(() => {
    previousTitleRef.current = document.title
    return () => {
      document.title = previousTitleRef.current
    }
  }, [])

  useEffect(() => {
    document.title = title
  }, [title])
}
