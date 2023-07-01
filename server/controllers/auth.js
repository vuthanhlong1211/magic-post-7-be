const bcrypt = require('bcrypt');
const USERS = require('../models/users');

const login = async (req, res) => {
    const {username, password} = req.body;

    const user = await USERS.findOne({username}).exec();
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
    res.json({success: true});
}

module.exports = login;