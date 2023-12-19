const mongoose = require('mongoose');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const express = require('express');
const session = require('express-session');
const {makeSessionId} = require('./server/utils/utils');
const {login} = require('./server/controllers/auth');
const {createManager, createStaff} = require('./server/controllers/users');
const {createDeliveryPoint} = require('./server/controllers/deliveryPoints');
const {createGatheringPoint} = require('./server/controllers/gatheringPoints');
const ensureAuthenticated = require('./server/middlewares/auth');
const { getRoomList } = require('./server/controllers/rooms');

require('dotenv').config();

const oneDay = 1000 * 60 * 60 * 24;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: makeSessionId(12),
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

//redirect to the homepage of the system
// app.get('/', (req, res) => {
//   res.redirect('/homepage');
// });

//open the html file of the homepage
// app.get('/homepage', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/views/homepage.html'))
// })

//open the html file of the login interface
// app.get('/login', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/views/login.html'));
// });


// app.post('/login', login);

app.post('/staff/create-gathering-point', createGatheringPoint)

app.post('/staff/create-delivery-point', createDeliveryPoint)

app.post('/leader/create-manager', createManager);

app.post('/manager/create-staff', createStaff)

// app.get('/roomlist', ensureAuthenticated, getRoomList);

// app.get('/dashboard', ensureAuthenticated, (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/views', 'index.html'));
// });

// Đăng ký các sự kiện của socket
require('./server/controllers/socket')(io)


// Mở cổng lắng nghe của socket là 3000
http.listen(3000, () => {
  console.log('listening on *:3000');
});