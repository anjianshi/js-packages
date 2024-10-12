/**
 * 对接 Prisma 的日志记录
 *
 * 注意：Prisma 的 debugging 日志是直接输出到 console 的，没有提供处理渠道，所以无法记录进日志文件。
 * 理论上可以重写 console.log/debug... 等方法来实现捕获，但这牵扯面太广，暂不这样做。
 */
import nodeUtil from 'node:util'
import chalk from 'chalk'
import type { getPrismaClient, PrismaClientOptions } from '@prisma/client/runtime/library.js'
import { type Logger } from '../../logging/index.js'

type PrismalClient = ReturnType<typeof getPrismaClient> extends new () => infer T ? T : never

export function getPrismaLoggingOptions(debug: boolean) {
  return {
    errorFormat: 'pretty',
    log: [
      ...(debug ? [{ emit: 'event', level: 'query' } as const] : []),
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'error' },
    ],
  } satisfies PrismaClientOptions
}

export function adaptPrismaLogging<T extends Pick<PrismalClient, '$on'>>(
  prisma: T,
  baseLogger: Logger,
) {
  // 记录 Prisma 相关日志
  const queryLogger = baseLogger.getChild('query')
  prisma.$on('query', e => {
    queryLogger.debug(e.query, chalk.green(nodeUtil.format(e.params) + ` +${e.duration}ms`))
  })
  prisma.$on('info', e => baseLogger.info(e.message))
  prisma.$on('warn', e => baseLogger.warn(e.message))
  prisma.$on('error', e => baseLogger.error(e.message))
}
