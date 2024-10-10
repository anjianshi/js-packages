/**
 * 扩展 Prisma 实现软删除
 *
 * 1. 有 deleteTime 字段的 model 支持软删除。
 * 2. 执行 delete() 和 deleteMany() 时默认是进行软删除；可指定 soft 为 false 来彻底删除；执行软删除时可指定要额外更新的 data。
 * 2. 查询时会忽略被软删除的记录；可指定 withDeleted 为 true 来包含它们。
 * 4. 可通过 restore() 和 restoreMany() 恢复软删除的记录。
 *
 * 扩展实现方式参考：
 * https://www.prisma.io/docs/orm/prisma-client/client-extensions/type-utilities#add-a-custom-property-to-a-method
 * https://www.npmjs.com/package/@prisma/extension-accelerate?activeTab=code  =>  @prisma/extension-accelerate/dist/esm/extension.js
 *
 * 此扩展修改了 Prisma 的原生方法。
 * 为保证其他扩展也应用到修改过的这些方法，此扩展应尽可能放在最前面。
 */
import { Prisma } from '@prisma/client/extension'
import type { Operation } from '@prisma/client/runtime/library.js'
import { type OptionalFields } from '../../../index.js'

type ExampleModel = any

type DeleteArgs<T> = Prisma.Args<T, 'delete'> & {
  soft?: boolean
  data?: Prisma.Args<T, 'update'>['data'] // 软删除时支持额外更新其他字段
}
type DeleteReturn<T, A> = Promise<Prisma.Result<T, A, 'delete'>>

type DeleteManyArgs<T> = Prisma.Args<T, 'deleteMany'> & {
  soft?: boolean
  data?: Prisma.Args<T, 'updateMany'>['data']
}
type DeleteManyReturn<T, A> = Promise<Prisma.Result<T, A, 'deleteMany'>>

type RestoreArgs<T> = OptionalFields<Prisma.Args<T, 'update'>, 'data'>
type RestoreManyArgs<T> = OptionalFields<Prisma.Args<T, 'updateMany'>, 'data'>

interface QueryExtraArgs {
  withDeleted?: boolean
}
export type { QueryExtraArgs as SoftDeleteQueryArgs }
type QueryInputArgs<T, A, K extends Operation> = Prisma.Exact<A, Prisma.Args<T, K> & QueryExtraArgs>

function getModel<T>(that: T) {
  const context = Prisma.getExtensionContext(that as ExampleModel)

  // 1. 此扩展修改了 Prisma 原生的方法，所以要通过 context.$parent[context.$name] 获取上一层的 model，不然会自己调用自己导致死循环。
  // 2. 如果此扩展后面还应用了其他扩展，那么仅仅一层 $parent 取得的 model 还是这个扩展修改过的版本而不是原生的。
  //    此时需要递归向上，直到取得未经此扩展修改过的 model。不然此扩展的业务逻辑会被重复执行，
  //    而因为第一次执行时已经把定制参数消解掉了，第二次执行时会误以为没有传入定制参数，最终导致定制参数失效。
  let model = context
  do {
    model = (model as unknown as { $parent: Record<string, ExampleModel> }).$parent[context.$name!]!
  } while ('withSoftDeleteExtension' in model)

  const supportSoftDelete = 'deleteTime' in model.fields
  return { model, supportSoftDelete }
}

function query<T, A, K extends Operation>(
  that: T,
  inputArgs: Prisma.Exact<A, Prisma.Args<T, K>>,
  method: K,
) {
  const { model, supportSoftDelete } = getModel(that)
  const { withDeleted = false, ...args } = inputArgs as Prisma.Args<ExampleModel, 'findFirst'> &
    QueryExtraArgs

  return (model as any)[method]({
    ...args,
    where: !supportSoftDelete || withDeleted ? args.where : { ...args.where, deleteTime: null },
  }) as Promise<Prisma.Result<T, A, K>>
}

