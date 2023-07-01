const mongoose = require('mongoose');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const express = require('express');
const session = require('express-session');
const {makeid} = require('./server/utils/utils');
const login = require('./server/controllers/auth');
const createUser = require('./server/controllers/users');
const checkAuth = require('./server/middlewares/auth');
const { getRoomList } = require('./server/controllers/rooms');

require('dotenv').config();

const oneDay = 1000 * 60 * 60 * 24;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: makeid(12),
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge: oneDay}
}));

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Database connected!');
  } catch (error) {
    console.log("Error connecting database: ", error);
  }
})();

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views/signup_login.html'));
});

app.post('/login', login);

app.post('/signup', createUser);

app.get('/roomlist', checkAuth, getRoomList);

app.get('/dashboard', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views', 'index.html'));
});

// Đăng ký các sự kiện của socket
require('./server/controllers/socket')(io)


// Mở cổng lắng nghe của socket là 3000
http.listen(3000, () => {
  console.log('listening on *:3000');
});