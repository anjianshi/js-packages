import { Prisma } from '@prisma/client/extension'

/**
 * 快速检查指定条件的数据是否存在
 * const exists = await prisma.xxx.exists({ id: '1' })
 */
export const exists = Prisma.defineExtension({
  name: 'exists',
  model: {
    $allModels: {
      async exists<T>(
        this: T,
        where: Prisma.Args<T, 'count'>['where'],
        withDeleted = false,
      ): Promise<boolean> {
        const context = Prisma.getExtensionContext(this)
        return !!(await (context as any).count({ where, withDeleted }))
      },
    },
  },
})
