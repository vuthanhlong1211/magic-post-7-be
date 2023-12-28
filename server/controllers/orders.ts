import { CustomRequest } from "../middlewares/auth";
import GATHERINGPOINTS from "../models/gatheringPoints";
import DELIVERYPOINTS from "../models/deliveryPoints";
import ORDERS from "../models/orders"
import USERS from "../models/users"
import { Request, Response } from "express"
import { Types } from "mongoose";

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
    if (grossWeight <= threshold) {
        deliveryFee = baseDeliveryFee;
    } else {
        deliveryFee = baseDeliveryFee + Math.ceil((grossWeight - threshold) / 0.5) * ratePerHalfKilogram;;
    }

    return deliveryFee;
}

const createOrder = async (req: Request, res: Response) => {
    //payment choice is either paid by sender or paid by receiver
    //paymentChoice:["sender", "receiver"]
    const sender = req.body.senderInfo;
    const receiver = req.body.receiverInfo;
    const type = req.body.type;
    const contents = req.body.contents;
    const instructionOnFailedDelivery = req.body.instructionOnFailedDelivery;
    const weight = req.body.weight;
    const paymentChoice = req.body.paymentChoice;
    const deliveryPointName = req.body.deliveryPointName;
    // console.log(sender);
    // console.log(receiver);
    //generate order code, and generate fee based on weight
    const orderCode = generateOrderCode();
    var fee = calculateDeliveryFee(weight.grossWeight);
    var receiverCharge = 0;
    if (paymentChoice == "receiver") {
        receiverCharge = fee;
        fee = 0;
    }
    const currentUsername = (req as CustomRequest).username;
    try {
        var currentUser = await USERS.findOne({ username: currentUsername });
        if (currentUser) {
            const order = await ORDERS.create({
                senderInfo: {
                    senderName: sender.senderName,
                    senderAddress: sender.senderAddress,
                    senderPhoneNumber: sender.senderPhoneNumber,
                    senderCode: sender.senderCode,
                    senderPostalCode: sender.senderPostalCode
                },
                receiverInfo: {
                    receiverName: receiver.receiverName,
                    receiverAddress: receiver.receiverAddress,
                    receiverPhoneNumber: receiver.receiverPhoneNumber,
                    receiverPostalCode: receiver.receiverPostalCode
                },
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
            });
            if (!order) {
                throw new Error("create_order_failed");
            }
            let orderID = order._id;
            assignOrder(order._id, deliveryPointName).then(() => {
                console.log("Order created")
                res.status(200).send("order_created");
            })
        }
    } catch (err) {
        console.log(err);
    }

}

const assignOrder = async (orderID: Types.ObjectId, deliveryPointName: string) => {
    try {
        const deliveryPoint = await DELIVERYPOINTS.findOne({ name: deliveryPointName });
        if (deliveryPoint) {
            deliveryPoint.orders.push(orderID);
            deliveryPoint.save()
        }
    } catch (err) {
        console.log(err);
    }
}

//may be split into smaller functions
const updateOrder = async (req: Request, res: Response) => {

}

const updateOrderStatus = async (req: Request, res: Response) => {

}

//get all orders
const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await ORDERS.find().select('status');
        if (orders) res.status(200).send(orders);
    } catch (err) {
        console.log(err);
    }
}

//get orders by the name of a gathering point or a delivery point
const getOrderByLocationName = async (req: Request, res: Response) => {
    const name = req.body.name;
    const locationType = req.body.locationType;
    const orderIDs: Types.ObjectId[] = []
    var orders = [];
    try {
        if (locationType == "Điểm tập kết") {
            const currentLocation = await GATHERINGPOINTS.findOne({ name: name });
            if (currentLocation) {
                for (var id of currentLocation.orders) {
                    orderIDs.push(id);
                }
            }
        } else if (locationType == "Điểm giao dịch") {
            const currentLocation = await DELIVERYPOINTS.findOne({ name: name });
            if (currentLocation) {
                for (var id of currentLocation.orders) {
                    orderIDs.push(id);
                }
            }
        } else throw Error("location_type_missing")
    } catch (err) {
        console.log(err);
        res.status(400).send("Missing location type")
    }

    for (var id of orderIDs) {
        orders.push(await ORDERS.findById(id).select("status"))
    }

    res.status(200).send(orders)
}

const getOrderByOrderCode = async (req: Request, res: Response) => {
    const orderCode = req.body.orderCode;
    try {
        const order = await ORDERS.findOne({orderCode: orderCode}).select('status');
        if (order) return order;
    } catch (err) {
        console.log(err);
    }
}

//may need get function for sent and received orders

export { createOrder, updateOrder, updateOrderStatus, getOrders, getOrderByLocationName, getOrderByOrderCode }
