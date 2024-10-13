const childProcess = require('node:child_process')
const gulp = require('gulp')
const renamePlugin = require('gulp-rename')
const sassPluginFactory = require('gulp-sass')
const swcPlugin = require('gulp-swc')
const dartSass = require('sass')
const { replaceTscAliasPaths } = require('tsc-alias')

const sassPlugin = sassPluginFactory(dartSass)

/**
 * --------------------
 * 常量定义
 * --------------------
 */
const dist = 'dist/'

/**
 * --------------------
 * 任务定义
 * --------------------
 */
function clean(cb) {
  childProcess.exec(`rm -rf ${dist}`, (err, stdout, stderr) => {
    if (stdout.trim()) process.stdout.write(stdout)
    if (stderr.trim()) process.stderr.write(stderr)
    cb()
  })
}

function typescript(cb, path) {
  const swcOptions = {
    jsc: {
      target: 'ES2019', // 编译到较新的语法，但不是最新的（不然 ?. 语言小程序不支持）
    },
    module: {
      type: 'commonjs', // 编译成 commonjs 模块，因为小程序原生不支持 ES6 Module
    },
  }
  return gulp
    .src(path || 'src/**/*.ts', { base: './src' })
    .pipe(swcPlugin(swcOptions))
    .pipe(gulp.dest(dist))
}

function tsAlias(cb) {
  replaceTscAliasPaths().then(cb)
}

function sass(cb, path) {
  return gulp
    .src(path || 'src/**/*.scss', { base: './src' })
    .pipe(sassPlugin().on('error', sassPlugin.logError))
    .pipe(renamePlugin({ extname: '.wxss' }))
    .pipe(gulp.dest(dist))
}

function assets(cb, path) {
  return gulp
    .src(path || ['src/**/*.*', '!src/**/*.(ts|scss)'], { base: './src', encoding: false })
    .pipe(gulp.dest(dist))
}

function watch() {
  function handler(path) {
    if (path.endsWith('.ts')) return gulp.series(typescript.bind(null, null, path), tsAlias)()
    else if (path.endsWith('.scss')) return sass(null, path)
    else return assets(null, path)
  }
  gulp.watch('src/**/*').on('add', handler).on('change', handler)
}

/**
 * --------------------
 * 导出任务
 * --------------------
 */
const build = gulp.series(clean, gulp.parallel(gulp.series(typescript, tsAlias), sass, assets))
exports.build = build

exports.watch = gulp.series(build, watch)
