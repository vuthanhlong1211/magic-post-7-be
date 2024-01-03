import { CustomRequest } from "../middlewares/auth";
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
    const orderCode = req.body.order;
    var end = req.body.end;
    const startLocation = (req as CustomRequest).location;
    const startLocationType = (req as CustomRequest).locationType;
    var start: string = "";
    start += startLocation
    try {
        if (startLocationType == "Điểm giao dịch") {
            const deliveryPoint = await DELIVERYPOINTS.findOne({ name: startLocation }).select("gatheringPoint");
            const gatheringPoint = await GATHERINGPOINTS.findById(deliveryPoint?.gatheringPoint);
            end = "gathering " + gatheringPoint?.name;
        }
        
        const order = await ORDERS.findOne({ orderCode: orderCode });
        if (order) {
            const transitionOrder = await TRANSITIONORDERS.create({
                start: start,
                end: end,
                order: order._id,
                status: TransitionStatus.Pending,
                timestamp: new Date()
            })
            const { startPoint, endPoint } = await moveOrder(order.orderCode, start, end);
            if (startPoint) {
                startPoint.transitionOrders.push(transitionOrder._id);
                startPoint.save();
            }
            if (typeof (endPoint) != "string" && endPoint) {
                endPoint.transitionOrders.push(transitionOrder._id);
                endPoint.save()
            }
            return res.status(201).send("transition_order_created")
        }
    } catch (err) {
        return res.status(400).send(getErrorMessage(err));
    }
}

export const createTransitionOrderService = async (orderCode: string, end: string, startLocation: string, startLocationType: string) => {
    // const orderCode = req.body.orderCode;
    // const end = req.body.end;
    // const startLocation = (req as CustomRequest).location;
    // const startLocationType = (req as CustomRequest).locationType;
    var start: string = "";
    if (startLocationType === "Điểm tập kết") {
        start += "gathering ";
        start += startLocation
    } else if (startLocationType === "Điểm giao dịch") {
        start += "delivery ";
        start += startLocation
    } else if (startLocationType === "Khách hàng") {
        start = startLocation
    }

    try {
        const order = await ORDERS.findOne({ orderCode: orderCode });
        if (order) {
            let transitionOrder
            if (start === "customer") {
                transitionOrder = await TRANSITIONORDERS.create({
                    start: start,
                    end: end,
                    order: order._id,
                    status: TransitionStatus.Confirmed,
                    timestamp: new Date()
                })
            } else {
                transitionOrder = await TRANSITIONORDERS.create({
                    start: start,
                    end: end,
                    order: order._id,
                    status: TransitionStatus.Pending,
                    timestamp: new Date()
                })
            }

            const { startPoint, endPoint } = await moveOrder(order.orderCode, start, end);
            if (startPoint) {
                startPoint.transitionOrders.push(transitionOrder._id);
                startPoint.save();
            }
            if (typeof (endPoint) != "string" && endPoint) {
                endPoint.transitionOrders.push(transitionOrder._id);
                endPoint.save()
            }
            return;
        }
    } catch (err) {
        console.log(getErrorMessage(err));
        return;
    }
}

const confirmTransitionOrder = async (req: Request, res: Response) => {
    try {
        const orderCode = req.params.orderCode;
        const locationName = (req as CustomRequest).location;
        const locationType = (req as CustomRequest).locationType;
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

export const getPendingTransitionOrdersAtCurEndLocation = async (req: Request, res: Response) => {
    var location = (req as CustomRequest).location;
    const locationType = (req as CustomRequest).locationType;
    if (locationType == "Điểm giao dịch") location = "delivery " + location;
    else if (locationType == "Điểm tập kết") location = "gathering " + location
    try {
        const pendingTransitionOrders = await TRANSITIONORDERS.find({end: location, status: TransitionStatus.Pending});
        return res.status(200).json(pendingTransitionOrders)
    } catch (err){
        return res.status(400).send("get_pending_orders_failed");
    }
    
}

//push the id of the moved order into the orders field
//of the end point
const getStartAndEndPoint = async (orderCode: string, start: string, end: string) => {
    let startPoint;
    if (start.slice(0, 8) === "delivery") {
        startPoint = await DELIVERYPOINTS.findOne({ name: start.slice(9) }).select('orders');
    } else if (start.slice(0, 9) === "gathering") {
        startPoint = await GATHERINGPOINTS.findOne({ name: start.slice(10) }).select('orders');
    } else {
        startPoint = undefined;
    }

    let endPoint;
    if (end.slice(0, 8) === "delivery") {
        endPoint = await DELIVERYPOINTS.findOne({ name: end.slice(4) }).select('orders');
    } else if (end.slice(0, 9) === "gathering") {
        endPoint = await GATHERINGPOINTS.findOne({ name: end.slice(4) }).select('orders');
    } else { // to customer
        updateOrderStatus(orderCode, OrderStatus.Delivering);
        endPoint = undefined;
    }

    return { startPoint, endPoint }
}

const moveOrder = async (orderCode: string, start: string, end: string) => {
    try {
        await getStartAndEndPoint(orderCode, start, end).then(async ({ startPoint, endPoint }) => {
            if (endPoint && startPoint) { //between points
                const order = await ORDERS.findOne({ orderCode: orderCode }).select('_id');
                if (order) {
                    const orderID = order._id;
                    const index = startPoint.orders.indexOf(orderID, 0);
                    if (index == -1) {
                        throw new Error("order_not_exist_at_start")
                    } else {
                        startPoint.orders.splice(index, 1);
                        startPoint.save()
                        endPoint.orders.push(orderID);
                        endPoint.save();
                    }
                } else throw new Error("order_find_failed")
            } else if (startPoint == undefined && endPoint) { //from customer to a point
                const order = await ORDERS.findOne({ orderCode: orderCode }).select('_id');
                if (order) {
                    const orderID = order._id;
                    endPoint.orders.push(orderID);
                    endPoint.save();
                } else throw new Error("order_find_failed")
            } else if (endPoint == undefined && startPoint) { //from a point to customer
                const order = await ORDERS.findOne({ orderCode: orderCode }).select('_id');
                if (order) {
                    const orderID = order._id;
                    const index = startPoint.orders.indexOf(orderID, 0);
                    if (index == -1) {
                        throw new Error("order_not_exist_at_start")
                    } else {
                        startPoint.orders.splice(index, 1);
                        startPoint.save()
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