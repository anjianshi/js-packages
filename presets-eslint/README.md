# 公共 ESLint 配置

## 设计思路

一、  
只开启尽量少的规则，目标是**减少 bug 率**，而不是**限制**代码风格。

二、  
参考 [此文章](https://typescript-eslint.io/linting/troubleshooting/formatting/) 的建议，不开启代码样式规则，
由专门的格式化工具，如 `Prettier` 来控制。  
[被排除的规则](https://github.com/prettier/eslint-config-prettier/blob/main/index.js)，
主要包括 ESLint 自身 `Layout & Formatting` 段落的全部规则和 TypeScript、React 插件的许多规则。

---

## 包列表

| 包名                                 | 内容                               |
| ------------------------------------ | ---------------------------------- |
| @anjianshi/presets-eslint-base       | 基础 JavaScript 规则及一些辅助内容 |
| @anjianshi/presets-eslint-typescript | TypeScript 规则                    |
| @anjianshi/presets-eslint-react      | React + TypeScript 规则            |
| @anjianshi/presets-eslint-node       | Node.js + TypeScript 规则          |

---

## 如何使用

### 安装

```sh
pnpm add --save-dev eslint @anjianshi/presets-eslint-xxx
```

### 配置 ESLint

建立 `eslint.config.cjs` 文件：

```js
module.exports = [
  ...require('@anjianshi/presets-eslint-xxx'),

  // 如果只想引入某个场景专属的配置，例如只引入 TypeScript 配置，不包含 base，可以引入 exclusive.cjs 文件
  ...require('@anjianshi/presets-eslint-xxx/exclusive.cjs'),
]
```

### 配置 TypeScript

1、安装 TypeScript

2、为 parser 指明 `tsconfig.json` 的位置。  
`@typescript-eslint/parser` 需要有一个配置好了的 `tsconfig.json` 才能运行。  
默认假定它与 ESLint 配置文件处在同目录，如果是在其他地方，则需手动指定：

```js
module.exports = [
  ...require('./node_modules/@anjianshi/eslint-typescript'),
  {
    languageOptions: {
      parserOptions: {
        project: '../tsconfig.json',
      },
    },
  },
]
```

3、为 import 插件指明 `tsconfig.json` 的位置。  
如果在 TypeScript 项目里启用了 Node.js 原生 ES6 Module 或配置了 alias，  
则 `eslint-import-plugin` 需要配合 `eslint-import-resolver-typescript` 且也需要一个配置好了的 `tsconfig.json` 才能正常运行。  
如果 `tsconfig.json` 不在项目根目录，需要手动指明（以项目根目录为基准）：

```js
module.exports = [
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: './src/',
        },
      },
    },
  },
]
```

### 配置 VSCode

1、安装 VSCode 插件 `ESLint`

2、修改 VSCode 设置（Code - Preferences - Settings）

```json
{
  "editor.tabSize": 2,
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,

  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" },
  "eslint.workingDirectories": [{ "mode": "auto" }]
}
```

#### 关于 ESLint workingDirectories

若 VSCode 的 workspace 配置成类似如下目录结构：

```js
projects/     // /Users/me/office/projects/
  proj-1/
  proj-2/
  ...

library/      // /Users/me/library/
  lib-1/
  lib-2/
```

也就是，workspace 下添加了多个独立的文件夹，每个独立文件夹下又有多个项目。
在开发这些项目（`proj-1`、`lib-1`...）时，VSCode 默认会把顶层目录作为 ESLint 的 `workingDirectory`，从那个目录下加载插件等依赖，导致找不到依赖。
在 VSCode 配置里指定 `{ "mode": "auto" }` 可解决此问题，它会让 VSCode 把 `package.json` 存在的目录作为 `workingDirectory`，也就能正常引入依赖了。

#### 关于 eslint.validate 配置

以前 VSCode 里还需要配置 `eslint.validate`，但它现在被 `eslint.probe` 代替了。  
且 `eslint.probe` 的默认值已符合需求，所以无需配置。

### 辅助内容 - @anjianshi/presets-eslint-base/globals.cjs

最新版的 ESLint 是通过设置 `globals` 来定义运行环境有哪些全局变量，例如 Node.js 里的 `process`。
官方说明是可以从 `globals` npm 包取得这些定义：<https://eslint.org/docs/latest/use/configure/language-options#predefined-global-variables>。
base 包的 `globals.cjs` 文件原样引用了 `globals` npm 包，需要时可以直接使用此文件，就不用手动安装 `globals` 依赖了。

### 辅助内容 - @anjianshi/presets-eslint-base/utils.cjs

此文件提供了一些工具函数:

```typescript
// 限定配置生效的路径
// pathPrefixs 会转化为各配置对象的 files 属性，如果配置中已经有 files，则设置成各 files 的路径前缀。
exports.limitFiles = function limitFiles(pathPrefixs: string | string[], configs: ESLintConfig[]): ESLintConfig
```

---

## 开发说明

### 如何更新 ESLint 规则

看 ESLint 及各插件的 ChangeLog，来补充、移除、调整规则定义。
(规则文件里只定义和默认值不同的规则，例如默认不开启，也没准备开启的规则就不写下来)
