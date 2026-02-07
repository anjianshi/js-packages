import { RequestClient } from './client.js'

/** 提供一个即取即用的 RequestClient 实例及其函数版本 */
export const client = new RequestClient()
export const request = client.asFunction()
