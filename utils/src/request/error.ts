/**
 * 定义请求失败类型。
 *
 * 有两类失败情形不在处理范围内：
 * 1. client 或子类自身代码报错，例如 formatOptions() 方法意外报错
 * 2. 请求本身成功，但相应内容表达了业务上的失败，例如登录接口返回密码错误。
 * 如有需要，可继承子类来处理这些失败情形。
 */
import { type FormattedOptions } from './options.js'

export class RequestError extends Error {
  constructor(
    message: string,
    readonly options: FormattedOptions,
  ) {
    super(message)
  }
}

/** 手动取消 */
export class RequestAborted extends RequestError {
  /** 取消原因，即调用 abortController.abort() 时传入的值，若未传值则为 null */
  readonly reason: unknown
  constructor(reason: unknown, options: FormattedOptions) {
    super('Request Aborted', options)
    this.reason = reason
  }
}

/** 请求超时 */
export class RequestTimedOut extends RequestError {
  constructor(options: FormattedOptions) {
    super('Request TimedOut', options)
  }
}

/** 请求发起失败（如网络异常） */
export class SendRequestFailed extends RequestError {
  constructor(
    readonly originalError: unknown,
    options: FormattedOptions,
  ) {
    super('Send Request Failed', options)
  }
}

/** 失败状态码（服务端响应了代表失败的状态码，如 500） */
export class NonSuccessStatus extends RequestError {
  readonly status: number

  constructor(
    readonly response: Response,
    readonly responseData: unknown,
    options: FormattedOptions,
  ) {
    super('Non-Success Status', options)
    this.status = response.status
  }
}

/** 响应体解析失败 */
export class ParseResponseBodyFailed extends RequestError {
  readonly status: number

  constructor(
    readonly originalError: unknown,
    readonly response: Response,
    options: FormattedOptions,
    message?: string,
  ) {
    super(message ?? 'Parse Response Body Failed', options)
    this.status = response.status
  }
}
