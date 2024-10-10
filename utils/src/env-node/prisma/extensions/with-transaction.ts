/**
 * 在事务中执行回调。与 $transaction 有几点不同：
 * 1. 回调必须返回 MaySuccess 值
 * 2. 回调返回 Failed 值或抛出异常都会触发回滚。
 *    如果是返回 Failed，会作为此方法的返回值；如果是抛出异常，则异常会继续向上传递，直到被捕获或触发请求失败。
 * 3. 如果已经处于事务中，会沿用上层事务，且回调返回 Failed 或抛出异常会触发上层事务的回滚。
 *
 * const result: MaySuccess = await db.$withTransaction(
 *   async (dbInTransaction) => {
 *     // do something
 *     return success()
 *   }
 * )
 */
import { Prisma } from '@prisma/client'
import { type ITXClientDenyList } from '@prisma/client/runtime/library.js'
import type { MaySuccess, Failed } from '../../../index.js'

export const withTransaction = Prisma.defineExtension({
  name: 'withTransaction',
  client: {
    $withTransaction,
  },
})

// ----------------------------------

export type GetPrismaClientInTransaction<PrismaClient> = Omit<PrismaClient, ITXClientDenyList>
export type WithTransactionMethod = typeof $withTransaction

type OpenTransaction<R = unknown> = (cb: (dbInTransaction: unknown) => Promise<R>) => Promise<R>

class FailedInTransaction<T = void> extends Error {
  constructor(readonly failed: Failed<T>) {
    super(failed.message)
  }
}

async function $withTransaction<That extends object, R extends MaySuccess<unknown, unknown>>(
  this: That,
  callback: (dbInTransaction: GetPrismaClientInTransaction<That>) => Promise<R>,
): Promise<R> {
  const executeCallback = async (dbInTransaction: unknown) => {
    const result = await callback(dbInTransaction as GetPrismaClientInTransaction<That>)
    if (result.success) return result
    else throw new FailedInTransaction(result)
  }

  if ('$transaction' in this && this.$transaction) {
    // 如果当前不在事务中，开启新事务并执行回调
    try {
      return await (this.$transaction as OpenTransaction<R>)(async dbInTransaction =>
        executeCallback(dbInTransaction),
      )
    } catch (e) {
      if (e instanceof FailedInTransaction) return e.failed as R
      throw e
    }
  } else {
    // 已经在事务中，直接执行回调（如果有异常，上层开启事务的代码会捕获）
    return executeCallback(this)
  }
}
