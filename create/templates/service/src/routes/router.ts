import { Router } from 'starlight-server'
import {
  initializeAppControllers,
  controllerClasses,
  type Controllers,
} from '@/controllers/index.js'
import { getTransactionContextedPrismaClient, type AppPrismaClient } from '@/database.js'
import { rootLogger } from '@/logger.js'
export const logger = rootLogger.getChild('API')

/**
 * -----------------------------
 * 初始化、自定义 router
 * -----------------------------
 */

declare module 'starlight-server' {
  interface Context {
    db: AppPrismaClient
    controllers: Controllers
  }
}

export const router = new Router()
router.setCors(true)
router.setExecutor(async (basicContext, route) => {
  // 初始化业务对象
  // 此为和 controllers 里共用的 contexted prisma client。
  // 应始终使用它而不是全局的 PrismaClient 以保证在正确的事务内执行操作。
  const db = getTransactionContextedPrismaClient()
  const controllers = initializeAppControllers(controllerClasses, db)

  // 初始化 route context 并调用 route handler
  await route.handler({ ...basicContext, db, controllers })
})
