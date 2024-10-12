# 项目模板

## 模板列表

| 目录        | 内容     | 备注                                       |
| ----------- | -------- | ------------------------------------------ |
| base        | 基础模板 | 配置了 Prettier 和 ESLint                  |
| service     | 后端服务 | TypeScript + starlight-server + Prisma ORM |
| site        | 前端站点 | TypeScript + React + Ant Design + Vite     |
| miniprogram | 小程序   | TypeScript + SCSS + gulp.js                |

## 使用方法

```shell
# 这个命令本质上是执行 `npm exec @anjianshi/create`，即执行这个包 `package.json` 中的 `bin` 配置的脚本。
npm init @anjianshi@latest {template} -- --name=xxx
```

- 若不指定 `template`，则使用 `基础模板`。
- 若指定 `name`，则用指定名称新建一个文件夹然后初始化项目，否则在当前目录初始化项目（要求当前目录为空）

## 开发约定

### 指定依赖版本

除非有明确的版本需要，否则 `package.json` 中的依赖版本都指定为 `latest` 或 `workspace:*`，项目初始化时会替换为实际版本号。

注意：同时引用 `@anjianshi/utils` 和 `starlight-server` 时，`utils` 需要用 `latest`，不然两个类库的 `Logger` 类会被认为是不同的，导致类型检查不通过。

### 定义变量

在模板根目录放置 `variables.json`，格式如下：

```json
[
  {
    "name": "VARIABLE_NAME", // 变量名
    "describe": "xxxx", // 变量介绍
    "defaults": "xxxx" // 变量默认值，此项不存在代表是必填变量
  },
  ...
]
```

然后在项目任意文件中，可用 `{{VARIABLE_NAME}}` 的形式放置占位符，在初始化项目时会替换为实际变量值。
