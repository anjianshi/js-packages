export async function setup({ command }) {
  await command('npx prisma generate')
  console.log('注意：TypedSQL 需正确配置数据库连接参数后手动初始化')
}
