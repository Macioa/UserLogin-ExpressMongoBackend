/*
        Server Variables:
        DBURL, DBUSER, DBPASS, PORT, COOKIELENGTH, COOKIEOPTIONS, ENCRYPTIONMETHOD, ENCRYPTIONKEY, SERVER
*/
try { require('./env') }catch(err){ console.log(err)};
require('./dbConnect')
const port = process.env.PORT||9000;
const frontserver = process.env.SERVER||'http://localhost:3000'

const express = require('express');
const server = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const chalk = require('chalk');

server.use(session({
    secret: 'nooneknowsthissupersecretkeythatsongithub',
    resave: false,
    saveUninitialized: false
  }))
  
//server.use(bodyParser.urlencoded({extended: false}));
server.use(bodyParser.json());
console.log(frontserver)
var corsOptions = {
  origin: frontserver,
  credentials: true,
  content:'application/json',
  optionsSuccessStatus: 200 ,
  methods: 'POST',
}

server.use(cors(corsOptions));
server.use(helmet())
server.post('/register', (req,res,next)=>{ next(); res.redirect(308,'/auth/register') })

server.use('/auth/', require('./Controller/auth'))

server.post('/login', (req,res,next)=>{ next(); res.redirect(307,'/auth/login') })

server.post('/guest', (req,res,next)=>{ next(); res.redirect(307,'/auth/guest') })



server.listen(port, (err)=>{
    if (err) console.error(chalk.red('Could not start Express server: '+chalk.grey(err)))
    else console.log(chalk.green('Express server listening on : ')+chalk.yellow(`${port}`))
});