const USERS = require('../models/users');
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

const createUser = async (req, res) => {
    const {username, password} = req.body;

    const user = await USERS.findOne({username});
    if (user) {
        return res.json({message: 'username_unavailable'});
    }

    const hashedPassword = await hashPassword(password);

    console.log(await USERS.create({username, password: hashedPassword}));

    return res.json({message: 'success'});
};

module.exports = createUser;