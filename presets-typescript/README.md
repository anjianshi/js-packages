# 通用 tsconfig.json 配置

| 文件                                              | 场景                                                            |
| ------------------------------------------------- | --------------------------------------------------------------- |
| @anjianshi/presets-typescript/tsconfig-base.json  | 仅用 TypeScript 包进行类型检查，用其他工具编译代码              |
| @anjianshi/presets-typescript/tsconfig-build.json | 用 tsc 执行编译（支持编译类库和 Node.js 脚本，输出 ES6 Module） |
| @anjianshi/presets-typescript/tsconfig-vite.json  | 用 Vite 打包                                                    |
| @anjianshi/presets-typescript/tsconfig-alias.json | 路径 alias 配置                                                 |

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
