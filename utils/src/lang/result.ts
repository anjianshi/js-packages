/**
 * Result：代表一种“可能失败”的操作结果，可以作为函数返回值，也可以作为接口响应值。
 * 它的灵感来自 Scala 的 Option 类型。
 *
 * 原本，在 JavaScript 里一个可能失败的操作有两种表示失败的方式：
 * 1. 返回空值，如 null、0、''
 * 2. 抛出异常
 * 返回空值的方式无法附带失败信息；而抛出异常会导致层层嵌套的 try catch 语句，且其实性能不好。
 *
 * Result 就是为了解决这两个痛点：
 * 1. 它的 Failed 类型可以携带失败信息。
 * 2. 无需 try catch，只需简单的 result.success 判断
 */

/** 类型定义 */
export interface Success<T = void> {
  success: true
  data: T
}
export interface Failed<CodeT = unknown, DataT = unknown> {
  success: false
  message: string
  code: CodeT
  data: DataT
}
export type Result<DataT = unknown, FailedT extends Failed = Failed> = Success<DataT> | FailedT

export type SuccessDataTypeOfResult<ResultT extends Result> =
  ResultT extends Success<infer DataT> ? DataT : never

export type FailedTypeOfResult<ResultT extends Result> = ResultT extends Failed ? ResultT : never

/** 生成 Success 数据 */
function success(): Success
function success<T>(data: T): Success<T>
function success<T = void>(data?: T) {
  return { success: true, data }
}
export { success }

/** 生成 Failed 数据 */
function failed(message: string): Failed
function failed<CodeT>(message: string, code: CodeT): Failed<CodeT>
function failed<CodeT, DataT>(message: string, code: CodeT, data: DataT): Failed<CodeT, DataT>
function failed<CodeT, DataT>(message: string, code?: CodeT, data?: DataT): Failed<CodeT, DataT> {
  return { success: false, message, code: code as CodeT, data: data as DataT }
}
export { failed }

/**
 * 若传入值为 Success，格式化其 data；否则原样返回错误。
 *
 */
function formatSuccess<FormattedDataT, ResultT extends Result>(
  result: ResultT,
  formatter: (value: SuccessDataTypeOfResult<ResultT>) => FormattedDataT,
): Result<FormattedDataT, FailedTypeOfResult<ResultT>>
function formatSuccess<FormattedDataT, ResultT extends Result>(
  result: Promise<ResultT>,
  formatter: (value: SuccessDataTypeOfResult<ResultT>) => FormattedDataT,
): Promise<Result<FormattedDataT, FailedTypeOfResult<ResultT>>>
function formatSuccess<FormattedDataT, ResultT extends Result>(
  result: ResultT | Promise<ResultT>,
  formatter: (value: SuccessDataTypeOfResult<ResultT>) => FormattedDataT,
) {
  if ('then' in result) return result.then(finalValue => formatSuccess(finalValue, formatter))
  return result.success
    ? success(formatter(result.data as SuccessDataTypeOfResult<ResultT>))
    : result
}
export { formatSuccess }

/**
 * 若传入值为 Failed，格式化其内容；否则原样返回。
 * 支持传入会返回 Result 的 Promise。
 */
function formatFailed<ResultT extends Result, FormattedFailedT extends Failed>(
  result: ResultT,
  formatter: (result: FailedTypeOfResult<ResultT>) => FormattedFailedT,
): Result<SuccessDataTypeOfResult<ResultT>, FormattedFailedT>
function formatFailed<ResultT extends Result, FormattedFailedT extends Failed>(
  result: Promise<ResultT>,
  formatter: (result: FailedTypeOfResult<ResultT>) => FormattedFailedT,
): Promise<Result<SuccessDataTypeOfResult<ResultT>, FormattedFailedT>>
function formatFailed<ResultT extends Result, FormattedFailedT extends Failed>(
  result: ResultT | Promise<ResultT>,
  formatter: (result: FailedTypeOfResult<ResultT>) => FormattedFailedT,
) {
  if ('then' in result) return result.then(finalResult => formatFailed(finalResult, formatter))
  return result.success ? result : formatter(result as FailedTypeOfResult<ResultT>)
}
export { formatFailed }

/**
 * 把可能抛出异常的 Promise 转换为返回 Result 的 Promise。
 * 其中返回的 Failed 对象的 data 是 catch 捕获到的错误对象。
 *
 * 通过此函数可避免写一长串嵌套的 try catch 语句。
 */
export async function exceptionToFailed<T>(
  promise: Promise<T>,
): Promise<Result<T, Failed<undefined>>> {
  return promise.then(
    data => success(data),
    (error: unknown) => {
      let message: string
      try {
        message = ((error as Error | undefined)?.message ?? '') || String(error)
      } catch (e) {
        message = 'Got Exception'
      }
      return failed(message, undefined, error)
    },
  )
}
