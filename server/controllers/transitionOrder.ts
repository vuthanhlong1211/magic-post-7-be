import DELIVERYPOINTS from "../models/deliveryPoints";
import GATHERINGPOINTS from "../models/gatheringPoints";
import ORDERS from "../models/orders";
import TRANSITIONORDERS from "../models/transitionOrder";
import { OrderStatus, TransitionStatus, getErrorMessage } from "../utils/utils";
import { updateOrderStatus } from "./orders";
import { getPointFromName } from "./points";
import { Request, Response } from "express";

//start and end are the names of destination, 
//with format "ĐGD/ĐTK" + name 
//if the end is "Customer", meaning a customer
//, update order status to "Đang giao hàng"
const createTransitionOrder = async (req: Request, res: Response) => {
    const orderCode = req.body.orderCode;
    const start = req.body.start;
    const end = req.body.end;
    try {
        const order = await ORDERS.findOne({ orderCode: orderCode });
        if (order) {
            const transitionOrder = await TRANSITIONORDERS.create({
                start: start,
                end: end,
                order: order._id,
                status: TransitionStatus.Pending,
                timestamp: new Date()
            })
            const {startPoint , endPoint} = await moveOrder(order.orderCode, start, end);
            if (startPoint) startPoint.transitionOrders.push(transitionOrder._id);
            return res.status(201).send("transition_order_created")
        }
    } catch (err) {
        return res.status(400).send(getErrorMessage(err));
    }

}

const confirmTransitionOrder = async (req: Request, res: Response) => {
    try {
        const orderCode = req.params.orderCode;
        const locationName = req.body.locationName;
        const locationType = req.body.locationType;
        const order = await ORDERS.findOne({ orderCode: orderCode });
        if (order) {
            const orderID = order._id
            const curLocation = await getPointFromName(locationName, locationType);
            if (curLocation) {
                const index = curLocation.orders.indexOf(orderID, 0);
                if (index == -1) {
                    throw new Error("order_not_found_at_location")
                } else {
                    await updateOrderStatus(orderCode, OrderStatus.Transporting);
                    const lastTransitionOrder = await TRANSITIONORDERS.findOne({ order: order._id }, {}, { sort: { 'timestamp': -1 } })
                    if (lastTransitionOrder) {
                        lastTransitionOrder.status = TransitionStatus.Confirmed;
                        const date = new Date();
                        const message = date.toString().substring(0, 23) + " Đơn hàng chuyển từ " + lastTransitionOrder.start + " tới " + lastTransitionOrder.end;
                        console.log(message);
                        order.logs.push(message);
                        order.save();
                        lastTransitionOrder.save();
                        res.status(200).send("transition_order_confirmed")
                    } else throw new Error("transition_order_find_failed")
                }
            }
        } else throw new Error("order_find_failed")
    } catch (err) {
        res.status(400).send(err)
    }

}

//push the id of the moved order into the orders field
//of the end point
const getStartAndEndPoint = async (orderCode: string, start: string, end: string) => {
    let startPoint;
    if (start.slice(0, 3) === "ĐGD") {
        startPoint = await DELIVERYPOINTS.findOne({ name: start.slice(4) }).select('orders');
    } else {
        startPoint = await GATHERINGPOINTS.findOne({ name: start.slice(4) }).select('orders');
    }

    let endPoint;
    if (end.slice(0, 3) === "ĐGD") {
        endPoint = await DELIVERYPOINTS.findOne({ name: end.slice(4) }).select('orders');
    } else if (end.slice(0, 3) === "ĐTK") {
        endPoint = await GATHERINGPOINTS.findOne({ name: end.slice(4) }).select('orders');
    } else if (end === "Khách hàng") { // to customer
        updateOrderStatus(orderCode, OrderStatus.Delivering);
    }

    return { startPoint, endPoint }
}

const moveOrder = async (orderCode: string, start: string, end: string) => {
    try {
        await getStartAndEndPoint(orderCode, start, end).then(async ({ startPoint, endPoint }) => {
            console.log(startPoint)
            console.log(endPoint)
            if (endPoint && startPoint) { //between points
                const order = await ORDERS.findOne({ orderCode: orderCode }).select('_id');
                if (order) {
                    const orderID = order._id
                    const index = startPoint.orders.indexOf(orderID, 0);
                    console.log(index)
                    if (index == -1) {
                        throw new Error("order_not_exist_at_start")
                    } else {
                        startPoint.orders.splice(index, 1);
                        startPoint.save()
                        console.log(orderID);
                        endPoint.orders.push(orderID);
                        endPoint.save();
                        console.log(endPoint.orders)
                        
                    }
                } else throw new Error("order_find_failed")
            }
        })
    } catch (err) {
        console.log(err)
    }
    return getStartAndEndPoint(orderCode, start, end)
}

export { createTransitionOrder, confirmTransitionOrder }