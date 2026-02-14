/**
 * 请求参数
 */
export interface Options<T = unknown> {
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

  /** 是否把响应内容作为二进制处理（结果是 blob） */
  binary?: boolean

  /** 超时时间，不指定或设为 0 代表不限 */
  timeout?: number

  /** 可通过此信号手动终止请求 */
  signal?: AbortSignal

  /** 对请求成功时得到的数据进行最终格式化 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  format?: (responseData: any) => T
}

/** 可预指定的请求参数 */
export type PredefinedOptions = Pick<Options, 'urlPrefix' | 'method' | 'headers' | 'timeout'>

/** 经过整理的请求参数（client 内部使用） */
export type FormattedOptions<T = unknown> = Required<
  Pick<Options, 'url' | 'method' | 'headers' | 'body' | 'timeout' | 'binary'>
> &
  Pick<Options<T>, 'signal' | 'format'>
