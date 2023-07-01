const Router = require('express');
const checkAuth = require('../middlewares/auth');
const getRoomList = require('../controllers/rooms').getRoomList;

const roomRoute = Router();

roomRoute.get('/roomlist', checkAuth, getRoomList);

module.exports = roomRoute;