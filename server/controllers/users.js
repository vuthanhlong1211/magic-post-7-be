const USERS = require('../models/users');
const {hashPassword} = require('../utils/utils');

const createUser = async (req, res) => {
    const {username, password} = req.body;
    if (username.length == 0) {
        return res.json({message: 'username_invalid'});
    }
    if (password.length < 8) {
        return res.json({message: 'password_invalid'});
    }
    const user = await USERS.findOne({username});
    if (user) {
        return res.json({message: 'username_unavailable'});
    }

    const hashedPassword = await hashPassword(password);

    await USERS.create({username, password: hashedPassword});

    return res.json({message: 'success'});
};

module.exports = createUser;