module.exports = [
  ...require('@anjianshi/presets-eslint-react'),
  {
    rules: {
      'react/no-unknown-property': ['error', { ignore: ['css'] }], // 适配 Emotion CSS
    },
  },
]
