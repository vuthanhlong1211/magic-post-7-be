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
    const gatheringPoints = await GATHERINGPOINTS.find()
    return res.status(200).json(gatheringPoints);
}

const getGatheringPointsName = async (req: Request, res: Response) => {
    const gatheringPoints = (await GATHERINGPOINTS.find().select('name -_id')).map(point => point.name)
    return res.status(200).json(gatheringPoints);
}

const getGatheringPointByName = async (req: Request, res: Response) => {
    const name = req.params.name;
    const gatheringPoint =  await GATHERINGPOINTS.findOne({name: name})
    return res.status(200).json(gatheringPoint);
}

export { getGatheringPoints, getGatheringPointByName, getGatheringPointsName};