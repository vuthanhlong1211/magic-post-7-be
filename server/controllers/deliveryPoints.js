const DELIVERYPOINTS = require('../models/deliveryPoints')
const GATHERINGPOINTS = require('../models/gatheringPoints')

const createDeliveryPoint = async (req, res) => {
    const {name, location, gatheringPoint} = req.body;
    //gatheringPoint is gatheringPoint.name

    const currentGatheringPoint = await GATHERINGPOINTS.findOne({name: gatheringPoint})
    try {
        await DELIVERYPOINTS.create({
            name: name,
            location: location,
            gatheringPoint: currentGatheringPoint._id
        }).then(() => {
            return res.json({message: "deliveryPoint_created"})
        })
    } catch (err) {
        return res.json({message: "Error:" + err})
    }
    
}

module.exports = {createDeliveryPoint};