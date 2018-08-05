const chalk = require('chalk')

const express = require('express')
const server = express();

try { require('./env') }catch(err){ console.log(err)}
require('./dbConnect')

const port = process.env.PORT||3000;



server.listen(port, (err)=>{
    if (err) console.error(chalk.red('Could not start Express server: '+chalk.grey(err)))
    else console.log(chalk.green('Express server listening on : ')+chalk.yellow(`${port}`))
})