import mongoose from 'mongoose';
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
import path from 'path';
import express from 'express';
import session from 'express-session';
import { makeSessionId } from './server/utils/utils';
import { login } from './server/controllers/auth';
import { createDeliveryPoint, getDeliveryPoints, getDeliveryPointByName } from './server/controllers/deliveryPoints';
import { createGatheringPoint, getGatheringPoints, getGatheringPointByName } from './server/controllers/gatheringPoints';
import { createManager, createStaff, getUsers, getUserByEmail, getUsersByLocationName } from './server/controllers/users';

import * as dotenv from "dotenv";
import config from "./config.ts"
dotenv.config({ path: __dirname  +'/.env' });

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
    await mongoose.connect(config.MONGO_URI);
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


app.post('/login', login);

app.post('/leader/gathering-point', createGatheringPoint)

app.get('/leader/gathering-point', getGatheringPoints)

//potentially errorneous
app.get('/leader/gathering-point/:name', getGatheringPointByName)

app.post('/leader/delivery-point', createDeliveryPoint)

app.get('/leader/delivery-point', getDeliveryPoints)

//potentially errorneous
app.get('/leader/gathering-point/:name', getDeliveryPointByName)

app.post('/leader/manager', createManager);

app.get('/leader/users', getUsers);

app.get('/leader/users/:email', getUserByEmail);

// app.get('/users', getUser);

app.post('/manager/staff', createStaff)

app.get('/manager/users', getUsersByLocationName)

app.get('/manager/users/:email', getUserByEmail);

// app.get('/users/location', getUserByLocation)



// app.get('/roomlist', ensureAuthenticated, getRoomList);

// app.get('/dashboard', ensureAuthenticated, (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/views', 'index.html'));
// });

// Đăng ký các sự kiện của socket
require('./server/controllers/socket')(io)


// Mở cổng lắng nghe của socket là 3000
http.listen(process.env.PORT, () => {
  console.log('listening on *:3000');
});