# JavaScript 公共包合集

在此 git repo 下维护所有个人项目用到的公共 JavaScript 包。如通用的配置文件、函数库。

| 目录               | 内容                 | 备注 |
| ------------------ | -------------------- | ---- |
| presets-eslint     | 通用 ESLint 配置     |      |
| presets-prettier   | 通用 Prettier 配置   |      |
| presets-typescript | 通用 TypeScript 配置 |      |
| create             | 项目模板             |      |
| utils              | 工具函数库           |      |

## 如何发布

1. 先全局安装 [pnpm-workspace-publisher](https://github.com/anjianshi/pnpm-workspace-publisher)
2. 修改有更新的包的版本号
3. 运行 `ws-publish` 执行更新
