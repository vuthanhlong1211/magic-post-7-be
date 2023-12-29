import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const transitionOrderSchema = new Schema({
    start: {
        type: String,
        required: true
    },
    end: {
        type: String,
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Order'
    },
    status: {
        type: String,
        required: true,
        enum: ["Đang chuyển", "Đã đến"]
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now()
    }
});
const TRANSITIONORDERS = mongoose.model('Transition Order', transitionOrderSchema);
export default TRANSITIONORDERS;