#!/usr/bin/env node
import child_process from 'child_process'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'

// -------------------------
// 工具函数
// -------------------------

/**
 * 返回文件所处目录的绝对路径
 */
function getDirectoryPath(fileUrl) {
  return path.dirname(fileURLToPath(new URL(typeof fileUrl !== 'string' ? fileUrl.url : fileUrl)))
}

/**
 * 确认路径信息
 * @return null | 'file' | 'directory'
 */
function confirmPath(path) {
  const stat = fs.statSync(path, { throwIfNoEntry: false })
  if (!stat) return null
  return stat.isDirectory() ? 'directory' : 'file'
}

function exit(message, code = 1) {
  console.error(chalk.red(message))
  process.exit(code)
}

/**
 * 执行命令，返回 status code
 * 若 exitOnError 为 true，执行失败时会直接退出程序
 */
async function command(command, exitOnError = true) {
  console.log('\n> ' + chalk.green(command))
  return new Promise(resolve => {
    const subprocess = child_process.spawn(command, {
      shell: true,
      cwd: projectPath,
    })
    subprocess.stdout.on('data', data => process.stdout.write(chalk.gray(data)))
    subprocess.stderr.on('data', data => process.stdout.write(chalk.red(data)))
    subprocess.on('close', code => {
      if (code !== 0 && exitOnError) exit('命令执行失败')
      process.stdout.write('\n')
      resolve(code)
    })
  })
}

// -------------------------
// 整理参数
// -------------------------

const args = process.argv.slice(2)
const projectName = args
  .map(arg => {
    if (arg.startsWith('--name=')) return arg.slice(7)
    return null
  })
  .find(v => v)
const projectPath = path.resolve(projectName || '.')
const template = args.find(arg => !arg.startsWith('--')) || 'base'
const templatesPath = path.resolve(getDirectoryPath(import.meta.url), '../templates')
const templatePath = path.resolve(templatesPath, template)

console.log('[项目初始化]')
if (projectName) console.log('项目名称: ' + projectName)
console.log('项目路径: ' + projectPath)
console.log('使用模板: ' + template)

// -------------------------
// 确认环境
// -------------------------

if (!templatePath.startsWith(templatesPath) || confirmPath(templatePath) !== 'directory') {
  exit('模板不存在：' + templatePath)
}

const projectPathStat = confirmPath(projectPath)
if (projectPathStat === 'file') exit('项目路径存在同名文件，无法初始化')
else if (projectPathStat) {
  if (fs.readdirSync(projectPath).length) exit('项目路径不为空，无法初始化')
} else {
  fs.mkdirSync(projectPath, { recursive: true })
}

// -------------------------
// 复制模板内容
// -------------------------

console.log('复制模板内容...')
fs.cpSync(templatePath, projectPath, {
  recursive: true,
  filter(src, dest) {
    console.log(dest.slice(projectPath.length))
    return true
  },
})

const gitignorePath = path.join(projectPath, 'gitignore')
if (confirmPath(gitignorePath) === 'file') {
  fs.renameSync(gitignorePath, path.join(projectPath, '.gitignore'))
}

// -------------------------
// 变量替换
// -------------------------

let variableSupportedExts =
  'js,cjs,mjs,ts,cts,mts,jsx,tsx,json,md,html,css,scss,less,styl,txt,ini,yaml,svg'
variableSupportedExts = variableSupportedExts.split(',')

const variablesFile = path.join(projectPath, 'variables.json')
if (confirmPath(variablesFile) === 'file') {
  const variables = JSON.parse(fs.readFileSync(variablesFile))
  fs.unlinkSync(variablesFile)
  if (variables.length) {
    const values = await getVariableValues(variables)
    await replaceVariables(values)
  }
}

async function getVariableValues(variables) {
  console.log('\n[补充项目信息]')
  const values = [] // { name, value }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  for (const variable of variables) {
    const defaults = 'defaults' in variable ? variable.defaults : undefined
    while (true) {
      let answer = await rl.question(
        variable.describe + (defaults === undefined ? '' : `(${defaults})`) + '：',
      )
      answer = answer.trim()
      if (!answer) {
        if (defaults !== undefined) answer = defaults
        else {
          console.log(chalk.red('不能为空'))
          continue
        }
      }
      values.push({ name: variable.name, value: answer })
      break
    }
  }
  rl.close()

  return values
}

async function replaceVariables(values) {
  console.log('\n[替换变量]')

  const directoryItems = fs.readdirSync(projectPath, { recursive: true, withFileTypes: true })
  for (const item of directoryItems) {
    if (!item.isFile()) continue

    const filepath = path.join(item.parentPath, item.name)
    if (!variableSupportedExts.find(ext => filepath.endsWith('.' + ext))) continue

    const origContent = fs.readFileSync(filepath, 'utf8').toString()
    let content = origContent
    for (const { name, value } of values) {
      const match = '{{' + name + '}}'
      if (content.includes(match)) content = content.replaceAll(match, value)
    }
    if (content !== origContent) {
      fs.writeFileSync(filepath, content)
      console.log(filepath)
    }
  }
}

// -------------------------
// 安装依赖
// -------------------------

const packageJSONPath = path.join(projectPath, 'package.json')
if (confirmPath(packageJSONPath) === 'file') {
  const packageJSON = JSON.parse(fs.readFileSync(packageJSONPath))
  const dependencies = Object.entries(packageJSON.dependencies || {})
  const devDependencies = Object.entries(packageJSON.devDependencies || {})
  if (dependencies.length || devDependencies.length) {
    delete packageJSON.dependencies
    delete packageJSON.devDependencies
    fs.writeFileSync(packageJSONPath, JSON.stringify(packageJSON, null, 2))

    console.log('\n[安装依赖]')

    console.log('确认可用的包管理器...')
    const usePnpm = (await command('which pnpm', true)) === 0
    if (!usePnpm) console.log('pnpm 不存在，使用 npm 安装依赖')

    const installCommand = usePnpm ? 'pnpm add ' : 'npm install '
    if (dependencies.length) await command(installCommand + formatDependencies(dependencies))
    if (devDependencies.length)
      await command(installCommand + '--save-dev ' + formatDependencies(devDependencies))
  }
}

function formatDependencies(dependencies) {
  return dependencies
    .map(([name, ver]) => (ver !== 'latest' && ver !== 'workspace:*' ? `${name}@${ver}` : name))
    .join(' ')
}

// -----------------------------
// 执行模板的自定义初始化脚本
// -----------------------------

const setupScriptPath = path.join(projectPath, 'setup.js')
if (confirmPath(setupScriptPath) === 'file') {
  console.log('\n[执行初始化脚本]')

  const context = { getDirectoryPath, confirmPath, command }
  const module = await import(setupScriptPath)
  await module.setup(context)
  fs.unlinkSync(setupScriptPath)
}
