const Express = require('express');
const router = Express.Router();

const bcrypt = require ('bcrypt')

const Users = require('../Models/User')

router.post('/register', async (req, res, next)=>{
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(chalk.grey(`(${ip})`)+`Create request received for user: ${req.body.username}`);

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
    console.log(chalk.grey(`(${ip})`)+`Attempting to login user: ${req.body.username}`);

    let foundUser = await Users.find({username:req.body.username}, (err)=>{
        console.error(chalk.red(`Could not find username: `)+chalk.grey(req.body.username));
        console.error(err);
    })

    let match = await bcrypt.compareSync(req.body.password, foundUser.password);

    if (match){
        req.session.logged = true;
        req.session.username = req.body.username;
    
        res.json({
          status: 200,
          data: 'login successful',
        });
    }

})

module.exports = router;