export const softDelete = Prisma.defineExtension({
  name: 'softDeleted',
  model: {
    $allModels: {
      withSoftDeleteExtension: true,

      // -----------------------------
      // 操作
      // -----------------------------

      delete<T, A>(this: T, rawArgs: Prisma.Exact<A, DeleteArgs<T>>) {
        const { model, supportSoftDelete } = getModel(this)
        const { soft = true, data, ...args } = rawArgs as DeleteArgs<ExampleModel>
        if (supportSoftDelete && soft) {
          return model.update({
            ...args, // .delete() 的参数 .update() 也都支持
            data: { ...(data ?? {}), deleteTime: new Date() },
          }) as unknown as DeleteReturn<T, A> // .update() 的返回值和 .delete() 一样
        } else {
          return model.delete(args) as unknown as DeleteReturn<T, A>
        }
      },

      deleteMany<T, A>(this: T, rawArgs: Prisma.Exact<A, DeleteManyArgs<T>>) {
        const { model, supportSoftDelete } = getModel(this)
        const { soft = true, data, ...args } = rawArgs as DeleteManyArgs<ExampleModel>
        if (supportSoftDelete && soft) {
          return model.updateMany({
            ...args, // .deleteMany() 的参数 .updateMany() 也都支持
            data: { ...(data ?? {}), deleteTime: new Date() },
          }) as DeleteManyReturn<T, A> // .updateMany() 的返回值和 .deleteMany() 一样
        } else {
          return model.deleteMany(args) as DeleteManyReturn<T, A>
        }
      },

      restore<T, A>(this: T, rawArgs: Prisma.Exact<A, RestoreArgs<T>>) {
        const { data, ...args } = rawArgs as RestoreArgs<ExampleModel>
        const { model, supportSoftDelete } = getModel(this)
        if (!supportSoftDelete) throw new Error('当前模型不支持软删除，不能执行恢复')
        return model.update({
          ...(args as Prisma.Args<ExampleModel, 'update'>),
          data: { ...(data ?? {}), deleteTime: null },
        }) as unknown as Promise<Prisma.Result<T, A, 'update'>>
      },

      restoreMany<T, A>(this: T, rawArgs: Prisma.Exact<A, RestoreManyArgs<T>>) {
        const { data, ...args } = rawArgs as RestoreArgs<ExampleModel>
        const { model, supportSoftDelete } = getModel(this)
        if (!supportSoftDelete) throw new Error('当前模型不支持软删除，不能执行恢复')
        return model.updateMany({
          ...(args as Prisma.Args<ExampleModel, 'updateMany'>),
          data: { ...(data ?? {}), deleteTime: new Date() },
        }) as Promise<Prisma.Result<T, A, 'updateMany'>>
      },

      // -----------------------------
      // 查询
      // -----------------------------

      aggregate<T, A>(this: T, inputArgs: QueryInputArgs<T, A, 'aggregate'>) {
        return query(this, inputArgs, 'aggregate')
      },
      count<T, A>(this: T, inputArgs: QueryInputArgs<T, A, 'count'>) {
        return query(this, inputArgs, 'count')
      },
      findFirst<T, A>(this: T, inputArgs: QueryInputArgs<T, A, 'findFirst'>) {
        return query(this, inputArgs, 'findFirst')
      },
      findFirstOrThrow<T, A>(this: T, inputArgs: QueryInputArgs<T, A, 'findFirstOrThrow'>) {
        return query(this, inputArgs, 'findFirstOrThrow')
      },
      findMany<T, A>(this: T, inputArgs: QueryInputArgs<T, A, 'findMany'>) {
        return query(this, inputArgs, 'findMany')
      },
      findUnique<T, A>(this: T, inputArgs: QueryInputArgs<T, A, 'findUnique'>) {
        return query(this, inputArgs, 'findUnique')
      },
      findUniqueOrThrow<T, A>(this: T, inputArgs: QueryInputArgs<T, A, 'findUniqueOrThrow'>) {
        return query(this, inputArgs, 'findUniqueOrThrow')
      },
      groupBy<T, A>(this: T, inputArgs: QueryInputArgs<T, A, 'groupBy'>) {
        return query(this, inputArgs, 'groupBy')
      },
    },
  },
})
