import { useRef, useCallback } from 'react'

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
