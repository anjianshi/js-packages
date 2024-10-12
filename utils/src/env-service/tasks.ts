import { sleep } from '../lang/async.js'
import { type Logger, logger as rootLogger } from '../logging/index.js'

/** 返回 false 可结束任务 */
export type TaskExecutor<Context> = (
  context: Context,
  logger: Logger,
) => Promise<void> | Promise<undefined | false>

/**
 * 执行定期任务
 */
export abstract class TaskManager<Context> {
  constructor(protected baseLogger: Logger = rootLogger.getChild('task')) {}

  abstract getContext(taskName: string): Context

  async run(name: string, interval: number, executor: TaskExecutor<Context>) {
    await sleep(1000)

    const logger = this.baseLogger.getChild(name)
    let nextId = 1
    while (true) {
      const id = nextId++
      if (id >= Number.MAX_SAFE_INTEGER) nextId = 1

      const start = Date.now()
      logger.info(`#${id} 任务开始`)
      try {
        const context = this.getContext(name)
        const result = await executor(context, logger)
        const cost = (Date.now() - start) / 1000
        logger.info(`#${id} 任务完成，耗时 ${cost}s`)
        if (result === false) {
          logger.info('任务结束')
          break
        }
      } catch (err) {
        logger.error(`#${id} 任务失败`, err)
      }

      await sleep(interval)
    }
  }
}
