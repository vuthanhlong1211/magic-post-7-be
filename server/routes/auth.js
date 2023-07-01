const Router = require('express');
const login = require('../controllers/auth');

const authRoute = Router();

authRoute.get('/login', (req, res) => {
    console.log('get logui');
    res.sendFile(path.join(__dirname, 'public/views/login.html'));
});

authRoute.post('/login', login);

module.exports = authRoute;