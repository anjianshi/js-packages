// 因为此包没有 TypeScript 内容，所以不直接引用 node/index.cjs
module.exports = [...require('./base/index.cjs'), ...require('./node/exclusive.cjs')]
