import mongoose from 'mongoose';
import express, {Express, Request, Response} from 'express'
import path from 'path';
import cors from "cors";
import { login } from './controllers/auth';
import { getDeliveryPoints, getDeliveryPointByName } from './controllers/deliveryPoints';
import { getGatheringPoints, getGatheringPointByName } from './controllers/gatheringPoints';
import { createPoint } from './controllers/points';
import { createManager, createStaff,
  getManagers, getUserByEmail,
  getUsers,
  getUsersByLocationName } from './controllers/users';
import { createOrder, getOrders, 
  getOrderByOrderCode, getOrdersByLocationName,
  getSentOrdersByLocationName,
  getReceivedOrdersByLocationName,
  getSentOrdersAtCurLocation,
  getReceivedOrdersAtCurLocation
} from './controllers/orders';
import {  createTransitionOrder, confirmTransitionOrder} from './controllers/transitionOrder'
import { Position } from './utils/utils';
import { auth } from './middlewares/auth';
import { checkPosition } from './middlewares/checkPosition';


import * as dotenv from "dotenv";
import config from "./config"
dotenv.config({ path: __dirname  +'/.env' });

const app: Express = express();
const port = config.PORT;

app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

connectDB().catch(err => console.log(err));

async function connectDB() {
    try {
      await mongoose.connect(config.MONGO_URI).then(() => {
        console.log("Database connected")
      });
    } catch (err) {
        console.log("Error connecting database: ", err);
    } 
}

//Public
app.get('/api/order/:orderCode', getOrderByOrderCode)

app.post('/api/login', login);
// app.post('/create-user', createUserBackDoor)

//Leader
app.post('/protected/points/create', [auth, checkPosition(Position.Leader)], createPoint)

app.get('/protected/points/gathering', [auth, checkPosition(Position.Leader)], getGatheringPoints)

// app.get('/protected/points/gathering?name=<string>',[auth, checkPosition(Position.Leader)], getGatheringPointByName)

app.get('/protected/points/delivery',[auth, checkPosition(Position.Leader)], getDeliveryPoints)

// app.get('/protected/points/delivery?name=<string>',[auth, checkPosition(Position.Leader)], getDeliveryPointByName)

app.post('/protected/user/create/manager', [auth, checkPosition(Position.Leader)], createManager);

app.get('/protected/users',[auth, checkPosition(Position.Leader)], getUsers);
 
app.get('/protected/users/managers',[auth, checkPosition(Position.Leader)], getManagers);

app.get('/protected/users?email=<string>',[auth, checkPosition(Position.Leader)], getUserByEmail);


app.get('/protected/orders', [auth, checkPosition(Position.Leader)], getOrders)

// app.get('/protected/orders', [auth, checkPosition("Lãnh đạo")], getOrdersByLocationName)

app.get('/protected/orders/sent', [auth, checkPosition("Lãnh đạo")], getSentOrdersByLocationName)

app.get('/protected/orders/received', [auth, checkPosition("Lãnh đạo")], getReceivedOrdersByLocationName)


//Managers
app.post('/protected/user/create/staff',[auth, checkPosition("Trưởng điểm")], createStaff)

app.get('/protected/users/point',[auth, checkPosition("Trưởng điểm")], getUsersByLocationName)

app.get('/protected/orders', [auth, checkPosition("Trưởng điểm")], getOrdersByLocationName)

app.get('/protected/orders/sent', [auth, checkPosition("Trưởng điểm")], getSentOrdersAtCurLocation)

app.get('/protected/orders/received', [auth, checkPosition("Trưởng điểm")], getReceivedOrdersAtCurLocation)

// app.get('/users?email=<string>', getUserByEmail);

//Staffs
app.post('/protected/order/create', [auth, checkPosition(Position.DeliveryPointStaff)], createOrder)

app.post('/protected/order/transition/create', [auth, checkPosition(Position.DeliveryPointStaff)], createTransitionOrder)

app.post('/protected/order/transition/create', [auth, checkPosition(Position.GatheringPointStaff)], createTransitionOrder)

app.patch('/protected/order/transition/:orderCode/confirm', [auth, checkPosition(Position.DeliveryPointStaff)], confirmTransitionOrder)

app.patch('/protected/order/transition/:orderCode/confirm', [auth, checkPosition(Position.GatheringPointStaff)], confirmTransitionOrder)

app.get('/protected/orders/sent', [auth, checkPosition(Position.DeliveryPointStaff)], getSentOrdersAtCurLocation)

app.get('/protected/orders/received', [auth, checkPosition(Position.DeliveryPointStaff)], getReceivedOrdersAtCurLocation)

app.get('/protected/orders/sent', [auth, checkPosition(Position.GatheringPointStaff)], getSentOrdersAtCurLocation)

app.get('/protected/orders/received', [auth, checkPosition(Position.GatheringPointStaff)], getReceivedOrdersAtCurLocation)

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});