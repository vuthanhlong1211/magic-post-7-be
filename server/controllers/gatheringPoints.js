const GATHERINGPOINTS = require('../models/gatheringPoints')

const createGatheringPoint = async (req, res) => {
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

const getGatheringPoint = async (req, res) => {

}

module.exports = {createGatheringPoint};