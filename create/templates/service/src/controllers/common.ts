import {
  type ControllersFrom,
  type AnyController,
  Controller,
  initializeControllers,
} from '@anjianshi/utils/env-service/index.js'
import { getTransactionContextedPrismaClient, type AppPrismaClient } from '@/database.js'
import { type Logger, rootLogger } from '@/logger.js'

export interface Context {
  /**
   * controller 会绑定一个由 getTransactionContextedPrismaClient() 返回的 PrismaClient，它会自动关联当前进行的事务。
   * 应始终使用它而不是全局的 PrismaClient 以保证在正确的事务内执行操作。
   */
  db: AppPrismaClient

  baseLogger: Logger
}

export class AppController<
  AllControllers extends Record<string, AnyController<Context>>,
> extends Controller<Context, AllControllers> {
  protected readonly db: AppPrismaClient
  protected readonly logger: Logger

  constructor(controllers: AllControllers, context: Context, name?: string) {
    super(controllers, context, name)
    this.db = context.db
    this.logger = context.baseLogger.getChild(this.name)
  }
}

export type { ControllersFrom }

export function initializeAppControllers<T extends Record<string, unknown>>(
  controllerClasses: T,
  db?: AppPrismaClient,
  baseLogger?: Logger,
) {
  if (!db) db = getTransactionContextedPrismaClient()
  if (!baseLogger) baseLogger = rootLogger.getChild('controller')
  return initializeControllers<Context, T>(controllerClasses, { db, baseLogger })
}
