const {createRoom, createMessage, joinRoom, getMessages} = require('./rooms');
/**
 * {
 *  username: roomid
 * }
 */
online_users = {};

/**
 * map username to socket.id
 */
users = {};

module.exports = (io) => {   
    io.on('connection', (socket) => {
        console.log('connection established! Welcome ' + socket.id);

        /**
         * Nhận thông tin khai báo của user
         */
        socket.on('get_user_info', (username) => {
            users[socket.id] = username;
            console.log('User: ' + username + ' bind to ' + socket.id);
        });

        /**
         * Nhận yêu cầu gửi lịch sử chat với id phòng, trả về toàn bộ lịch sử chat {sender, content, timestamp}. sender ở đây là username
         */
        socket.on('get_messages_history', async (roomid) => {
            await getMessages(roomid).then((messages) => {
                console.log(messages);
                socket.emit('return_messages_history', messages);
            });
        });

        /**
         * Nhận tín hiệu thoát khỏi phòng, xoá khỏi online_users và thông báo với cả phòng
         */
        socket.on('exituser', (username, roomid) => {
            delete online_users[username];
            socket.leave(roomid);
            socket.to(roomid).emit('update', username + 'has left the room');
        });

        /**
         * Nhận tín hiệu vô phòng, tên người dùng, id phòng và mật khẩu phòng
         * Kiểm tra mật khẩu và gửi lại tin ack true hoặc false
         */
        socket.on('ask_permission_to_join', async (username, roomid, password) => {
            await joinRoom(username, roomid, password).then((permission) => {
                socket.emit('return_permission', permission);
            });
        });

        /**
         * Nhận tín hiệu tham gia phòng, tên người dùng và id phòng
         * bind socket vô id phòng đăng ký username với id phòng và gửi tin update dưới dạng string về cho tất cả users trong phòng
         */
        socket.on('joining_room', (username, roomid) => {
            console.log(username + ' has joined room ' + roomid);
            online_users[username] = roomid;
            socket.join(roomid);
            socket.to(roomid).emit('update', username + ' has joined the room');
        });

        /**
         * Nhận tín hiệu khởi tạo phòng mới với tên phòng và mật khẩu
         * Lưu tên phòng và mật khẩu và database và khởi tạo id riêng
         * Trả về tín hiệu ack với id phòng mới và tên phòng
         */
        socket.on('req_new_room', async (name, password) => {
            await createRoom(name, password).then((id) => {
                if (!id) {
                    return;
                };
                io.emit('addroom', id, name);
            });
        });

        /**
         * Nhận tín hiệu 'chat' với data gồm message = {username, text}, roomid
         * Tạo message và add vào message vào room rồi trả về 'chat' với message = {username, text}
         */
        socket.on('chat', async (message, roomid) => {
            console.log(message);
            await createMessage(message, roomid).then(() => {
                socket.to(roomid).emit('chat', message);
            });
        });

        /**
         * Nếu phát hiện disconnect, xoá username khỏi online_users và users và thông báo với cả phòng
         */
        socket.on('disconnect', () => {
            const username = users[socket.id];
            const roomid = online_users[username];
            if (username && roomid) {
                delete online_users[username];
                delete users[socket.id];
                console.log(username + ' with socketid: ' + socket.id + ' has left the room');
                socket.to(roomid).emit('update', username + ' has left the room');
            }
        });
    });
}

