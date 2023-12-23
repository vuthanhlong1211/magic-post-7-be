import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const deliveryPointSchema = new Schema({
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
    gatheringPoint:{
        type:mongoose.Schema.Types.ObjectId, ref:'Gathering Point',
        required: true
    },
    orders:{
        type:[mongoose.Schema.Types.ObjectId], ref:"Order",
    }
});
const DELIVERYPOINTS = mongoose.model('Delivery Point', deliveryPointSchema);
export default DELIVERYPOINTS;