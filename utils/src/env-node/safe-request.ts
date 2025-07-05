import { success, failed, type MaySuccess, type Failed } from '../lang/may-success.js'

interface BaseOptions {
  url: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: string | null

  /** 若请求未成功发起，会触发此函数来生成失败信息 */
  handleRequestError?: (error: Error) => Failed<unknown>
  /** 请求成功发起，但服务端返回失败结果（如 500），会触发此函数来生成失败信息 */
  handleResponseError?: (response: Response) => Failed<unknown> | Promise<Failed<unknown>>
  /** 服务端返回内容解析失败时，会触发此函数来生成失败信息 */
  handleParseFailed?: (error: Error, response: Response) => Failed<unknown>
}

function defaultHandleRequestError(error: Error) {
  return failed('Request Error', undefined, error)
}
async function defaultHandleResponseError(response: Response) {
  return failed(`Response Error:${response.status}`, undefined, await response.text())
}
function defaultHandleParseFailed(error: Error) {
  return failed('Response Parse Failed', undefined, error)
}

/**
 * 发起请求并妥善处理返回值，可用于与外部服务对接
 */
function safeRequest<T>(
  options: BaseOptions & { responseType?: 'json' }
): Promise<MaySuccess<T, Error | string>>
function safeRequest(
  options: BaseOptions & { responseType: 'binary' }
): Promise<MaySuccess<Buffer, Error | string>>
function safeRequest(
  options: BaseOptions & { responseType: 'text' }
): Promise<MaySuccess<string, Error | string>>
async function safeRequest<T>(
  options: BaseOptions & { responseType?: 'json' | 'binary' | 'text' }
) {
  const { url, method = 'GET', headers = {}, body = null, responseType = 'json' } = options
  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
    })
    try {
      if (response.status !== 200 && (response.status !== 204 || responseType !== 'text')) {
        return await (options.handleResponseError ?? defaultHandleResponseError)(response)
      }

      let responseBody: unknown
      if (responseType === 'json') responseBody = await response.json()
      else if (responseType === 'binary') responseBody = Buffer.from(await response.arrayBuffer())
      else responseBody = await response.text()
      return success(responseBody as T)
    } catch (e) {
      return (options.handleParseFailed ?? defaultHandleParseFailed)(e as Error, response)
    }
  } catch (e) {
    return (options.handleRequestError ?? defaultHandleRequestError)(e as Error)
  }
}
export { safeRequest }
