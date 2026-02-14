/**
 * 实现一个功能完善、异常处理逻辑全面的请求发起器。
 * 可通过继承子类来扩展其功能。
 */
import pick from 'lodash/pick.js'
import {
  success,
  failed,
  formatFailed,
  exceptionToFailed,
  type Result,
  type Success,
  type Failed,
} from '../lang/result.js'
import { getLogger, type Logger } from '../logging/index.js'
import { combineUrl } from '../url.js'
import { type RequestFailed } from './error.js'
import type { Options, PredefinedOptions, FormattedOptions } from './options.js'

/** 此基类不可直接使用，因其未对错误格式进行具体约定 */
export abstract class BaseRequestClient<FailedT extends Failed> {
  readonly logger: Logger
  readonly prefefinedOptions: PredefinedOptions

  constructor(options: PredefinedOptions & { loggerName?: string } = {}) {
    this.logger = getLogger(options.loggerName ?? 'request')
    this.prefefinedOptions = options
  }

  /** 生成一个快捷方式函数，调用它相当于调用 client.request() */
  asFunction() {
    return async <T>(inputUrl: string, inputOptions?: Options<T>) =>
      this.request<T>(inputUrl, inputOptions)
  }

  // -------------------------------
  // 发起请求
  // -------------------------------

  async request<T>(inputUrl: string, inputOptions?: Options<T>): Promise<Result<T, FailedT>> {
    const options = await this.formatOptions<T>({
      url: inputUrl,
      ...(inputOptions ?? {}),
    })
    const { url, method, headers, body, timeout, signal: manualSignal, format } = options

    const timeoutSignal = timeout ? AbortSignal.timeout(timeout) : undefined
    const signal =
      manualSignal || timeoutSignal
        ? AbortSignal.any([manualSignal, timeoutSignal].filter(Boolean) as AbortSignal[])
        : undefined

    // 发起请求
    let response: Response | undefined
    try {
      response = await fetch(url, { method, headers, body, signal })
    } catch (error) {
      // 失败情形“手动取消”
      if (manualSignal?.aborted && manualSignal.reason === error) {
        const reason = error instanceof DOMException && error.name === 'AbortError' ? null : error
        return this.handleError(failed('Request Aborted', 'RequestAborted', { options, reason }))
      }
      // 失败情形“请求超时”
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        return this.handleError(failed('Request Timeouted Out', 'RequestTimedOut', { options }))
      }
      // 失败情形“请求发起失败”
      return this.handleError(
        failed('Request Timeouted Out', 'RequestTimedOut', { options, originalError: error }),
      )
    }

    // 失败情形“失败状态码”
    if (!response.status.toString().startsWith('2')) {
      // 此时服务端仍可能输出一些内容，试着解析出来
      // 但因此情况下后端输出数据往往和成功时不同，因此不调用用户提供的 format() 函数来格式化
      const responseDataRes = await this.parseResponse(options, response)
      const responseData = responseDataRes.success ? responseDataRes.data : undefined
      return this.handleError(
        failed('Non-Success Status', 'NonSuccessStatus', {
          options,
          status: response.status,
          response,
          responseData,
        }),
      )
    }

    // 解析响应内容
    let result = await this.parseResponse(options, response)

