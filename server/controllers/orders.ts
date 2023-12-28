import { CustomRequest } from "../middlewares/auth";
import ORDERS from "../models/orders"
import USERS from "../models/users"
import { Request, Response } from "express"

const generateOrderCode = (): string => {
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().slice(2);
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); 
    const day = currentDate.getDate().toString().padStart(2, '0'); 

    // create order code with the format VNyyMMdd-xxxx (xxxx random from 100000 to 999999)
    const orderCode = `VN${year}${month}${day}-${Math.floor(Math.random() * 900000) + 100000}`;

    return orderCode;
}

const calculateDeliveryFee = (grossWeight: number): number => {
    //Based on GHTK fee for in-city delivery
    // Define a base delivery fee and a rate per kilogram
    const baseDeliveryFee = 22000; // Based fee for orders weighing less than 3kg
    const ratePerHalfKilogram = 2500; // for each 0.5 extra kgs
    const threshold = 3;
    // Calculate the delivery fee based on the net weight
    var deliveryFee = 0; 
    if (grossWeight <= threshold){
        deliveryFee = baseDeliveryFee;
    } else {
        deliveryFee = baseDeliveryFee + Math.ceil((grossWeight - threshold) / 0.5) * ratePerHalfKilogram;;
    }
  
    return deliveryFee;
  }

const createOrder = async (req: Request, res: Response) => {
    //payment choice is either paid by sender or paid by receiver
    //paymentChoice:["sender", "receiver"]
    const {sender, receiver, type, contents, instructionOnFailedDelivery, weight, paymentChoice} = req.body;
    //generate order code, and generate fee based on weight
    const orderCode = generateOrderCode();
    var fee = calculateDeliveryFee(weight.grossWeight);
    var receiverCharge = 0;
    if (paymentChoice == "receiver") {
        receiverCharge = fee;
        fee = 0;
    }
    const currentUsername = (req as CustomRequest).username;
    var currentUser = await USERS.findOne({username: currentUsername});
    if (currentUser){
        const order = await ORDERS.create({
            senderInfo: sender,
            receiverInfo: receiver,
            orderCode: orderCode,
            type: type,
            contents: contents,
            instructionOnFailedDelivery: instructionOnFailedDelivery,
            timestamp: new Date(),
            fee: fee,
            weight: weight,
            receiverCharge: receiverCharge,
            teller: currentUser._id,
            status: "Chờ lấy hàng"
        }).then(() => {
                    console.log("Orders created");
                    res.status(200).send("order_created")
                }
            )
    }
}

//may be split into smaller functions
const updateOrder = async (req: Request, res: Response) => {

}

const updateOrderStatus = async (req: Request, res: Response) => {

}

//get all orders
const getOrder = async (req: Request, res: Response) => {

}

//get orders by the name of a gathering point or a delivery point
const getOrderByLocationName = async (req: Request, res: Response) => {

}

const getOrderByOrderCode = async (req: Request, res: Response) => {

}

//may need get function for sent and received orders

export {createOrder, updateOrder, updateOrderStatus, getOrder, getOrderByLocationName, getOrderByOrderCode}
