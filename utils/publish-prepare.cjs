const fs = require('node:fs')
const path = require('node:path')

const base = path.resolve(__dirname, './')
const dist = path.join(base, 'dist')

const packageJSON = require(path.join(base, 'package.json'))
delete packageJSON.publishConfig.directory
delete packageJSON.scripts
for (const [key, value] of Object.entries(packageJSON.dependencies)) {
  packageJSON.dependencies[key] = value.replace('workspace:', 'workspace:../')
}
for (const [key, value] of Object.entries(packageJSON.devDependencies)) {
  packageJSON.devDependencies[key] = value.replace('workspace:', 'workspace:../')
}
fs.writeFileSync(path.join(dist, 'package.json'), JSON.stringify(packageJSON, null, 2))
