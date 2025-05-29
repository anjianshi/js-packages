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

/**
 * 合并多个 config 对象
 * 各 config 对象中的数组和子对象，会被递归合并到一起，而不是用后面的代替前面的。
 */
exports.mergeConfigs = function mergeConfigs(...configs) {
  return {
    ...configs.reduce((merged, config) => ({ ...merged, ...config }), {}),
    ...mergeArrayInConfigs(configs, 'files'),
    ...mergeArrayInConfigs(configs, 'ignores'),
    ...mergeArrayInConfigs(configs, 'extends'),
    ...mergeObjectInConfigs(configs, 'languageOptions'),
    ...mergeObjectInConfigs(configs, 'linterOptions'),
    ...mergeObjectInConfigs(configs, 'plugins'),
    ...mergeObjectInConfigs(configs, 'rules'),
    ...mergeObjectInConfigs(configs, 'settings'),
  }
}

/**
 * 合并各 config 对象中的数组字段
 */
function mergeArrayInConfigs(configs, key) {
  return configs.reduce((merged, config) => {
    const array1 = merged[key]
    const array2 = config[key]
    if (array1 && array2) merged[key] = Array.from(new Set([...array1, ...array2]))
    else if (array2) merged[key] = [...array2]
    return merged
  }, {})
}

/**
 * 合并各 config 对象中的对象字段
 */
function mergeObjectInConfigs(configs, key) {
  return configs.reduce((merged, config) => {
    const obj1 = merged[key]
    const obj2 = config[key]
    if (obj1 && obj2) merged[key] = { ...obj1, ...obj2 }
    else if (obj2) merged[key] = { ...obj2 }
    return merged
  }, {})
}
