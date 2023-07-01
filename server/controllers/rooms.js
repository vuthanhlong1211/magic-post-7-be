const ROOMS = require('../models/rooms');
const {hashPassword} = require('../utils/utils');

const createRoom = async (name, password) => {
    const room = await ROOMS.findOne({name});
    if (room) {
        return undefined;
    }

    let hashedPassword;
    
    if (password.length != 0) {
        hashedPassword = await hashPassword(password);
    } else {
        hashedPassword = password;
    }

    const new_room = await ROOMS.create({name: name, password: hashedPassword});
    const new_room_id = new_room._id;
    console.log('Room ' + name + ' (' + new_room_id + ') created');
    return new_room_id;
};

const createMessage = async (message, roomid) => {
    const room = await ROOMS.findById(roomid);
    const {username, text} = message;
    const newMessage = {
        sender: username,
        content: text
    };
    room.messages.push(newMessage);
    room.save();
    return;
};

const joinRoom = async (username, roomid, password) => {
    const room = await ROOMS.findById(roomid);
    const room_password = room.password;
    const permission = (room_password == "" || password === room_password);
    return permission;
};

const getRoomList = async (req, res) => {
    const username = req.session.username;
    roomlist = [];
    const rooms = await ROOMS.find({});
    rooms.forEach((room) => {
        roomlist.push({id: room._id, name: room.name});
    });
    res.json({success: true, username: username, rooms: roomlist});
};

const getMessages = async (roomid) => {
    const room = await ROOMS.findById(roomid);
    const messages = room.messages.map(({sender, content, timestamp}) => ({sender, content, timestamp}));
    console.log(messages);
    return messages;
};

module.exports = {createRoom, createMessage, joinRoom, getRoomList, getMessages};