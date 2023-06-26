console.log('start');
(function() {
  const app = document.querySelector('.app');
  const socket = io();

  let _username;
  let _roomid;

  let _room_list = new Array();

  app.querySelector('.join-screen #join-button').addEventListener('click', function() {
    let username = app.querySelector('.join-screen #username').value;

    if (username.length == 0) {
      alert("Cannot use blank username!");
      return;
    }

    socket.emit('newuser', username);
    _username = username;
    app.querySelector('.join-screen').classList.remove('active');
    app.querySelector('.room-select-screen').classList.add('active');
    socket.emit('getroomlist');
    socket.on('returnroomlist', function(room_list) {
      _room_list = room_list;
    })
  });

  app.querySelector('.room-select-screen #create-room').addEventListener('click', function() {
    let room_name = app.querySelector('.room-select-screen #room-name').value;
    if (room_name.length == 0) {
      alert('Cannot use blank room name!');
      return;
    }
    let room_id;
    do {
      room_id = makeid();
      console.log('Try room id: ' + room_id);
    } while (_room_list.length !=0 && _room_list.find(room => room.id == room_id) != undefined);
    createRoom(room_id, room_name);
    socket.emit('createroom', room_id, room_name);
  });

  app.querySelector('.room-select-screen #room-1').addEventListener('click', function() {
    let roomid = app.querySelector('.room-select-screen #room-1').value;
    _roomid = roomid
    socket.emit('joinroom', _username, roomid);
    app.querySelector('.room-select-screen').classList.remove('active');
    app.querySelector('.chat-screen').classList.add('active');
  })

  app.querySelector('.chat-screen #send-message').addEventListener('click', function() {
    let message = app.querySelector('.chat-screen #message-input').value;

    if (message.length == 0) {
      return;
    }

    renderMessage('my', {
      username: _username,
      text: message
    });

    socket.emit('chat', {
      username: _username,
      text: message
    });

    app.querySelector('.chat-screen #message-input').value = '';
  });

  app.querySelector('.chat-screen #exit-chat').addEventListener('click', function() {
    socket.emit('exituser', _username);
    window.location.href = window.location.href
  });

  socket.on('update', function(message) {
    renderMessage('update', message);
  });

  socket.on('chat', function(message) {
    renderMessage('other', message);
  });

  function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  function createRoom(id, name) {
    let room_container = app.querySelector('.room-select-screen .room-list');
    let marker = document.createElement('li');
    let room_label = document.createElement('label');
    let room_id = 'room-' + id;
    room_label.setAttribute('for', room_id);
    room_label.innerText = 'Room: ' + name;
    let room_button = document.createElement('button');
    room_button.setAttribute('id', room_id);
    room_button.setAttribute('value', id);
    room_button.innerText = 'Join';
    room_label.appendChild(room_button);
    marker.appendChild(room_label);
    room_container.appendChild(marker);
    room_container.scrollTop = room_container.scrollHeight - room_container.clientHeight;
    document.getElementById(room_id).addEventListener('click', function() {
      socket.emit('joinroom', _username, id);
      app.querySelector('.room-select-screen').classList.remove('active');
      app.querySelector('.chat-screen').classList.add('active');
    })
  }

  function renderMessage(type, message) {
    let message_container = app.querySelector('.chat-screen .messages');
    if (type == 'my') {
      let div = document.createElement('div');
      div.setAttribute('class', 'message my-messages');
      div.innerHTML = `
        <div>
          <div class='name'>You</div>
          <div class='text'>${message.text}</div>
        </div>
      `;
      message_container.appendChild(div);
    } else if (type == 'other') {
      let div = document.createElement('div');
      div.setAttribute('class', 'message other-messages');
      div.innerHTML = `
        <div>
          <div class='name'>${message.username}</div>
          <div class='text'>${message.text}</div>
        </div>
      `;
      message_container.appendChild(div);
    } else if (type == 'update') {
      let div = document.createElement('div');
      div.setAttribute('class', 'update');
      div.innerText = message;
      message_container.appendChild(div);
    }
    //scroll chat pointer to bottom of the chat box
    message_container.scrollTop = message_container.scrollHeight - message_container.clientHeight;
  }
})();