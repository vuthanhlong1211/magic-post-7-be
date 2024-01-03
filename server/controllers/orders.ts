import { CustomRequest } from "../middlewares/auth";
import GATHERINGPOINTS from "../models/gatheringPoints";
import DELIVERYPOINTS from "../models/deliveryPoints";
import ORDERS from "../models/orders"
import USERS from "../models/users"
import { Request, Response } from "express"
import { Types } from "mongoose";
import { OrderStatus, TransitionStatus, getErrorMessage, removeDuplicates } from "../utils/utils";
import { getPointFromName } from "./points";
import TRANSITIONORDERS from "../models/transitionOrder";
import { createTransitionOrderService } from "./transitionOrder";

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
    const sender = req.body.sender;
    const receiver = req.body.receiver;
    const type = req.body.type;
    const contents = req.body.contents;
    const instructionOnFailedDelivery = req.body.instructionOnFailedDelivery;
    const weight = req.body.weight;
    const paymentChoice = req.body.paymentChoice;
    const deliveryPointName = (req as CustomRequest).location;
    // console.log(sender);
    // console.log(receiver);
    //generate order code, and generate fee based on weight
    const orderCode = generateOrderCode();
    var fee = calculateDeliveryFee(weight);
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
                sender: {
                    name: sender.name,
                    address: sender.address,
                    phoneNumber: sender.phoneNumber,
                    code: sender.code,
                    postalCode: sender.postalCode
                },
                receiver: {
                    name: receiver.name,
                    address: receiver.address,
                    phoneNumber: receiver.phoneNumber,
                    code: receiver.code,
                    postalCode: receiver.postalCode
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
                status: OrderStatus.Pending
            });
            if (!order) {
                throw new Error("create_order_failed");
            }
            let orderID = order._id;
            assignOrder(order._id, deliveryPointName).then(() => {
                const message = order.timestamp.toString().substring(0, 23) + " Đơn hàng nhận tại điểm giao dịch " + deliveryPointName;
                order.logs.push(message);
                order.save();
                createTransitionOrderService(order.orderCode, "delivery " + deliveryPointName, "customer", "Khách hàng")
                res.status(201).json(order.orderCode);
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
// const updateOrderStatus = async (req: Request, res: Response)
//get all orders
const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await ORDERS.find().select("orderCode status sender receiver logs");
        if (orders) res.status(200).json(orders);
    } catch (err) {
        return res.status(400).send(getErrorMessage(err));
    }
}

//get orders by the name of a gathering point or a delivery point
const getOrdersAtCurLocation = async (req: Request, res: Response) => {
    const name = (req as CustomRequest).location;
    const locationType = (req as CustomRequest).locationType;
    const orderIDs: Types.ObjectId[] = []
    var orders = [];
    try {
        const curLocation = await getPointFromName(name, locationType);
        if (curLocation) {
            for (var id of curLocation.orders) {
                orderIDs.push(id);
            }
            for (var id of orderIDs) {
                orders.push(await ORDERS.findById(id).select("orderCode status sender receiver logs"))
            }

            res.status(200).json(orders)
        } else throw Error("location_type_missing")
    } catch (err) {
        console.log(err);
        res.status(400).send("Missing location type")
    }
}

const getSentOrdersByLocationName = async (req: Request, res: Response) => {
    var name = req.body.name;
    const locationType = req.body.locationType;
    console.log(name);
    console.log(locationType);
    const orderIDs: Types.ObjectId[] = []
    var sentOrders = [];
    try {
        const curLocation = await getPointFromName(name, locationType);
        if (locationType == "Điểm giao dịch") name = "delivery " + name;
        else if (locationType == "Điểm tập kết") name = "gathering " + name;
        if (curLocation) {
            const transitionOrders = await TRANSITIONORDERS.find({ start: name })
            console.log(transitionOrders);
            for (var transitionOrder of transitionOrders) {
                const order = await ORDERS.findById(transitionOrder.order).select("orderCode status sender receiver logs");
                if (order) sentOrders.push(order);
                else throw new Error("order_find_failed");
            } res.status(200).json(sentOrders)
        } else throw Error("location_type_missing")
    } catch (err) {
        console.log(err);
        res.status(400).send("Missing location type")
    }
}



export const updateOrderStatus = async (orderCode: string, status: OrderStatus) => {
    try {
        const order = await ORDERS.findOne({ orderCode: orderCode });
        if (order) {
            order.status = status;
            order.save();
        } else throw new Error("order_find_failed")
    } catch (err) {
        console.log(err);
    }
}

