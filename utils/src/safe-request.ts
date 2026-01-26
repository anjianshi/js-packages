import { sleep } from './lang/async.js'
import { failed, handleException, type Result } from './lang/result.js'
import { getLogger, type Logger } from './logging/index.js'
import { combineUrl } from './url.js'

export type { Options as RequestOptions, FormattedOptions as RequestFormattedOptions }

interface Options {
  urlPrefix?: string
  url?: string
  query?: Record<string, string | number | undefined>
  method?: string
  headers?: Record<string, string>
  body?: string | FormData | null

  /**
   * 向后端传递的数据。对于 GET 请求，会合并到 query 中；对于 POST 请求，会作为 POST body，代替 body 参数
   * 注意：为了支持传入 interface 类型的值，Record 只能定义成 Record<string, any>
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: FormData | Record<string, any>

  /** 超时时间，不指定或设为 0 代表不限 */
  timeout?: number
}

type FormattedOptions = Required<Pick<Options, 'url' | 'method' | 'headers' | 'body' | 'timeout'>>

type PredefinedOptions = Pick<Options, 'urlPrefix' | 'method' | 'headers' | 'timeout'>

/**
 * 建立一个请求发起器，并可预设部分选项。
 * 可以继承此类来自定义默认的错误处理逻辑。
 *
 * 请求失败时的 Failed 对象，其 code 为 HTTP status，没有 status 时为 0
 * data 为解析出的响应内容，没有或解析失败则为 undefined
 */
export class SafeRequestClient {
  readonly logger: Logger
  readonly prefefinedOptions: PredefinedOptions

  constructor(options: PredefinedOptions & { loggerName?: string } = {}) {
    this.logger = getLogger(options.loggerName ?? 'request')
    this.prefefinedOptions = options
  }

  /** 生成一个快捷方式函数，调用它相当于调用 client.request() */
  asFunction() {
    return async <T>(inputUrl: string, inputOptions?: Options) =>
      this.request<T>(inputUrl, inputOptions)
  }

  async request<T>(inputUrl: string, inputOptions?: Options): Promise<Result<T>> {
    const options = await this.formatOptions({
      url: inputUrl,
      ...(inputOptions ?? {}),
    })
    const { url, method, headers, body, timeout } = options

    try {
      // 发起请求
      const request = fetch(url, { method, headers, body })
      let response: Response | undefined
      try {
        response = await (typeof timeout === 'number'
          ? Promise.race([request, sleep(timeout)])
          : request)
      } catch (error) {
        // 处理“请求发起失败”
        return this.onRequestError(error as Error, url)
      }

      // 处理超时
      if (response === undefined) {
        return this.onTimeout(url)
      }

      // 处理“服务端返回失败状态”
      if (!response.status.toString().startsWith('2')) {
        // 此时服务端仍可能输出一些内容，试着解析出来
        const responseDataRes = await this.parseResponse<T>(options, response)
        const responseData = responseDataRes.success ? responseDataRes.data : undefined
        return await this.onResponseError(url, response, responseData)
      }

      // 解析响应内容
      return await this.parseResponse<T>(options, response)
    } catch (error) {
      this.logger.error('Unexpected error', error)
      return failed('Request handle failed.')
    }
  }

  async formatOptions(input: Options): Promise<FormattedOptions> {
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

    const options = {
      method,
      url,
      headers,
      body,
      timeout,
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

  protected async parseResponse<T>(options: FormattedOptions, response: Response) {
    let result: Result<T>
    result = await handleException(response.json())
    if (result.success) return result

    const contentType = (response.headers.get('Content-Type') ?? '').toLowerCase().trim()
    if (contentType.startsWith('text/') || contentType === '') {
      result = (await handleException(response.text())) as Result<T>
      if (result.success) return result
    }

    result = (await handleException(response.arrayBuffer())) as Result<T>
    return result
  }

  /** 若请求未成功发起，会触发此回调来生成失败信息 */
  protected onRequestError(error: Error, url: string) {
    this.logger.error('Request Failed', { url, error })
    return failed('Request Failed', 0, undefined)
  }

  /** 请求成功发起，但服务端返回失败状态（如 500），会触发此回调来生成失败信息 */
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async onResponseError(url: string, response: Response, responseData: unknown) {
    this.logger.error('Response Error Status', {
      url,
      status: response.status,
      data: responseData,
    })
    return failed(`Response Error Status - ${response.status}`, response.status, responseData)
  }

  /** 服务端返回内容解析失败时，会触发此回调来生成失败信息 */
  protected onParseFailed(error: Error, response: Response, url: string) {
    this.logger.error('Response Parse Failed', { url, response, error })
    return failed('Response Parse Failed', response.status, undefined)
  }

  /** 处理超时 */
  protected onTimeout(url: string) {
    this.logger.warn('Request Timeout', url)
    return failed('Request Timeout', 0, undefined)
  }
}

/**
 * 模块自带一个可直接调用发起请求的函数，跳过初始化实例
 */
export const safeRequest = new SafeRequestClient().asFunction()
