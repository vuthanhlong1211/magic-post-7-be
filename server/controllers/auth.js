const bcrypt = require('bcrypt');
const USERS = require('../models/users');

const login = async (req, res) => {
    const {username, password} = req.body;

    const user = await USERS.findOne({username});
    const isMatch = await bcrypt.compare(password, user.password);
    if (!user || !isMatch) {
        res.json({success: false});
        return;
    }
    req.session.authenticated = true;
    req.session.username = username;
    res.json({success: true});
}

module.exports = login;