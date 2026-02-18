/**
 * 对接 Prisma 的日志记录
 *
 * 使用前提：
 * - 依赖 chalk 库
 *
 * Prisma 输出的日志分两部分：
 * 1. 日常运行日志，可通过 PrismaClient 的 log 选项控制。
 * 2. 调试日志，不由 log 选项控制，通过 @prisma/debug 包输出（与 debug 包类似）。
 *
 * [@prisma/debug 包的存在形式]
 * prisma 直接把此包打进了其代码里，不通过依赖的方式引入，无法通过引用相同的依赖来对其自定义。
 *
 * [调试日志的开关]
 * - @prisma/debug 包会读取 DEBUG 环境变量即 `process.env.DEBUG` 的值写入到 `globalThis.DEBUG` 中，作为全局的开关配置。
 *   此配置也可调用 enable() / disable() 方法来修改，不过因为我们引用不到这个模块，所以没法调用。
 * - 每个 prisma 模块还会生成一个 debug 子实例，它会根据当前的全局配置来决定自身是否开启，但生成后就不再跟随全局配置的变化而修改。
 * - 最终输出日志时，只要全局配置和子实例中有任意一个是开启的，就会输出日志。
 *   因为这一特性，不建议在涉及 Prisma 的项目里事先指定 DEBUG 环境变量。
 *   最好引入完 Prisma 代码后，再在代码里修改 process.env.DEBUG，以避免调试日志被意外开启。
 *
 * [调试日志的输出方式]
 * 在 @prisma/debug 代码里，它所有输出行为都是统一调用 log() 方法来完成。
 * 而这个方法底层调用的是 console.warn() 和 console.log()。
 * 我们引用不到 prisma 使用的 @prisma/debug 库，无法修改器 log() 方法，但可以修改全局的 console.warn() 来实现自定义。
 *
 * [相关代码]
 * https://github.com/prisma/prisma/ => `packages/debug/src/index.ts`
 */
import nodeUtil from 'node:util'
import type { getPrismaClient, PrismaClientOptions } from '@prisma/client/runtime/client.js'
import chalk from 'chalk'
import { type Logger } from '../../logging/index.js'

type PrismalClient = InstanceType<ReturnType<typeof getPrismaClient>>

/**
 * 生成 Prisma 日志配置项
 *
 * * 使用方法：
 * 1. 初始化 PrismaClient 时传入 getPrismaLoggingOptions() 的返回值，来开启日志：
 *    new PrismaClient({ xxx, ...getPrismaLoggingOptions('xxx') })
 * 2. client 初始化完成后，传给 adaptPrismaLogging() 完整与 logger 的对接。
 */
export function getPrismaLoggingOptions(level: 'debug' | 'info' | 'warn' | 'error') {
  return {
    errorFormat: 'pretty',
    log: [
      ...(level === 'debug' ? [{ emit: 'event', level: 'query' } as const] : []),
      ...(['debug', 'info'].includes(level) ? [{ emit: 'event', level: 'info' } as const] : []),
      ...(['debug', 'info', 'warn'].includes(level)
        ? [{ emit: 'event', level: 'warn' } as const]
        : []),
      { emit: 'event', level: 'error' },
    ],
  } satisfies Omit<PrismaClientOptions, 'accelerateUrl'>
}

/** 把 Prisma 日常日志重定向到 logger 中 */
export function adaptPrismaLogging(prisma: Pick<PrismalClient, '$on'>, logger: Logger) {
  const queryLogger = logger.getChild('query')
  prisma.$on('query', e => {
    queryLogger.debug(e.query, chalk.green(nodeUtil.format(e.params) + ` +${e.duration}ms`))
  })
  prisma.$on('info', e => logger.info(e.message))
  prisma.$on('warn', e => logger.warn(e.message))
  prisma.$on('error', e => logger.error(e.message))
}

/**
 * 开启调试日志，并改为通过 logger 记录日志内容
 *
 * 注意：
 * 因为 Prisma 在代码被引入时就会开始输出日志，若要记录下最完整的日志内容，应在初始化 Prisma Client 前调用此函数
 */
export function adaptPrismaDebugLogging(logger: Logger) {
  ;(globalThis as unknown as { DEBUG?: string }).DEBUG = '*'

  const loggers = new Map<string, Logger>()

  function fixedConsoleWarn(...args: unknown[]) {
    const [initialArg, ...restArgs] = args
    if (typeof initialArg === 'string') {
      const pattern = /(?<=^(?:\x1b\[\d+m){2})(prisma(?::[\w-]+)+)\x1b\[22m\x1b\[39m ([\s\S]*)/
      const match = pattern.exec(initialArg)
      if (match) {
        const namespace = match[1]!
        const format = match[2] ?? ''
        if (!loggers.has(namespace)) {
          loggers.set(
            namespace,
            logger.getChild(namespace.replace(/^prisma:/, '').replaceAll(':', '/')),
          )
        }
        const childLogger = loggers.get(namespace)!

        if (format) childLogger.debug(nodeUtil.format(format, ...restArgs))
        else childLogger.debug(...restArgs)
        return
      }
    }
    originalConsoleWarn(...args)
  }
  console.warn = fixedConsoleWarn
}

const originalConsoleWarn = console.warn.bind(console)
