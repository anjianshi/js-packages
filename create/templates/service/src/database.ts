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
import { PrismaClient } from '@prisma/client'
import config from '@/config.js'
import { rootLogger } from '@/logger.js'

/**
 * 导出相关类型和工具函数
 */
export * from '@prisma/client'
export type AppPrismaClient = typeof prisma
export type PrismaClientInTransaction = GetPrismaClientInTransaction<AppPrismaClient>

/**
 * 初始化基础 PrismaClient 实例
 */
process.env.DB_URL = config.DB_URL // 配置 Prisma 连接数据库所需的环境变量
export const barePrisma = new PrismaClient({ ...getPrismaLoggingOptions(config.DEBUG) })
adaptPrismaLogging(barePrisma, rootLogger.getChild('db'))

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
