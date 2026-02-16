import { getLogger, type Logger } from './index.js'

interface Debug {
  enable: (namespaces: string) => void
  log: (...args: any[]) => any // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * 适配 debug package
 */
export function adaptDebugLib(debugLib: Debug, enable = '', logger?: Logger) {
  // 不在 localStorage 里记录 debugLib enable 状态，
  // 以解决 web worker 里读不到 localStorage 而无法启用 debugLib 日志的问题
  const emulate = {
    storage: {
      data: {} as Record<string, string>,
      getItem(name: string) {
        return emulate.storage.data[name]
      },
      setItem(name: string, value: string) {
        emulate.storage.data[name] = value
      },
      removeItem(name: string) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete emulate.storage.data[name]
      },
    },
    save(namespaces: string) {
      if (namespaces) emulate.storage.setItem('debug', namespaces)
      else emulate.storage.removeItem('debug')
    },
    load() {
      return emulate.storage.getItem('debug')
    },
  }
  Object.assign(debugLib, emulate)

  // 将 debugLib 日志转发给 logger
  logger ??= getLogger('3rd-library')
  debugLib.log = logger.debug.bind(logger)

  if (enable) {
    // 有些库（例如 prisma）重新实现了自己的 debug 库，且模仿 debug 也读取 DEBUG 环境变量。
    // 这里除了设置 debug 库，顺便也适配这些遵循 debug 库模式的自定义库。
    process.env.DEBUG = enable

    debugLib.enable(enable)
  }
}
