const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    members: [Schema.Types.ObjectId],
    messages: [
        {
            _id: Schema.Types.ObjectId,
            sender: Schema.Types.ObjectId,
            content: String,
            timestamp: Date
        }
    ]
});
const ROOMS = mongoose.model('Room', roomSchema);
module.exports = ROOMS;