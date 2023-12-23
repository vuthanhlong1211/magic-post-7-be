import GATHERINGPOINTS from '../models/gatheringPoints';
import { Request, Response } from 'express';

const createGatheringPoint = async (req: Request, res: Response) => {
    try{
        const {name, location} = req.body;

        await GATHERINGPOINTS.create({
            name: name,
            location: location
        })

        return res.json({message: "gatheringpoint_created"})
    } catch (err){
        console.log(err);
        return res.json({message: err})
    }
}

//get all gathering points in a list
const getGatheringPoints = async (req: Request, res: Response) => {
    return await GATHERINGPOINTS.find();
}

const getGatheringPointByName = async (req: Request, res: Response) => {
    const name = req.body;
    return await GATHERINGPOINTS.findOne({name: name});
}

export {createGatheringPoint, getGatheringPoints, getGatheringPointByName};