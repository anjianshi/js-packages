import { prisma } from '@/utils/lib/database.js'
import { success, failed } from '@anjianshi/utils'

export async function demoDB() {
  const result = await prisma.$withTransaction(async () => {
    const students = await prisma.student.findMany({})
    return students.length ? success(students) : failed('没有学生')
  })
  console.log(result)
}
