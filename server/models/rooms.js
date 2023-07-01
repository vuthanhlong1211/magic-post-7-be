const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    password: {
        type: String,
    },
    members: [mongoose.Types.ObjectId],
    messages: [
        {
            _id: {
                type: mongoose.Types.ObjectId,
                default: new mongoose.Types.ObjectId(),
            },
            sender: {
                type: String,
                require: true,
            },
            content: {
                type: String,
                require: true,
            },
            timestamp: {
                type: Date,
                default: Date.now()
            }
        }
    ]
    
});
const ROOMS = mongoose.model('Room', roomSchema);
module.exports = ROOMS;