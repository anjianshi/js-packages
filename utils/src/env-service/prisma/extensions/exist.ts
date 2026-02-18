import { Prisma } from '@prisma/client/extension.js'

/**
 * 快速检查指定条件的数据是否存在
 * const exists = await prisma.xxx.exists({ id: '1' })
 *
 * 注意：
 * 此扩展使用了 soft-delete 扩展定义的 withDeleted 选项，因此必须与 soft-delete 扩展一起使用。
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
        return !!(await (context as Model<T>).count({ where, withDeleted }))
      },
    },
  },
})

interface Model<T> {
  count(where: Prisma.Args<T, 'count'>['where'], withDeleted?: boolean): Promise<number>
}
