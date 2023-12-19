const bcrypt = require('bcrypt');
const USERS = require('../models/users');

const login = async (req, res) => {
    const {username, email, password} = req.body;

    if (username.length == 0 ) {
        res.json({success: false});
        return;
    };

    const user = await USERS.findOne({email}).exec();
    console.log(user);
    if (!user) {
        res.json({success: false});
        return;
    }
    const truePassword = user.password;
    if (truePassword == undefined) {
        res.json({success: false});
        return;
    }
    const isMatch = await bcrypt.compare(password, truePassword);
    if (!isMatch) {
        res.json({success: false});
        return;
    }
    req.session.authenticated = true;
    req.session.username = username;
    res.json({message:{
        username: username,
        position: user.position
    },success: true});
}

module.exports = login;