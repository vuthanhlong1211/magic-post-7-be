import DELIVERYPOINTS from '../models/deliveryPoints';
import GATHERINGPOINTS from '../models/gatheringPoints';
import { CustomRequest } from '../middlewares/auth';
import { Request, Response } from 'express';

const createDeliveryPoint = async (req: Request, res: Response) => {
    const {name, location, gatheringPoint} = req.body;
    //dleiPoint is gatheringPoint.name
    try {
        GATHERINGPOINTS.findOne({name: gatheringPoint}).select('_id').then(async (_id) => {
            await DELIVERYPOINTS.create({
                name: name,
                location: location,
                gatheringPoint: _id
            }).then(() => {
                return res.json({message: "deliveryPoint_created"})
            })
        })
    } catch (err) {
        return res.json({message: "Error:" + err})
    }
    
}

//get all delivery points
const getDeliveryPoints = async (req: Request, res: Response) => {
    const deliveryPoints = await DELIVERYPOINTS.find()
    return res.status(200).json(deliveryPoints);
}

export const getDeliveryPointsFromGatheringPoints = async (req: Request, res: Response) => {
    const gatheringPointName = (req as CustomRequest).location;
    const gatheringPoint = await GATHERINGPOINTS.findOne({name: gatheringPointName}).select("_id");

    const deliveryPoints = await DELIVERYPOINTS.find({gatheringPoint: gatheringPoint?._id}).select("name");
    return res.status(200).json(deliveryPoints);
}

const getDeliveryPointsName = async (req: Request, res: Response) => {
    const deliveryPoints = (await DELIVERYPOINTS.find().select('name -_id')).map(point => point.name)
    return res.status(200).json(deliveryPoints);
}

const getDeliveryPointByName = async (req: Request, res: Response) => {
    const name = req.params.name;
    const deliveryPoint =  await DELIVERYPOINTS.findOne({name: name})
    return res.status(200).json(deliveryPoint);
}

export { getDeliveryPoints, getDeliveryPointByName, getDeliveryPointsName};