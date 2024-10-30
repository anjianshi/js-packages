服务端项目

# 架构设计

```yaml
Schema: 定义业务实体
Controller: 封装业务逻辑，包括对业务实体的查询和操作
Task: 执行定期任务
Route: 处理请求（检查传参、格式化响应内容、触发相应的业务逻辑...）
Module: 通用组件或对某一特定功能的封装
```

代码中：

- `prisma/` 对应 `Schema`
- `src/controllers/` 对应 `Controller`
- `src/tasks/` 对应 `Task`
- `src/routes/` 对应 `Route`
- `src/` 下的其他内容都是 `Module`

---

# Prisma ORM 适配

## 约定

1. prism 相关内容（schema、migrations...）放在 `prisma/`，此为 prisma 默认支持的位置。
2. `prisma` 命令会从环境变量或 `.env` 文件中获取数据库连接参数。
   因此此项目设计为用 `.env` 文件维护配置，使得代码和 `prisma` 命令都能方便地读取到需要的配置值。

## 本地开发

1. 每次修改 schema 后，执行 `prisma db push`，把修改同步到数据库中。此操作会顺便重新生成 client 代码。
   或者执行 `prisma generate` 只生成 client 代码，不同步数据库（针对本机开发没有对应的数据库或不希望写入数据库的情况）。
2. 每次修改 TypedSQL 后，执行 `prisma generate --sql` 更新 SQL 类型定义。
3. 开发完成后，执行 `prisma migrate dev` 来生成一个 `migration`。
   注意：因为之前执行了 `prisma db push`，生成 migrate 时会因为表结构冲突要求重置整个数据库、清除数据，相关问题：<https://github.com/prisma/prisma/discussions/16141>。
   目前能想到的解决办法是备份数据（不备份表结构），等生成 migrations 后再导入回来。

前两项操作已定义成 `pnpm db-push` 或 `pnpm db-generate`，
第三项已定义成 `pnpm db-save`。

## 生产环境运行

初始化或每次数据库有变动时：

1. 执行 `pnpm prisma generate` 生成 client 代码。
2. 执行 `pnpm prisma migrate deploy` 来应用 migrations。

此操作已整合成 `pnpm db-deploy` 命令。
