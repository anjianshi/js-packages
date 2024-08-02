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
