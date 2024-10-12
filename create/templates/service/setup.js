export async function setup({ command }) {
  await command('npm run db-generate')
}
