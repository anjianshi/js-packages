/**
 * 为使用者提供方便的工具函数
 */

/**
 * 限定配置生效的路径
 * pathPrefixs 会转化为各配置对象的 files 属性；
 * 如果配置中已经有 files 属性，其中以 ** 通配符开头的会添加上各 pathPrefixs 前缀，其他的保持原样
 * @param pathPrefixs: string | string[]
 */
exports.limitFiles = function limitFiles(pathPrefixs, configs) {
  if (!Array.isArray(pathPrefixs)) pathPrefixs = [pathPrefixs]
  pathPrefixs = pathPrefixs.map(pathPrefix =>
    !pathPrefix.endsWith('/') ? pathPrefix + '/' : pathPrefix
  )

  if (!Array.isArray(configs)) configs = [configs]
  return configs.map(config => {
    const files = []
    for (const filePattern of config.files || [
      '**/*.{js,cjs,mjs,jsx,cjsx,mjsx,ts,cts,mts,tsx,ctsx,mtsx}',
    ]) {
      if (!filePattern.startsWith('**/')) files.push(filePattern)
      else files.push(...pathPrefixs.map(pathPrefix => pathPrefix + filePattern))
    }
    return { ...config, files }
  })
}
