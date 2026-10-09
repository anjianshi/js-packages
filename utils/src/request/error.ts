/**
 * 定义请求失败类型。
 *
 * 有两类失败情形不在处理范围内：
 * 1. client 或子类自身代码报错，例如 formatOptions() 方法意外报错
 * 2. 请求本身成功，但相应内容表达了业务上的失败，例如登录接口返回密码错误。
 * 如有需要，可继承子类来处理这些失败情形。
 */
import { type Failure } from '../lang/result.js'
import { type FormattedOptions } from './options.js'

export type RequestFailure =
  | RequestSendFailed
  | RequestAborted
  | RequestTimeout
  | UnexpectedHttpStatus
  | ResponseBodyParseFailed
  | ResponseDataFormattingFailed

export interface RequestFailureInfo {
  options: FormattedOptions
}

/** 请求发起失败（如网络异常） */
export type RequestSendFailed = Failure<'RequestSendFailed', RequestSendFailedInfo>
export interface RequestSendFailedInfo extends RequestFailureInfo {
  /** 原始错误对象 */
  originalError: unknown
}

/** 手动取消 */
export type RequestAborted = Failure<'RequestAborted', RequestAbortedInfo>
export interface RequestAbortedInfo extends RequestFailureInfo {
  /** 取消原因，即调用 abortController.abort() 时传入的值，若未传值则为 null */
  reason: unknown
}

/** 请求超时 */
export type RequestTimeout = Failure<'RequestTimeout', RequestFailureInfo>

/** 失败状态码（服务端响应了代表失败的状态码，如 500） */
export type UnexpectedHttpStatus = Failure<'UnexpectedHttpStatus', UnexpectedHttpStatusInfo>
export interface UnexpectedHttpStatusInfo extends RequestFailureInfo {
  /** HTTP Status */
  status: number
  /** Response 对象 */
  response: Response
  /** 尝试着从 response body 中解析出的数据 */
  responseData: unknown
}

/** 响应体解析失败 */
export type ResponseBodyParseFailed = Failure<
  'ResponseBodyParseFailed',
  ResponseBodyParseFailedInfo
>
export interface ResponseBodyParseFailedInfo extends RequestFailureInfo {
  /** HTTP Status */
  status: number
  /** 原始错误对象 */
  originalError: unknown
  /** Response 对象 */
  response: Response
}

/** 响应体数据格式化失败 */
export type ResponseDataFormattingFailed = Failure<
  'ResponseDataFormattingFailed',
  ResponseDataFormattingFailedInfo
>
export interface ResponseDataFormattingFailedInfo extends RequestFailureInfo {
  /** 原始错误对象 */
  originalError: unknown
  /** Response 对象 */
  response: Response
  /** 未经格式化的响应数据 */
  responseData: unknown
}
