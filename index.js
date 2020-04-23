#!/usr/bin/env node
const program = require('commander'); //捕获指令
const { exec } = require('child_process'); //系统命令
const download = require('download-git-repo'); //下载模板
const ora = require('ora'); //带标记的打印
const inquirer = require('inquirer'); //交互
const chalk = require('chalk'); //文字上色
const spinner = ora();

const projectCollection = [
    {
        type: 'list',
        message: '请选择生成的项目',
        name: 'util',
        choices: [
            "基与vue+vant的移动端web项目",
        ],
    },
];

const downloadUtils = (name, dist) => {
    spinner.start('正在下载模板');
    download(name, dist, (err) => {
        if (err) {
            spinner.fail(chalk.red('模板下载失败'));
            throw err;
        } else {
            spinner.succeed(chalk.green(`模板下载成功, cd ${dist} -> npm install -> npm run serve`));
        }
    })
};

program.version('1.0.1', '-v, --version')
    .command('create <name>')
    .action(argv => {
        inquirer.prompt(projectCollection).then((result) => {
            switch (result.util) {
                case '基与vue+vant的移动端web项目':
                    downloadUtils('haoziqaq/lbd-vue-mobile-web-template', argv);
                    break;
                default:
                    spinner.fail(chalk.red('操作异常'));
            }
        });
    });

program.parse(process.argv);
