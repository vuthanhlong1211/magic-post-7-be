const Router = require('express');
const path = require('path');
const checkAuth = require('../middlewares/auth');

const dashboardRoute = Router()

dashboardRoute.get('/dashboard', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views', 'index.html'));
});

module.exports = dashboardRoute;