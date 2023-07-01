const Router = require('express');
const path = require('path');
const createUser = require('../controllers/users');

const signupRoute = Router();

signupRoute.post('/signup', createUser);

signupRoute.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views', 'signup.html'));
  });

module.exports = signupRoute;