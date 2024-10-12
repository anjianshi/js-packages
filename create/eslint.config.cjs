module.exports = [
  ...require('@anjianshi/presets-eslint-node').map(config => ({
    files: ['src/**/*.*'],
    ...config,
  })),
]
