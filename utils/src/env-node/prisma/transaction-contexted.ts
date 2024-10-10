import { type MaySuccess } from '../../index.js'
import type {
  GetPrismaClientInTransaction,
  WithTransactionMethod,
} from './extensions/with-transaction.js'

/**
 * 返回一个可以在事务内和事务外通用的 PrismaClient 代理对象。
 * 当前在事务内时，调用它是调用事务内的 client；当前不在事务内时，调用它是调用全局 client。
 * 这样当一个事务涉及多个函数调用时，就不用把事务内 client 传递来传递去了。
 * 注意：应给每个线性流程（例如一个请求）单独生成一个此对象，不能作为全局对象使用，不然可能出现事务冲突。
 */
export function getTransactionContextedPrismaClient<
  AppPrismaClient extends {
    $transaction: (...args: any[]) => Promise<unknown>
    $withTransaction: WithTransactionMethod
  },
>(prisma: AppPrismaClient): AppPrismaClient {
  type PrismaClientInTransaction = GetPrismaClientInTransaction<AppPrismaClient>

  /** 虽然这里还是会把事务中的 client 传给 callback，但实际并不需要了，始终使用 contexted client 即可 */
  type TransactionCallback<R = unknown> = (client: PrismaClientInTransaction) => Promise<R>

  let client: AppPrismaClient | PrismaClientInTransaction = prisma

  async function callCallbackInTransaction<R = unknown>(
    callback: TransactionCallback<R>,
    clientInTransaction: PrismaClientInTransaction,
  ) {
    const prevClient = client
    const currentClient = clientInTransaction
    client = currentClient
    function restoreClient() {
      if (client !== currentClient)
        throw new Error('事务冲突，必须等一个事务结束后再开启另一个事务')
      client = prevClient
    }

    try {
      const res = await callback(client)
      restoreClient()
      return res
    } catch (e) {
      restoreClient()
      throw e
    }
  }

  async function $transaction(arg: unknown, ...restArgs: unknown[]) {
    interface GeneralClient {
      $transaction: (...args: unknown[]) => Promise<unknown>
    }
    if (typeof arg === 'function') {
      const wrappedCallback = callCallbackInTransaction.bind(null, arg as TransactionCallback)
      return (client as GeneralClient).$transaction(wrappedCallback, ...restArgs)
    } else {
      return (client as GeneralClient).$transaction(arg, ...restArgs)
    }
  }

  async function $withTransaction(callback: TransactionCallback<MaySuccess>) {
    return client.$withTransaction(async clientInTransaction =>
      callCallbackInTransaction(callback, clientInTransaction as PrismaClientInTransaction),
    )
  }

  return new Proxy(
    {},
    {
      has(_, prop) {
        return prop in client
      },
      get(_, prop) {
        if (prop === '$transaction') return $transaction
        if (prop === '$withTransaction') return $withTransaction
        return (client as Record<string | symbol, unknown>)[prop]
      },
    },
  ) as AppPrismaClient
}
