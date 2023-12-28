import { Request, Response } from "express";
import GATHERINGPOINTS from "../models/gatheringPoints";
import DELIVERYPOINTS from "../models/deliveryPoints";

export const createPoint = async (req: Request, res: Response) => {
    const [name, location, gatheringPointName] = req.body;
  try{
    if (gatheringPointName === undefined) {
            await GATHERINGPOINTS.create({
                name: name,
                location: location
            })
            return res.sendStatus(200);
    } else {
        GATHERINGPOINTS.findOne({name: gatheringPointName}).select('_id').then(async (_id) => {
            DELIVERYPOINTS.create({
                name: name,
                location: location,
                gatheringPoint: _id
            }).then(() => {
                return res.sendStatus(200)
            })
        })
    }} catch (err){
            console.log(err);
            return res.sendStatus(400)
        }
}