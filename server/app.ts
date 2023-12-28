import mongoose from 'mongoose';
import express, {Express, Request, Response} from 'express'
import path from 'path';
import USERS from './models/users';
import { login } from './controllers/auth';
import { createDeliveryPoint, getDeliveryPoints, getDeliveryPointByName } from './controllers/deliveryPoints';
import { createGatheringPoint, getGatheringPoints, getGatheringPointByName } from './controllers/gatheringPoints';
import { createManager, createStaff, getUsers, getUserByEmail, getUsersByLocationName } from './controllers/users';
import { createOrder } from './controllers/orders';
import { Position } from './utils/utils';
import { auth } from './middlewares/auth';
import { checkPosition } from './middlewares/checkPosition';


import * as dotenv from "dotenv";
import config from "./config"
dotenv.config({ path: __dirname  +'/.env' });

const app: Express = express();
const port = config.PORT;

app.use(express.urlencoded({extended: true}));
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

app.post('/leader/gathering-point', createGatheringPoint)

app.get('/leader/gathering-point', getGatheringPoints)

// //potentially errorneous
// app.get('/leader/gathering-point/:name', getGatheringPointByName)

app.post('/leader/delivery-point', createDeliveryPoint);

app.get('/leader/delivery-point', getDeliveryPoints)

// //potentially errorneous
// app.get('/leader/gathering-point?name=<string>', getDeliveryPointByName)

app.post('/leader/manager', createManager); 

app.get('/leader/users', getUsers);

// app.get('/leader/users?email=<string>', getUserByEmail);

app.post('/manager/staff', createStaff)

app.get('/manager/users', getUsersByLocationName)

// app.get('/manager/users?email=<string>', getUserByEmail);

app.post('/staff/order', [auth, checkPosition("")], createOrder)

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});