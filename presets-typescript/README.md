# 通用 TypeScript 配置

| 文件                                              | 场景                                                            |
| ------------------------------------------------- | --------------------------------------------------------------- |
| @anjianshi/presets-typescript/tsconfig-base.json  | 仅用 TypeScript 包进行类型检查，用其他工具编译代码              |
| @anjianshi/presets-typescript/tsconfig-build.json | 用 tsc 执行编译（支持编译类库和 Node.js 脚本，输出 ES6 Module） |
| @anjianshi/presets-typescript/tsconfig-vite.json  | 用 Vite 打包                                                    |
| tsc-with-alias                                    | 组合运行 tsc 和 tsc-alias。                                     |

## 使用方式

安装依赖：

```shell
pnpm add --save-dev @anjianshi/presets-typescript typescript
```

在项目根目录建立 `tsconfig.json`，然后引用所需的文件：

```json
{
  "extends": "./node_modules/@anjianshi/presets-typescript/tsconfig-build"
}
```

注意：在使用 `pnpm` 的情况下，必须使用相对路径来引用 `tsconfig 文件，不能直接通过包名来引用，不然路径计算会出错。

## 配置 path alias

在 `tsconfig.json` 中添加：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 使用 tsc 构建

- 先添加 `ts-alias` 依赖：`pnpm add --save-dev ts-alias`。  
  不用 `ts-alias` 的话，构建结果会保留原始带 alias 的引用，甚至在类型定义里会把原本没用引用的路径改为使用引用。
- 单次构建运行此包提供的脚本：`tsc-with-alias`
- 持续监听构建运行：`tsc-with-alias --watch`

如果在构建的同时还要运行其他内容，例如 `nodemon`：

- 先添加依赖：`pnpm add --save-dev concurrently`
- 构建时运行：`concurrently \"tsc-with-alias --watch\" && \"sleep xxx && nodemon xxx\"`。  
   其中，`sleep` 是可选的，它是为了等待第一次构建完成。

### 使用 Vite 构建

在 `vite.config.js` 的 `resolve.alias` 里添加和 `tsconfig.json` 中一致的配置，  
详见：<https://vitejs.dev/config/shared-options#resolve-alias>。
