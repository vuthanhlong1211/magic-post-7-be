const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gatheringPointSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true
    },
    manager:{
        type: mongoose.Schema.Types.ObjectId, ref:"User",
        default: null
    },
    staffs:{
        type:[mongoose.Schema.Types.ObjectId], ref:"User",
    },
    orders:{
        type:[mongoose.Schema.Types.ObjectId], ref:"Order",
    }
});
const GATHERINGPOINTS = mongoose.model('Gathering Point', gatheringPointSchema);
module.exports = GATHERINGPOINTS;