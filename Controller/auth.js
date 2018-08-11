const Express = require('express');
const router = Express.Router();

const bcrypt = require ('bcrypt');
const chalk = require('chalk');

const getZipByIp = require('../IPStack/Geolocate')

const Users = require('../Models/User')

//                  Server Variables
const cookieLength = process.env.COOKIELENGTH||24*60*60*1000
const cookieOptions = process.env.COOKIEOPTIONS||{ maxAge: cookieLength, httpOnly: false, sameSite:'strict' }
const encryptionMethod = process.env.ENCRYPTIONMETHOD||'aes-256-ctr'
const encryptionKey = process.env.ENCRYPTIONKEY||'supersupersecret'

//                  Reg functions
const getUsers = async () => { return await Users.find({}) }

const deleteAllUsers = async () => { Users.find({}, (err, users)=>{
    console.log(users)
    for (let user of users)
        Users.findByIdAndRemove(user.id, (err, user)=>{console.log(chalk.red('Deleted:'),user)})}) }

const createUser = async (newUser, req, res) =>{
    try{
        let createdUser = await Users.create(newUser);
        console.log(chalk.green(`Created user: `,chalk.grey(createdUser)))

        if (createdUser.guest) createdUser.username='Guest'

        req.session.logged = true;
        req.session.username = req.body.username;

        res.cookie('user', createdUser.username, cookieOptions)
        if (createdUser.zip) res.cookie('zip', createdUser.zip, cookieOptions);
        if (createdUser.city) res.cookie('city', createdUser.city, cookieOptions);
        if (createdUser.state) res.cookie('state', createdUser.state, cookieOptions);
        if (createdUser.country) res.cookie('country', createdUser.country, cookieOptions);
        createdUser.password=null; createdUser._id=null;
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

//                  Routes
router.post('/register', async (req, res, next)=>{
    console.log(req.body.get('key'))
    if (req.body.json()) var parsed = await req.body.json()
    if (parsed) console.log(parsed)
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(chalk.grey(`(${ip})`)+` Create request received for user: ${req.body.username}`);

    let newUser = req.body, hashPass = await bcrypt.hash(req.body.password, 10);
    newUser.password = hashPass; newUser.username = newUser.username.replace(/[^a-z0-9]/gi,''); newUser.ips=[]; newUser.ips[0]=ip.toString();


    let result = await getZipByIp(ip)
    Object.assign(newUser, result)

    let foundUser = await Users.findOne({username: newUser.username})
    if (foundUser){
        console.error(chalk.red('Could not create user. Username taken: ')+chalk.grey(newUser.username))
        res.json({
            status: 409,
            data: 'Username in use',
            });
    } else { createUser(newUser, req, res); }
 });

router.post('/login', async (req, res, next) =>{
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(chalk.grey(`(${ip})`)+` Attempting to login user: ${req.body.username}`);

        let foundUser = await Users.findOne({username:req.body.username})

        if (await foundUser){
            let match = await bcrypt.compareSync(req.body.password, await foundUser.password);

            if (await match){
                req.session.logged = true;
                req.session.username = req.body.username;
                
                console.log(`Successfully logged in ${foundUser.username}`,foundUser)

                if (!foundUser.ips.filter(i=>i==ip.toString()).length){
                    founderUser.ips.push(ip)
                    Users.findByIdAndUpdate(foundUser._id, foundUser, {new: true})
                }

                res.cookie('user', foundUser.username, cookieOptions)
                if (foundUser.zip) res.cookie('zip', foundUser.zip, cookieOptions);
                if (foundUser.city) res.cookie('city', foundUser.city, cookieOptions);
                if (foundUser.state) res.cookie('state', foundUser.state, cookieOptions);
                if (foundUser.country) res.cookie('country', foundUser.country, cookieOptions);
                foundUser.password=null; foundUser._id=null;
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
        } else {
            console.error(chalk.red(`Could not find username: `)+chalk.grey(req.body.username))
            res.json({
                status: 409,
                data: 'Invalid username',
                }); 
        }
})

router.post('/guest', async (req, res, next)=>{
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(chalk.grey(`(${ip}) `)+"Request for guest access");

    var foundUser = await  Users.findOne({username:ip})
    if (foundUser){
        console.log(`Successfully logged in ${foundUser.username}`);
        foundUser.username='Guest';
        req.session.logged = true;
        req.session.username = req.body.username;
        
        res.cookie('user', foundUser.username, cookieOptions);
        if (foundUser.zip) res.cookie('zip', foundUser.zip, cookieOptions);
        if (foundUser.city) res.cookie('city', foundUser.city, cookieOptions);
        if (foundUser.state) res.cookie('state', foundUser.state, cookieOptions);
        if (foundUser.country) res.cookie('country', foundUser.country, cookieOptions);
        foundUser.password=null; foundUser._id=null;
        res.json({
            status: 200,
            data: 'Login successful',
            user: foundUser
        });
    } else {
        let newUser = {};
        newUser.password = "temporary";
        newUser.username=ip;
        newUser.guest=true;
        let location = getZipByIp(ip)
        Object.assign(newUser, await location)
        createUser(newUser, req, res);
    }
});

module.exports = router;