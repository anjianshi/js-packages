/**
 * 在事务中执行操作（回调函数）。
 * 与 prisma.$transaction 有几点不同：
 * 1. 回调必须返回 Result 值
 * 2. 回调返回 Failed 值或抛出异常都会触发回滚。
 *    如果是返回 Failed，会作为此方法的返回值；如果是抛出异常，则异常会继续向上传递，直到被捕获或触发请求失败。
 * 3. 如果已经处于事务中，会沿用上层事务，且回调返回 Failed 或抛出异常会触发上层事务的回滚。
 *
 * const result: Result = await db.$withTransaction(
 *   async (dbInTransaction) => {
 *     // do something
 *     return success()
 *   }
 * )
 */
import { Prisma } from '@prisma/client/extension.js'
import { type ITXClientDenyList } from '@prisma/client/runtime/client.js'
import type { Result, Failed } from '../../../index.js'

export const withTransaction = Prisma.defineExtension({
  name: 'withTransaction',
  client: {
    $withTransaction,
  },
})

// ----------------------------------

export type GetPrismaClientInTransaction<PrismaClient> = Omit<PrismaClient, ITXClientDenyList>
export type WithTransactionMethod = typeof $withTransaction

export type TransactionIsolationLevel =
  | 'ReadUncommitted'
  | 'ReadCommitted'
  | 'RepeatableRead'
  | 'Serializable'
export interface TransactionOptions {
  isolationLevel?: TransactionIsolationLevel
}

type OpenTransaction<R = unknown> = (
  cb: (dbInTransaction: unknown) => Promise<R>,
  options?: TransactionOptions,
) => Promise<R>

class FailedInTransaction<CodeT = unknown, DataT = unknown> extends Error {
  constructor(readonly failed: Failed<CodeT, DataT>) {
    super(failed.message)
  }
}

// 注意：此函数的返回值为 `R | Failed<unknown, any>`，例如实际可能为 `Result<xxx, xxx> | Failed<unknown, any>`，
// 这是有意为之的，`Failed<unknown, any>` 并不多余。
// 因为有时 callback() 只会返回 success 结果，此时 R=Success<xxx>，
// 但是 $withTransaction 整体的返回值仍有可能有 Failed<unknown, any>，所以不能用 R 作为整体返回值。
async function $withTransaction<That extends object, R extends Result>(
  this: That,
  callback: (dbInTransaction: GetPrismaClientInTransaction<That>) => Promise<R>,
  options?: TransactionOptions,
) {
  const executeCallback = async (dbInTransaction: unknown) => {
    const result = await callback(dbInTransaction as GetPrismaClientInTransaction<That>)
    if (result.success) return result
    else throw new FailedInTransaction(result)
  }

  if ('$transaction' in this && this.$transaction) {
    // 如果当前不在事务中，开启新事务并执行回调
    try {
      return await (this.$transaction as OpenTransaction<R>)(
        async dbInTransaction => executeCallback(dbInTransaction),
        options,
      )
    } catch (e) {
      if (e instanceof FailedInTransaction) return e.failed
      throw e
    }
  } else {
    // 已经在事务中，直接执行回调（如果有异常，上层开启事务的代码会捕获）
    return executeCallback(this)
  }
}
