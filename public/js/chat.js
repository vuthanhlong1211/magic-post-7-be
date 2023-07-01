(() => {
  const app = document.querySelector('.app');
  const socket = io();

  let _username;
  let _roomid;

  let _participant = new Array();

  let _room_list = new Array();

  document.addEventListener('DOMContentLoaded', () => {
    fetch('/roomlist', {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          _username = data.username;
          _room_list = data.rooms;
          _room_list.forEach(createAllRoom);
          socket.emit('get_user_info', _username);
        } else {
          window.location.href = '/';
        }
      })
      .catch(error => {
        alert('Error: ', error);
      });
  });
    
  socket.on('addroom', (id, name) => {
    createRoom(id, name);
  });

  app.querySelector('.room-select-screen #create-room').addEventListener('click', function() {
    let room_name = app.querySelector('.room-select-screen #room-name').value;
    if (room_name.length == 0) {
      alert('Cannot use blank room name!');
      return;
    }
    let room_password = app.querySelector('.room-select-screen #room-password').value;
    if (!checkPasswordValidity(room_password)) {
      return;
    }
    socket.emit('req_new_room', room_name, room_password);
  });

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
    }, _roomid);

    app.querySelector('.chat-screen #message-input').value = '';
  });

  app.querySelector('.chat-screen #exit-chat').addEventListener('click', function() {
    socket.emit('exituser', _username, _roomid);
    window.location.href = window.location.href
  });

  socket.on('update', function(message) {
    renderMessage('update', message);
  });

  socket.on('chat', function(message) {
    renderMessage('other', message);
  });

  function createAllRoom(value) {
    createRoom(value.id, value.name);
  }

  function createRoom(id, name) {
    let room_container = app.querySelector('.room-select-screen .room-list');
    let marker = document.createElement('li');
    let room_label = document.createElement('label');
    let room_id = 'room-' + id;
    room_label.innerText = 'Room: ' + name;
    let room_password = document.createElement('input');
    room_password.setAttribute('type', 'password');
    room_password.setAttribute('id', 'password-' + room_id);
    let room_button = document.createElement('button');
    room_button.setAttribute('id', room_id);
    room_button.setAttribute('value', id);
    room_button.innerText = 'Join';
    room_label.appendChild(room_password);
    room_label.appendChild(room_button);
    marker.appendChild(room_label);
    room_container.appendChild(marker);
    room_container.scrollTop = room_container.scrollHeight - room_container.clientHeight;
    document.getElementById(room_id).addEventListener('click', function() {
      let password = document.getElementById('password-' + room_id).value;
      socket.emit('ask_permission_to_join', _username, id, password);
      socket.on('return_permission', function(permission) {
        if (permission == undefined) {
          alert('Error trying to join, no room exists!');
          return;
        } else if (permission == false) {
          alert('Wrong password!');
          return;
        } else {
          _roomid = id;
          socket.emit('joining_room', _username, _roomid);
          socket.emit('get_messages_history', _roomid);
          socket.on('return_messages_history', (messages) => {
            console.log(messages);
          });
          app.querySelector('.room-select-screen').classList.remove('active');
          app.querySelector('.chat-screen').classList.add('active');
        }
      })
    })
  }

  function checkPasswordValidity(password) {
    if (password.length < 8 && password.length > 0) {
      alert('Valid password must longer than 8 characters');
      return false;
    }
    return true;
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