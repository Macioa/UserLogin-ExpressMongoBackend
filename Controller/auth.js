const Express = require('express');
const router = Express.Router();

const bcrypt = require ('bcrypt')
const chalk = require('chalk')

const getZipByIp = require('../IPStack/Geolocate')

const Users = require('../Models/User')

const cookieLength = process.env.COOKIELENGTH||24*60*60*1000
const cookieOptions = process.env.COOKIEOPTIONS||{ maxAge: cookieLength, httpOnly: false, sameSite:'strict' }

const getUsers = async () => { return await Users.find({}) }
const deleteAllUsers = async () => { for (user of await getUsers()) Users.findByIdAndRemove(user.id) }

const createUser = async (newUser, req, res) =>{

    try{
        let createdUser = await Users.create(newUser);
        console.log(chalk.green(`Created user: `+chalk.grey(createdUser.username)))
        req.session.logged = true;
        req.session.username = req.body.username;

        res.cookie('user', createdUser.username, cookieOptions)
        if (createdUser.zip) res.cookie('zip', createdUser.zip, cookieOptions)
        if (createdUser.city) res.cookie('city', createdUser.city, cookieOptions)
        res.json({
            status: 201,
            data: 'Registration successful',
            user: createdUser
        });
    } catch (err) { 
        console.error(err);
        res.json({
            status: 418,
            data: err,
        });
    }
}

router.post('/register', async (req, res, next)=>{
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(chalk.grey(`(${ip})`)+` Create request received for user: ${req.body.username}`);

    let newUser = req.body, hashPass = await bcrypt.hash(req.body.password, 10);
    newUser.password = hashPass; newUser.username = newUser.username.replace(/[^a-z0-9]/gi,'');
    let result = getZipByIp(ip)

    Object.assign(newUser,await result);

    try {
        let foundUser = await Users.find({username: newUser.username})
        console.error(chalk.red('Could not create user. Username taken: ')+chalk.grey(newUser.username))
        res.json({
            status: 409,
            data: 'Username in use',
            });
    } catch (err){
        console.log(err)
        createUser(newUser, req, res);
    }
 });

router.post('/login', async (req, res, next) =>{
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(chalk.grey(`(${ip})`)+` Attempting to login user: ${req.body.username}`);
    try{
        let foundUser = await Users.find({username:req.body.username}, ()=>{
            console.log(chalk.red(`Could not find username: `)+chalk.grey(req.body.username));
        })
        if (foundUser!=undefined){
            let match = await bcrypt.compareSync(req.body.password, foundUser.password);

            if (match){
                req.session.logged = true;
                req.session.username = req.body.username;
                
                console.log(`Successfully logged in ${foundUser.username}`)
                res.cookie('user', createdUser.username, cookieOptions)
                if (createdUser.zip) res.cookie('zip', createdUser.zip, cookieOptions)
                if (createdUser.city) res.cookie('city', createdUser.city, cookieOptions)
                res.json({
                    status: 200,
                    data: 'Login successful',
                    user: foundUser
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
                console.error(err)
                res.json({
                    status: 409,
                    data: 'Invalid username',
                    });
                }

})

module.exports = router;