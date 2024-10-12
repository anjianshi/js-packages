import { tasks } from './common.js'

tasks.run('check-schools', 1000 * 60, async ({ db }, logger) => {
  const count = await db.school.count({})
  logger.info(`学校数量：${count}`)
})
