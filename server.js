/*
        Server Variables:
        DBURL, DBUSER, DBPASS, PORT, COOKIELENGTH, COOKIEOPTIONS, ENCRYPTIONMETHOD, ENCRYPTIONKEY, SERVER
*/
try { require('./env') }catch(err){ console.log(err)};
require('./dbConnect')
const port = process.env.PORT||3000;
const frontserver = process.env.SERVER||'https://localhost:3000'

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
  
var corsOptions = {
  origin: frontserver,
  credentials: true,
  optionsSuccessStatus: 200 
}
server.use(cors(corsOptions));
//server.use(helmet())

server.use('/auth/', require('./Controller/auth'))

server.post('/login', (req,res,next)=>{ res.redirect(307,'/auth/login') })
server.post('/register', (req,res,next)=>{ res.redirect(req, '/auth/register', 308) })
server.post('/guest', (req,res,next)=>{ res.redirect(307,'/auth/guest') })

server.listen(port, (err)=>{
    if (err) console.error(chalk.red('Could not start Express server: '+chalk.grey(err)))
    else console.log(chalk.green('Express server listening on : ')+chalk.yellow(`${port}`))
});