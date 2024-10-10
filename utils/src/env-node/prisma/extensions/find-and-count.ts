import { Prisma } from '@prisma/client'
import { type SoftDeleteQueryArgs } from './soft-delete.js'

export const findAndCount = Prisma.defineExtension({
  name: 'findAndCount',
  model: {
    $allModels: {
      findAndCount<T, A>(
        this: T,
        rawArgs: Prisma.Exact<A, Prisma.Args<T, 'findMany'> & SoftDeleteQueryArgs>,
      ) {
        const context = Prisma.getExtensionContext(this)
        const args = rawArgs as Prisma.Args<T, 'findMany'> & SoftDeleteQueryArgs
        return Promise.all([
          (context as any).findMany(args) as Promise<Prisma.Result<T, A, 'findMany'>>,
          (context as any).count({
            where: args.where,
            withDeleted: args.withDeleted,
          }) as Promise<Prisma.Result<T, A, 'count'>>,
        ])
      },
    },
  },
})
