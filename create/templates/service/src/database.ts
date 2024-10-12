import nodeUtil from 'node:util'
import { PrismaClient, type Prisma } from '@prisma/client'
import chalk from 'chalk'
import {
  exists,
  findAndCount,
  softDelete,
  withTransaction,
  getTransactionContextedPrismaClient as rawGetTransactionContextedPrismaClient,
  type GetPrismaClientInTransaction,
} from '@anjianshi/utils/env-service/prisma/index.js'
import config from '@/config.js'
import { rootLogger } from '@/logger.js'

/**
 * 导出相关类型和工具函数
 */
export * from '@prisma/client'
export type AppPrismaClient = typeof prisma
export type PrismaClientInTransaction = GetPrismaClientInTransaction<AppPrismaClient>

/**
 * 日志配置
 */
const loggingOptions = {
  errorFormat: 'pretty',
  log: [
    ...(config.DEBUG ? [{ emit: 'event', level: 'query' } as const] : []),
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
    { emit: 'event', level: 'error' },
  ],
} satisfies Prisma.PrismaClientOptions
function initPrismaLogging<T extends PrismaClient<typeof loggingOptions>>(db: T) {
  // 记录 Prisma 相关日志
  const logger = rootLogger.getChild('db')
  const queryLogger = logger.getChild('query')
  db.$on('query', e => {
    queryLogger.debug(e.query, chalk.green(nodeUtil.format(e.params) + ` +${e.duration}ms`))
  })
  db.$on('info', e => logger.info(e.message))
  db.$on('warn', e => logger.warn(e.message))
  db.$on('error', e => logger.error(e.message))
}

/**
 * 初始化基础 PrismaClient 实例
 */
process.env.DB_URL = config.DB_URL // 配置 Prisma 连接数据库所需的环境变量
export const barePrisma = new PrismaClient({ ...loggingOptions })
initPrismaLogging(barePrisma)

/**
 * 应用扩展
 */
export const prisma = barePrisma
  .$extends(softDelete)
  .$extends(withTransaction)
  .$extends(exists)
  .$extends(findAndCount)

export function getTransactionContextedPrismaClient() {
  return rawGetTransactionContextedPrismaClient(prisma)
}
