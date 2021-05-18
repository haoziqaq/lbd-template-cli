#!/usr/bin/env node
const program = require('commander')
const download = require('download-git-repo')
const spinner = require('ora')()
const inquirer = require('inquirer')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const cwd = process.cwd()
const ROUTES_ROOTS = ['./src/views', './src/pages']
const version = require('./package.json').version

/**
 * 查找存在的目录
 * @param roots 目录列表
 * @returns {null}
 */
function findExistDir(roots) {
  roots = JSON.parse(JSON.stringify(roots))
  let existDir = null
  while (existDir === null && roots.length > 0) {
    const dir = roots.shift()
    if (fs.existsSync(path.resolve(cwd, dir))) {
      existDir = dir
    }
  }
  return existDir
}

function formatDate(time, fmt) {
  if (!time) return ''
  let date = typeof time === 'number' ? new Date(time) : time
  const expList = {
    'M+': date.getMonth() + 1,                //月份
    'd+': date.getDate(),                    //日
    'H+': date.getHours(),                   //小时
    'h+': date.getHours() <= 12 ? date.getHours() : date.getHours() - 12, //12制小时
    'm+': date.getMinutes(),                 //分
    's+': date.getSeconds(),                 //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    'S': date.getMilliseconds(),             //毫秒
    'n': date.getHours() < 12 ? 'AM' : 'PM' //上午am,下午pm
  }
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (let exp in expList) {
    if (new RegExp(`(${exp})`).test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ?
        (expList[exp]) : ((`00${expList[exp]}`).substr((`${expList[exp]}`).length)))
    }
  }
  return fmt
}

function mkdirs(path) {
  let dirs = path.split('\\')
  let targetPath = ''
  while (dirs.length > 0) {
    const current = dirs.shift()
    targetPath += `${current}/`
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath)
    }
  }
}

const projectCollection = [
  {
    type: 'list',
    message: '请选择生成的项目',
    name: 'util',
    choices: [
      '基于vue3+vite+varlet的移动端web项目',
      '基于vue+vant的移动端web项目',
      '基于vue-cli的uniapp项目'
    ]
  }
]

const downloadUtils = (name, dist) => {
  spinner.start('正在下载模板')
  download(name, dist, (err) => {
    if (err) {
      spinner.fail(chalk.red('模板下载失败'))
      throw err
    } else {
      switch (name) {
        case 'haoziqaq/varlet-vite-app#main':
          spinner.succeed(chalk.green(`模板下载成功, cd ${dist} -> yarn -> yarn dev`))
          break
        case 'haoziqaq/lbd-vue-mobile-web-template':
          spinner.succeed(chalk.green(`模板下载成功, cd ${dist} -> yarn -> yarn serve`))
          break
        case 'haoziqaq/lbd-vue-uniapp-template':
          spinner.succeed(chalk.green(`模板下载成功, cd ${dist} -> yarn -> yarn dev:mp-weixin`))
          break
      }
    }
  })
}

program
  .version(version, '-v, --version')
  .command('create <name>')
  .action(name => {
    inquirer.prompt(projectCollection).then((result) => {
      switch (result.util) {
        case '基于vue3+vite+varlet的移动端web项目':
          downloadUtils('haoziqaq/varlet-vite-app#main', name)
          break
        case '基于vue+vant的移动端web项目':
          downloadUtils('haoziqaq/lbd-vue-mobile-web-template', name)
          break
        case '基于vue-cli的uniapp项目':
          downloadUtils('haoziqaq/lbd-vue-uniapp-template', name)
          break
        default:
          spinner.fail(chalk.red('操作异常'))
      }
    })
  })

const TemplateTypes = ['simple', 'form', 'list', 'detail']

program
  .command('mv <route> [template] [routeName]')
  .description('创建路由文件')
  .action((route, template, routeName) => {
    //区别项目
    const routeRoot = findExistDir(ROUTES_ROOTS) || './src/views'
    let templateType = TemplateTypes.includes(template) ? template : 'simple'
    let tpl = fs.readFileSync(path.resolve(__dirname, './tpl', `./${templateType}.vue`)).toString('utf8')
    const pkg = JSON.parse(fs.readFileSync(path.resolve(cwd, './package.json')).toString('utf8'))
    tpl = `/**\r\n` +
      ` * @fileOverview ${routeName || route}\r\n` +
      ` * @author ${pkg.author || '文件创建者'}\r\n` +
      ` * @date ${formatDate(new Date(), 'yyyy-MM-dd')}\r\n` +
      ` */\r\n`
      + tpl
    if (!route.startsWith('/') || route.endsWith('/')) {
      spinner.fail(chalk.yellow('route参数必须以/开头, 不能以/结尾'))
      return
    }
    const filePath = path.resolve(cwd, routeRoot, `.${route}/index.vue`)
    if (fs.existsSync(filePath)) {
      //已存在目标路由文件, 直接退出
      spinner.fail(chalk.yellow(`${route}路由文件已存在,为避免误操作覆盖文件的可能性,不提供覆盖功能,请自行删除路由文件重试`))
      return
    } else {
      //不存在目标路由文件,检查目录是否存在
      const fileDir = path.resolve(cwd, routeRoot, `.${route}`)
      if (fs.existsSync(fileDir)) {
        //存在 直接写入
        fs.writeFileSync(filePath, Buffer.from(tpl, 'utf8'))
      } else {
        //不存在 创建目录写入
        mkdirs(fileDir)
        fs.writeFileSync(filePath, Buffer.from(tpl, 'utf8'))
      }
      spinner.succeed(chalk.green('创建成功'))
    }
    //路由文件已生成，无差别处理pages.json
    const pageJSONDir = path.resolve(cwd, './src/pages.json')
    if (fs.existsSync(pageJSONDir)) {
      //存在pages.json就处理pages字段
      const json = JSON.parse(fs.readFileSync(pageJSONDir).toString('utf8'))
      //判断路由配置是否存在, 存在就覆盖。
      if (Array.isArray(json.pages)) {
        const targetPath = `pages${route}/index`
        const existPathIndex = json.pages.findIndex(item => item.path === targetPath)
        existPathIndex > -1 && json.pages.splice(existPathIndex, 1)
        json.pages.push({
          path: `pages${route}/index`,
          style: {
            enablePullDownRefresh: false,
            navigationBarTitleText: routeName || '未设置页面标题'
          }
        })
        const jsonString = JSON.stringify(json, null, 4)
        fs.writeFileSync(pageJSONDir, Buffer.from(jsonString, 'utf8'))
      }
    }
  })

program.parse(process.argv)

