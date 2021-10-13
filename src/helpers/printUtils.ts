import chalk = require('chalk');

export function dim() {
    console.log(chalk.dim.call(chalk, ...arguments));
}

export function yellow() {
    console.log(chalk.yellow.call(chalk, ...arguments));
}

export function green() {
    console.log(chalk.green.call(chalk, ...arguments));
}
