const mongoose = require('mongoose');
const chalk = require('chalk');

var dbURL=`mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}${process.env.DBURL}`;

mongoose.connect(dbURL)

mongoose.connection.on('connected', () =>{
    console.log();
    console.log(chalk.green('Mongoose connected')+chalk.grey(` to ${dbURL}`));
});

mongoose.connection.on('error', (err) =>{
    console.log();
    console.error(chalk.red('Mongoose could not connect')+chalk.yellow(` to ${dbURL}`));
    console.error(chalk.red(err));
});

mongoose.connection.on(`disconnected`, () =>{
    console.log();
    console.warn(chalk.yellow('Mongoose disconnected')+chalk.grey(` from ${dbURL}`));
});
