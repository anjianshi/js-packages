module.exports = [
  ...require('@anjianshi/presets-eslint-react'),
  {
    rules: {
      // 适配 Emotion CSS
      'react/no-unknown-property': ['error', { ignore: ['css'] }], // 适配 Emotion CSS

      // 适配 @anjianshi/utils 中的 useAsyncEffect
      'ts-react-hooks/exhaustive-deps': [
        'warn',
        {
          additionalHooks: '(useAsyncEffect)',
        },
      ],
    },
  },
]
