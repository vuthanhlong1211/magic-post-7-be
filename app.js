const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const express=require('express');

class room {
  constructor(id, password) {
    this.id = id;
    this.password = password;
    this.active = true;
  }
}

class user {
  constructor(id, username) {
    this.id = id;
    this.username = username;
    this.own = new Array();
    this.rooms = new Array();
  }

  create_room(id, password) {
    const room = new room(id, password);
    this.own.push(id);
    this.rooms.push(id);
    return room;
  }

  join(id, list_of_room) {
    let room = list_of_room.find(room => room.id == id);
    if (room != undefined) {
      this.rooms.push(room.id);
      return room;
    }
    alert("Room not exists");
    return undefined;
  }

}

user_list = new Array();
room_list = new Array();

// Khởi tạo server
app.get('/', function(req, res){
  app.use(express.static(path.join(__dirname)));
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Đăng ký các sự kiện của socket
io.on('connection', function(socket) {
  socket.on('newuser', function(username) {
    user_list.push({uid: socket.id, username: username})
    console.log(username + ' - ' + socket.id + ' connected');
  });
  socket.on('exituser', function(username) {
    socket.broadcast.emit('update', username + 'has left the room');
  });
  socket.on('joinroom', function(username, roomid) {
    console.log(username + ' has joined room ' + roomid);
    socket.join(roomid);
    socket.to(roomid).emit('update', username + ' has joined the room');
  });
  socket.on('createroom', function(id, name) {
    console.log('room ' + name + ' (' + id + ') created');
    room_list.push({id: id, name: name});
    socket.broadcast.emit('addroom', id, name);
  })
  socket.on('getroomlist', function() {
    socket.emit('returnroomlist', room_list);
  })
  socket.on('chat', function(message, room_id) {
    // socket.broadcast.emit('chat', message);
    socket.to(room_id).emit('chat', message);
  });
  socket.on('disconnect', function() {
    if (user.length != 0) {
      user = user_list.find(user => user.uid == socket.id);
      console.log(user.username + ' - ' + user.uid + ' has disconnected');
      socket.broadcast.emit('update', user.username + ' has left the room');
    }
  })
});

// Mở cổng lắng nghe của socket là 3000
http.listen(3000, function(){
  console.log('listening on *:3000');
});
