/**
 * 为使用者提供方便的工具函数
 */

/**
 * 限定配置生效的路径
 * pathPrefixs 会转化为各配置对象的 files 属性，如果配置中已经有 files，则设置成各 files 的路径前缀。
 * @param pathPrefixs: string | string[]
 */
exports.limitFiles = function limitFiles(pathPrefixs, configs) {
  if (!Array.isArray(pathPrefixs)) pathPrefixs = [pathPrefixs]
  pathPrefixs = pathPrefixs.map(pathPrefix => pathPrefix.replace(/\/$/, ''))

  return configs.map(config => {
    const files = (config.files || ['*.{js,cjs,mjs}']).reduce((files, pattern) => {
      files.push(...pathPrefixs.map(pathPrefix => pathPrefix + '/**/' + pattern))
      return files
    }, [])
    return { ...config, files }
  })
}