    // 格式化响应数据
    if (result.success) {
      try {
        result = this.formatSuccessResult(result)
      } catch (error) {
        return this.handleError(
          failed('Format Response Data Failed', 'FormatResponseDataFailed', {
            options,
            originalError: error,
            response,
            responseData: result.data,
          }),
        )
      }
    }
    if (result.success && format) {
      try {
        const formattedData = format(result.data)
        result = success(formattedData)
      } catch (error) {
        return this.handleError(
          failed('Format Response Data By options.format Failed', 'FormatResponseDataFailed', {
            options,
            originalError: error,
            response,
            responseData: result.data,
          }),
        )
      }
    }
    return result as Result<T, FailedT>
  }

  // -------------------------------
  // 请求预处理
  // -------------------------------

  async formatOptions<T>(input: Options<T>): Promise<FormattedOptions<T>> {
    const predefined = this.prefefinedOptions
    const {
      urlPrefix = predefined.urlPrefix ?? '',
      url: rawUrl,
      query = {},
      method = predefined.method ?? 'GET',
      headers: rawHeaders = {},
      body: rawBody = null,
      data,
      timeout = predefined.timeout ?? 0,
      binary = false,
      signal,
      format,
    } = input

    const headers = {
      ...(predefined.headers ?? {}),
      ...rawHeaders,
    }

    let body: string | FormData | null = rawBody
    if (data !== undefined) {
      if (method === 'GET') {
        Object.assign(query, data)
      } else {
        body = data instanceof FormData ? data : JSON.stringify(data)
        headers['Content-Type'] = 'application/json; charset=utf-8'
      }
    }

    const url = combineUrl(urlPrefix + (rawUrl ?? ''), query)

    const options: FormattedOptions<T> = {
      method,
      url,
      headers,
      body,
      timeout,
      binary,
      signal,
      format,
    }
    Object.assign(options.headers, await this.getHeaders(options, input))
    return options
  }

  /** 请求发起前调用此方法补充 Headers 内容 */
  protected getHeaders(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: FormattedOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    inputOptions: Options,
  ): Record<string, string> | undefined | Promise<Record<string, string> | undefined> {
    return undefined
  }

  // -------------------------------
  // 请求结果、错误处理
  // -------------------------------

  /**
   * 解析响应内容
   * - 若 options.binary 为 true，返回二进制结果
   * - 若 response Content-Type 为 'text/' 开头，返回文本结果
   * - 尝试解析 JSON，若成功，返回 JSON 结果；
   * - 若 JSON 解析失败：
   *   - 若 response Content-Type 为 'application/json' 开头，返回解析失败信息
   *   - 其他情况，返回纯文本结果
   */
  protected async parseResponse(
    options: FormattedOptions,
    response: Response,
  ): Promise<Result<unknown, FailedT>> {
    const contentType = (response.headers.get('Content-Type') ?? '').toLowerCase().trim()

    if (options.binary) {
      const blobResult = await exceptionToFailed(response.blob())
      return formatFailed(blobResult, result =>
        this.handleError(
          failed('Parse Blob Body Failed', 'ParseResponseBodyFailed', {
            options,
            status: response.status,
            originalError: result.data,
            response,
          }),
        ),
      )
    }

    const textResult = await exceptionToFailed(response.text())
    if (contentType.startsWith('text/') || !textResult.success) {
      return formatFailed(textResult, result =>
        this.handleError(
          failed('Parse Text Body Failed', 'ParseResponseBodyFailed', {
            options,
            status: response.status,
            originalError: result.data,
            response,
          }),
        ),
      )
    }

    let jsonParseError: unknown
    try {
      return success(JSON.parse(textResult.data))
    } catch (error) {
      jsonParseError = error
    }
    if (contentType.startsWith('application/json')) {
      return this.handleError(
        failed('Parse JSON Body Failed', 'ParseResponseBodyFailed', {
          options,
          status: response.status,
          originalError: jsonParseError,
          response,
        }),
      )
    }
    return textResult
  }

  protected handleError(result: RequestFailed) {
    const info: Record<string, unknown> = pick(result.data.options, ['url', 'method'])
    for (const key of ['originalError', 'status', 'responseData'] as const) {
      if (key in result.data) Object.assign(info, pick(result.data, [key]))
    }
    this.logger.error(result.code, info)
    return this.makeFailedResult(result)
  }

  /** 生成符合 FailedT 约定的失败结果 */
  protected abstract makeFailedResult(result: RequestFailed): FailedT

  /**
   * 对请求成功得到的数据进行格式化。
   *
   * - 此步骤在 applyInputFormat() 之前运行，子类可在此进行一些通用的格式化工作，
   * - 输出 Success 或 Failed 结果均可，但输出的 Failed 结果不会交给 makeFailedResult() 进行格式化，需自行保证符合 FailedT 约定。
   * - 若此方法抛出异常，会生成 FormatResponseDataFailed，此错误会照常交给 makeFailedResult() 处理。
   */
  protected formatSuccessResult(result: Success<unknown>): Result<unknown, FailedT> {
    return result
  }
}

/** 默认的 RequestClient 实现。出现错误时，会把错误对象原样放入错误信息中。 */
export class RequestClient extends BaseRequestClient<RequestFailed> {
  protected makeFailedResult(result: RequestFailed) {
    return result
  }
}