const getReceivedOrdersByLocationName = async (req: Request, res: Response) => {
    var name = req.body.name;
    const locationType = req.body.locationType;
    const orderIDs: Types.ObjectId[] = []
    var receivedOrders = [];
    try {
        const curLocation = await getPointFromName(name, locationType);
        if (locationType == "Điểm giao dịch") name = "delivery " + name;
        else if (locationType == "Điểm tập kết") name = "gathering " + name;
        if (curLocation) {
            const transitionOrders = await TRANSITIONORDERS.find({ end: name })
            console.log(transitionOrders);
            for (var transitionOrder of transitionOrders) {
                const order = await ORDERS.findById(transitionOrder.order).select("orderCode status sender receiver logs");
                if (order) receivedOrders.push(order);
                else throw new Error("order_find_failed");
            }
            res.status(200).json(receivedOrders)
        } else throw Error("location_type_missing")
    } catch (err) {
        console.log(err);
        res.status(400).send("Missing location type")
    }
}

export const getSentOrdersAtCurLocation = async (req: Request, res: Response) => {
    var name = (req as CustomRequest).location;
    const locationType = (req as CustomRequest).locationType;
    console.log(locationType)
    const orderIDs: Types.ObjectId[] = [];
    var sentOrders = [];
    
    console.log(name);
    try {
        const curLocation = await getPointFromName(name, locationType);
        if (locationType == "Điểm giao dịch") name = "delivery " + name;
        else if (locationType == "Điểm tập kết") name = "gathering " + name;

        if (curLocation) {
            const transitionOrders = await TRANSITIONORDERS.find({ end: name })
            console.log(transitionOrders);
            for (var transitionOrder of transitionOrders) {
                const order = await ORDERS.findById(transitionOrder.order).select("orderCode status sender receiver logs");
                if (order) sentOrders.push(order);
                else throw new Error("order_find_failed");
            } res.status(200).json(sentOrders)
        } else throw Error("location_type_missing")
    } catch (err) {
        console.log(err);
        res.status(400).send("Missing location type")
    }
}

export const getReceivedOrdersAtCurLocation = async (req: Request, res: Response) => {
    var name = (req as CustomRequest).location;
    const locationType = (req as CustomRequest).locationType;
    const orderIDs: Types.ObjectId[] = []
    var receivedOrders = [];

    try {
        const curLocation = await getPointFromName(name, locationType);
        if (locationType == "Điểm giao dịch") name = "delivery " + name;
        else if (locationType == "Điểm tập kết") name = "gathering " + name;
        if (curLocation) {
            const transitionOrders = await TRANSITIONORDERS.find({ end: name })
            console.log(transitionOrders);
            for (var transitionOrder of transitionOrders) {
                const order = await ORDERS.findById(transitionOrder.order).select("orderCode status sender receiver logs");
                if (order) receivedOrders.push(order);
                else throw new Error("order_find_failed");
            }
            // for (var id of curLocation.orders) {
            //     orderIDs.push(id);
            // }

            // for (var id of orderIDs) {
            //     const order = await ORDERS.findById(id).select("orderCode status sender receiver logs")
            //     if (order) {
            //         const transitionOrders = await TRANSITIONORDERS.find({order: order._id})
            //         console.log(transitionOrders);
            //         for (var transitionOrder of transitionOrders) {
            //             if (transitionOrder.end.substring(transitionOrder.end.indexOf(' ') + 1) == curLocation.name) {
            //                 console.log("matched")
            //                 receivedOrders.push(order);;
            //                 break;
            //             }
            //         }
            //     }
            // }
            res.status(200).json(receivedOrders)
        } else throw Error("location_type_missing")
    } catch (err) {
        console.log(err);
        res.status(400).send("Missing location type")
    }
}

//used in api for customers
const getOrderByOrderCode = async (req: Request, res: Response) => {
    const orderCode = req.params.orderCode;
    try {
        const order = await ORDERS.findOne({ orderCode: orderCode }).select("status logs transitionOrders -_id");
        if (order) res.status(200).json(order);
        else throw new Error("Order not found")
    } catch (err) {
        res.status(400).send(err);
    }
}

export const getFullOrderByOrderCode = async (req: Request, res: Response) => {
    const orderCode = req.params.orderCode;
    try {
        const order = await ORDERS.findOne({ orderCode: orderCode }).select("-_id");
        if (order) res.status(200).json(order);
        else throw new Error("Order not found")
    } catch (err) {
        res.status(400).send(err);
    }
}
export {
    createOrder, getOrders,
    getOrdersAtCurLocation, getOrderByOrderCode,
    getSentOrdersByLocationName,
    getReceivedOrdersByLocationName
}
