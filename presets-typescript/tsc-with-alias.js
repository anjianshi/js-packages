import childProcess from 'node:child_process'

const watch = process.argv.includes('--watch') || process.argv.includes('-w')
const restArgv = process.argv.slice(2).filter(arg => arg !== '--watch' && arg !== '-w')

if (watch) {
  const tsc = childProcess.spawn('npx', ['tsc', ...restArgv, '--watch', '--pretty'], {
    stdio: ['inherit', 'pipe', 'inherit'],
  })
  tsc.stdout.pipe(process.stdout)

  let aliasStarted = false
  tsc.stdout.on('data', data => {
    if (!aliasStarted && data.toString().includes('Watching for file changes')) {
      aliasStarted = true
      childProcess.spawn('npx', ['tsc-alias', ...restArgv, '--watch'], { stdio: 'inherit' })
    }
  })
} else {
  const tsc = childProcess.spawn('npx', ['tsc', ...restArgv], { stdio: 'inherit' })
  tsc.on('exit', code => {
    if (code !== 0) {
      process.stderr.write(`[tsc] failed ${code}\n`)
      process.exit(1)
      return
    }
    console.log(`[tsc] finish`)

    const alias = childProcess.spawn('npx', ['tsc-alias', ...restArgv], {
      stdio: 'inherit',
    })
    alias.on('exit', code => {
      if (code !== 0) {
        process.stderr.write(`[tsc-alias] failed ${code}`)
        process.exit(1)
      } else {
        console.log(`[tsc-alias] finish`)
      }
    })
  })
}
