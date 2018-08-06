const Express = require('express');
const router = Express.Router();

const bcrypt = require ('bcrypt')
const chalk = require('chalk')

const Users = require('../Models/User')

router.post('/register', async (req, res, next)=>{
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(chalk.grey(`(${ip})`)+` Create request received for user: ${req.body.username}`);

    let newUser = req.body, hashPass = await bcrypt.hash(req.body.password, 10);
    newUser.password = hashPass;

    try{
        let createdUser = Users.create(newUser);

        req.session.logged = true;
        req.session.username = req.body.username;

        res.json({
            status: 201,
            data: 'Registration successful',
        });
    } catch (err) { 
        console.err(err);
        res.json({
            status: 418,
            data: err,
        });
    }
});

router.post('/login', async (req, res, next) =>{
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(chalk.grey(`(${ip})`)+` Attempting to login user: ${req.body.username}`);
    try{
        let foundUser = await Users.findOne({username:req.body.username}, ()=>{
            console.log(chalk.red(`Could not find username: `)+chalk.grey(req.body.username));
        })
        if (foundUser!=undefined){
            let match = await bcrypt.compareSync(req.body.password, foundUser.password);

            if (match){
                req.session.logged = true;
                req.session.username = req.body.username;
                
                console.log(`Successfully logged in ${foundUser.username}`)
                res.json({
                status: 200,
                data: 'Login successful',
                });
            } else {
                console.log(chalk.red('Invalid password'))
                res.json({
                    status: 409,
                    data: 'Invalid password',
                });
            }
        }
     } catch(err){ 
                res.json({
                    status: 409,
                    data: 'Invalid username',
                    });
                }

})

module.exports = router;