const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//transition orders to move customers' orders between two locations

const transitionOrderSchema = new Schema({
//start and end are the names of the sending and receiving location
    start:{
        type: String,
        required: true
    },
    end: {
        type: String,
        required: true
    },
    orders:{
        type:mongoose.Schema.Types.ObjectId, ref:"Order",
        required: true
    }
});
const GATHERINGPOINTS = mongoose.model('Gathering Point', transitionOrderSchema);
module.exports = GATHERINGPOINTS;