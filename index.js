const pull = require('pull-stream')
const chalk = require('chalk');

pull(
  pull.values(['hello', 'world']),
  pull.drain((x) => {
    console.log(chalk.blue(x))
  })
)
