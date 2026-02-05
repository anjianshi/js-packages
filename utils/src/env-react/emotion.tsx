/**
 * 通过 React Hook 把 emotion css 转换成 className
 * （不再需要 <ClassName>）
 *
 * 使用前提：
 * 1. 只支持浏览器渲染
 * 2. 调用 getEmotionCacheProvider()，传入来自 @emotion/react 的 withEmotionCache 函数，
 *    并用得到的 EmotionCacheProvider 组件包裹 App 根元素
 *
 * 来自：
 * https://github.com/emotion-js/emotion/issues/1853#issuecomment-623349622
 */
import type { EmotionCache, withEmotionCache as withEmotionCacheT } from '@emotion/react'
import { type CSSInterpolation, serializeStyles } from '@emotion/serialize'
import { insertStyles } from '@emotion/utils'
import { createContext, useContext, useCallback } from 'react'

const CacheContext = createContext<EmotionCache | undefined>(undefined)
export const useEmotionCache = () => useContext(CacheContext)

export function getEmotionCacheProvider(withEmotionCache: typeof withEmotionCacheT) {
  return withEmotionCache(({ children }: { children: React.ReactNode }, cache: EmotionCache) => {
    return <CacheContext.Provider value={cache}>{children}</CacheContext.Provider>
  })
}

export function useEmotionClassName(): (...args: CSSInterpolation[]) => string {
  const cache = useEmotionCache()
  return useCallback(
    (...args) => {
      if (!cache) {
        if (process.env.NODE_ENV === 'production') {
          console.error('useEmotionClassName: emotion-cache-missing')
          return 'emotion-cache-missing'
        }
        throw new Error('No emotion cache found!')
      }

      const serialized = serializeStyles(args, cache.registered)
      insertStyles(cache, serialized, false)
      return cache.key + '-' + serialized.name
    },
    [cache],
  )
}
