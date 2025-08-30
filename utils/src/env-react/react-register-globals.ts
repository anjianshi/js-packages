/**
 * 把 React Hooks 注册成全局变量，就不用每次使用都手动引入了
 * Hooks 列表见：https://react.dev/reference/react/hooks
 */

import {
  useState as useStateValue,
  useReducer as useReducerValue,
  useContext as useContextValue,
  useRef as useRefValue,
  useImperativeHandle as useImperativeHandleValue,
  useEffect as useEffectValue,
  useMemo as useMemoValue,
  useCallback as useCallbackValue,
  useTransition as useTransitionValue,
  useDeferredValue as useDeferredValueValue,
  useDebugValue as useDebugValueValue,
  useId as useIdValue,
  useSyncExternalStore as useSyncExternalStoreValue,
  useActionState as useActionStateValue,
} from 'react'

declare global {
  var useState: typeof useStateValue
  var useReducer: typeof useReducerValue
  var useContext: typeof useContextValue
  var useRef: typeof useRefValue
  var useImperativeHandle: typeof useImperativeHandleValue
  var useEffect: typeof useEffectValue
  var useMemo: typeof useMemoValue
  var useCallback: typeof useCallbackValue
  var useTransition: typeof useTransitionValue
  var useDeferredValue: typeof useDeferredValueValue
  var useDebugValue: typeof useDebugValueValue
  var useId: typeof useIdValue
  var useSyncExternalStore: typeof useSyncExternalStoreValue
  var useActionState: typeof useActionStateValue
}

globalThis.useState = useStateValue
globalThis.useReducer = useReducerValue
globalThis.useContext = useContextValue
globalThis.useRef = useRefValue
globalThis.useImperativeHandle = useImperativeHandleValue
globalThis.useEffect = useEffectValue
globalThis.useMemo = useMemoValue
globalThis.useCallback = useCallbackValue
globalThis.useTransition = useTransitionValue
globalThis.useDeferredValue = useDeferredValueValue
globalThis.useDebugValue = useDebugValueValue
globalThis.useId = useIdValue
globalThis.useSyncExternalStore = useSyncExternalStoreValue
globalThis.useActionState = useActionStateValue
