/**
 * 定义请求失败类型。
 *
 * 有两类失败情形不在处理范围内：
 * 1. client 或子类自身代码报错，例如 formatOptions() 方法意外报错
 * 2. 请求本身成功，但相应内容表达了业务上的失败，例如登录接口返回密码错误。
 * 如有需要，可继承子类来处理这些失败情形。
 */
import { type Failed } from '../lang/result.js'
import { type FormattedOptions } from './options.js'

export type RequestFailed =
  | SendRequestFailed
  | RequestAborted
  | RequestTimedOut
  | NonSuccessStatus
  | ParseResponseBodyFailed

export interface RequestFailedInfo {
  options: FormattedOptions
}

/** 手动取消 */
export type RequestAborted = Failed<'RequestAborted', RequestAbortedInfo>
export interface RequestAbortedInfo extends RequestFailedInfo {
  /** 取消原因，即调用 abortController.abort() 时传入的值，若未传值则为 null */
  reason: unknown
}

/** 请求超时 */
export type RequestTimedOut = Failed<'RequestTimedOut', RequestFailedInfo>

/** 请求发起失败（如网络异常） */
export type SendRequestFailed = Failed<'SendRequestFailed', SendRequestFailedInfo>
export interface SendRequestFailedInfo extends RequestFailedInfo {
  /** 原始错误对象 */
  originalError: unknown
}

/** 失败状态码（服务端响应了代表失败的状态码，如 500） */
export type NonSuccessStatus = Failed<'NonSuccessStatus', NonSuccessStatusInfo>
export interface NonSuccessStatusInfo extends RequestFailedInfo {
  /** HTTP Status */
  status: number
  /** Response 对象 */
  response: Response
  /** 尝试着从 response body 中解析出的数据 */
  responseData: unknown
}

/** 响应体解析失败 */
export type ParseResponseBodyFailed = Failed<'ParseResponseBodyFailed', ParseResponseBodyFailedInfo>
export interface ParseResponseBodyFailedInfo extends RequestFailedInfo {
  /** HTTP Status */
  status: number
  /** 原始错误对象 */
  originalError: unknown
  /** Response 对象 */
  response: Response
}
