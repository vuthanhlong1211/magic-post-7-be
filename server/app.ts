import mongoose from 'mongoose';
import express, {Express, Request, Response} from 'express'
import path from 'path';
import cors from "cors";
import { login } from './controllers/auth';
import { getDeliveryPoints, getDeliveryPointByName } from './controllers/deliveryPoints';
import { getGatheringPoints, getGatheringPointByName } from './controllers/gatheringPoints';
import { createPoint } from './controllers/points';
import { createManager, createStaff, getManagers, getUserByEmail, getUsersByLocationName } from './controllers/users';
import { createOrder, getOrders, getOrderByOrderCode } from './controllers/orders';
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

app.post('/login', login);
// app.post('/create-user', createUserBackDoor)

app.post('/points/create', [auth, checkPosition("Lãnh đạo")], createPoint)

app.get('/points/gathering', [auth, checkPosition("Lãnh đạo")], getGatheringPoints)

app.get('/points/gathering?name=<string>',[auth, checkPosition("Lãnh đạo")], getGatheringPointByName)

app.get('/points/delivery',[auth, checkPosition("Lãnh đạo")], getDeliveryPoints)

app.get('/points/delivery?name=<string>',[auth, checkPosition("Lãnh đạo")], getDeliveryPointByName)

app.post('/user/create/manager', [auth, checkPosition("Lãnh đạo")], createManager);  
 
app.get('/users/managers',[auth, checkPosition("Lãnh đạo")], getManagers);

app.get('/users?email=<string>',[auth, checkPosition("Lãnh đạo")], getUserByEmail);

app.get('/orders', [auth, checkPosition("Lãnh đạo")], getOrders)

app.post('/user/create/staff',[auth, checkPosition("Trưởng điểm")], createStaff)

app.get('/users/point',[auth, checkPosition("Trưởng điểm")], getUsersByLocationName)

app.get('/users?email=<string>', getUserByEmail);

app.post('/order/create', [auth, checkPosition("Giao dịch viên")], createOrder)

app.get('/order?orderCode=<string>', getOrderByOrderCode)

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});