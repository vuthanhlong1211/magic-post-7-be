const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//User accounts are for staff only,
//as customers only have access to order searching
const userSchema = new Schema({
    //auto-generate username
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name:{
        type: String,
        required: true
    },
    position:{
        type: String,
        required: true, 
        enum: ["Lãnh đạo", 
        "Trưởng điểm tập kết",
        "Trưởng điểm giao dịch",
        "Nhân viên điểm tập kết",
        "Giao dịch viên"]
    },
});
const USERS = mongoose.model('User', userSchema);
module.exports = USERS;