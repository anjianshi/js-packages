# 通用 Prettier 配置

## 如何使用

1、安装依赖

```shell
pnpm add --save-dev @anjianshi/presets-prettier
```

此包已包含 Prettier 依赖，无需再手动添加。

2、引用配置  
在 `package.json` 中添加 `"prettier": "@anjianshi/presets-prettier/prettierrc"`，  
或在项目根目录建立 `.prettierrc.js` 文件：

```js
module.exports = '@anjianshi/presets-prettier/prettierrc'
```

## 配置 VSCode

1、VSCode 安装 `Prettier` 插件

2、VSCode 配置里指定如下内容：

```json
"editor.formatOnSave": true,

// 可按需添加其他类型。
// 或直接设置成所有文件类型的默认 { formatter：{ "editor.defaultFormatter": "esbenp.prettier-vscode" } }
"[javascript][javascriptreact][typescript][typescriptreact][json][jsonc]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
```

3、也可以把此配置粘贴到 VSCode 配置里作为全局配置，这样临时项目也能应用格式化，格式如下：

```json
"prettier.printWidth": 100,
"prettier.semi": false,
"prettier.singleQuote": true,
"prettier.arrowParens": "avoid",
```

### 格式化 wxml

推荐 VSCode 下安装 `WXML - Language Service` 扩展，以更方便地编辑 wxml 文件。
在 VSCode 配置里添加：`"minapp-vscode.wxmlFormatter": "prettier"` 以让其使用 Prettier 来格式化 wxml 代码。

不过目前此扩展与 Prettier 的适配有问题，已向其提交 Pull Request，在 PR 未通过前，可以先手动修改扩展代码以让其正常运行：
找到 VSCode 存放此扩展内容的目录（在 Mac 下是 `~/.vscode/extensions/qiu8310.minapp-vscode-2.4.13/`），修改 `dist/extension.js` 文件，
把 `c = t.format(l, { ...this.config.prettier, ...n })` 改成 `c = await t.format(l, { ...this.config.prettier, ...n })` 即可。
