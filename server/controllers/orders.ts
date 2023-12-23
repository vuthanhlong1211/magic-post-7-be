import ORDERS from "../models/orders"
import { Request, Response } from "express"

const createOrder = async (req: Request, res: Response) => {

}

//
// const deleteOrderByCode = async (req, res) => {
//     const {orderCode} = req.body;
// }

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
