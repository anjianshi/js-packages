// ----------------------------
// 类型定义
// ----------------------------

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
 * 1. 它的 Failure 类型可以携带失败信息。
 * 2. 无需 try catch，只需简单的 result.success 判断
 */
export type Result<DataT = unknown, FailureT extends Failure = Failure> = Success<DataT> | FailureT

/**
 * 操作成功时的结果
 * data 是可选的
 */
export interface Success<T = void> {
  success: true
  data: T
}

/**
 * 操作失败时的结果
 * 可附带失败信息、失败码、甚至具体的相关数据
 */
export interface Failure<CodeT = unknown, DataT = unknown> {
  success: false
  message: string
  code: CodeT
  data: DataT
}

/**
 * 若 ResultT 是成功结果，提取出其数据类型；否则生成 never
 */
export type SuccessDataTypeOfResult<ResultT extends Result> =
  ResultT extends Success<infer DataT> ? DataT : never

/**
 * 若 ResultT 是失败结果，直接返回此结果类型，否则生成 never
 */
export type FailureTypeOfResult<ResultT extends Result> = ResultT extends Failure ? ResultT : never

// ----------------------------
// 工具函数
// ----------------------------

/** 生成 Success 数据 */
function success(): Success
function success<T>(data: T): Success<T>
function success<T = void>(data?: T) {
  return { success: true, data }
}
export { success }

/** 生成 Failure 数据 */
function failure(message: string): Failure
function failure<CodeT>(message: string, code: CodeT): Failure<CodeT>
function failure<CodeT, DataT>(message: string, code: CodeT, data: DataT): Failure<CodeT, DataT>
function failure<CodeT, DataT>(message: string, code?: CodeT, data?: DataT): Failure<CodeT, DataT> {
  return { success: false, message, code: code as CodeT, data: data as DataT }
}
export { failure }

/**
 * 若传入值为 Success，格式化其 data 并重新生成一个 Success 对象；否则原样返回失败结果。
 * 支持传入会返回 Result 的 Promise。
 */
function formatSuccess<FormattedDataT, ResultT extends Result>(
  result: ResultT,
  formatter: (value: SuccessDataTypeOfResult<ResultT>) => FormattedDataT,
): Result<FormattedDataT, FailureTypeOfResult<ResultT>>
function formatSuccess<FormattedDataT, ResultT extends Result>(
  result: Promise<ResultT>,
  formatter: (value: SuccessDataTypeOfResult<ResultT>) => FormattedDataT,
): Promise<Result<FormattedDataT, FailureTypeOfResult<ResultT>>>
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
 * 若传入值为 Failure，格式化其内容；否则原样返回。
 * 支持传入会返回 Result 的 Promise。
 */
function formatFailure<ResultT extends Result, FormattedFailureT extends Failure>(
  result: ResultT,
  formatter: (result: FailureTypeOfResult<ResultT>) => FormattedFailureT,
): Result<SuccessDataTypeOfResult<ResultT>, FormattedFailureT>
function formatFailure<ResultT extends Result, FormattedFailureT extends Failure>(
  result: Promise<ResultT>,
  formatter: (result: FailureTypeOfResult<ResultT>) => FormattedFailureT,
): Promise<Result<SuccessDataTypeOfResult<ResultT>, FormattedFailureT>>
function formatFailure<ResultT extends Result, FormattedFailureT extends Failure>(
  result: ResultT | Promise<ResultT>,
  formatter: (result: FailureTypeOfResult<ResultT>) => FormattedFailureT,
) {
  if ('then' in result) return result.then(finalResult => formatFailure(finalResult, formatter))
  return result.success ? result : formatter(result as FailureTypeOfResult<ResultT>)
}
export { formatFailure }

/**
 * 把可能抛出异常的 Promise 转换为返回 Result 的 Promise。
 * catch 捕获到的错误对象会被作为返回的 Failure 对象的 data。
 *
 * 通过此函数可避免写一长串嵌套的 try catch 语句。
 */
export async function exceptionToFailure<T>(
  promise: Promise<T>,
): Promise<Result<T, Failure<undefined>>> {
  return promise.then(
    data => success(data),
    (error: unknown) => {
      let message: string
      try {
        message = ((error as Error | undefined)?.message ?? '') || String(error)
      } catch (e) {
        message = 'Got Exception'
      }
      return failure(message, undefined, error)
    },
  )
}
