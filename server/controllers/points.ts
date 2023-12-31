import { Request, Response } from "express";
import GATHERINGPOINTS from "../models/gatheringPoints";
import DELIVERYPOINTS from "../models/deliveryPoints";

export const createPoint = async (req: Request, res: Response) => {
    const { name, location, gatheringPoint } = req.body;
    try {
        if (gatheringPoint === undefined) {
            await GATHERINGPOINTS.create({
                name: name,
                location: location
            })
            return res.status(201).send("gathering_point_created");
        } else {
            try {
                GATHERINGPOINTS.findOne({ name: gatheringPoint }).select('_id').then(async (_id) => {
                    DELIVERYPOINTS.create({
                        name: name,
                        location: location,
                        gatheringPoint: _id
                    }).then(() => {
                        return res.status(201).send("delivery_point_created")
                    })
                })
            } catch (err) {
                res.sendStatus(400);
            }
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
}

export const getPointFromName = async (locationName: string, locationType: string) => {
    let curLocation = null;
    if (locationType = "Điểm giao dịch") {
        curLocation = DELIVERYPOINTS.findOne({ name: locationName });
    } else if (locationType = "Điểm tập kết") {
        curLocation = GATHERINGPOINTS.findOne({ name: locationName });
    } else throw new Error("invalid_location_type")

    if (curLocation) return curLocation;
    else throw new Error("location_find_failed")
}