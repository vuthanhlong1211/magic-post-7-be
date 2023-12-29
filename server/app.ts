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
  getUsersByLocationName } from './controllers/users';
import { createOrder, getOrders, 
  getOrderByOrderCode, getOrdersByLocationName,
  getSentOrdersByLocationName,
  getReceivedOrdersByLocationName,
  createTransitionOrder, confirmTransitionOrder} from './controllers/orders';
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
app.get('/order/:orderCode', getOrderByOrderCode)

app.post('/login', login);
// app.post('/create-user', createUserBackDoor)

//Leader
app.post('/point/create', [auth, checkPosition(Position.Leader)], createPoint)

app.get('/points/gathering', [auth, checkPosition(Position.Leader)], getGatheringPoints)

app.get('/points/gathering?name=<string>',[auth, checkPosition(Position.Leader)], getGatheringPointByName)

app.get('/points/delivery',[auth, checkPosition(Position.Leader)], getDeliveryPoints)

app.get('/points/delivery?name=<string>',[auth, checkPosition(Position.Leader)], getDeliveryPointByName)

app.post('/user/create/manager', [auth, checkPosition(Position.Leader)], createManager);  
 
app.get('/users/managers',[auth, checkPosition(Position.Leader)], getManagers);

app.get('/users?email=<string>',[auth, checkPosition(Position.Leader)], getUserByEmail);

app.get('/orders', [auth, checkPosition(Position.Leader)], getOrders)

//Managers
app.post('/user/create/staff',[auth, checkPosition("Trưởng điểm")], createStaff)

app.get('/users/point',[auth, checkPosition("Trưởng điểm")], getUsersByLocationName)

app.get('/orders', [auth, checkPosition("Trưởng điểm")], getOrdersByLocationName)

app.get('/orders/sent', [auth, checkPosition("Trưởng điểm")], getSentOrdersByLocationName)

app.get('/orders/received', [auth, checkPosition("Trưởng điểm")], getReceivedOrdersByLocationName)

// app.get('/users?email=<string>', getUserByEmail);

//Staffs
app.post('/order/create', [auth, checkPosition(Position.DeliveryPointStaff)], createOrder)

app.post('/order/transition/create', [auth, checkPosition(Position.DeliveryPointStaff)], createTransitionOrder)

app.post('/order/transition/create', [auth, checkPosition(Position.GatheringPointStaff)], createTransitionOrder)

app.patch('/order/transition/:orderCode/confirm', [auth, checkPosition(Position.DeliveryPointStaff)], confirmTransitionOrder)

app.patch('/order/transition/:orderCode/confirm', [auth, checkPosition(Position.GatheringPointStaff)], confirmTransitionOrder)

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});