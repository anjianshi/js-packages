import {
  getPrismaLoggingOptions,
  adaptPrismaLogging,
  exists,
  findAndCount,
  softDelete,
  withTransaction,
  getTransactionContextedPrismaClient as rawGetTransactionContextedPrismaClient,
  type GetPrismaClientInTransaction,
} from '@anjianshi/utils/env-service/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import config from '@/config.js'
import { rootLogger } from '@/logger.js'
import { PrismaClient } from '@/prisma/client.js'

/**
 * 导出相关类型和工具函数
 */
export * from '@/prisma/client.js'
export type AppPrismaClient = typeof prisma
export type PrismaClientInTransaction = GetPrismaClientInTransaction<AppPrismaClient>

const logger = rootLogger.getChild('prisma')

/**
 * 初始化基础 PrismaClient 实例
 */
if (config.DEBUG) {
  adaptPrismaDebugLogging(logger)
}

const adapter = new PrismaPg({ connectionString: config.DB_URL })
export const barePrisma = new PrismaClient({
  adapter,
  ...getPrismaLoggingOptions(config.DEBUG ? 'debug' : 'info'),
})

adaptPrismaLogging(barePrisma, rootLogger.getChild('prisma'))

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
