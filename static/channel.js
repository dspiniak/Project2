document.addEventListener('DOMContentLoaded', () => {

      // get channel_id and user session
      const channel_id = window.location.pathname.split( '/' )[2];
      const username =  localStorage.getItem('username');


      // LOAD EXISTING MESSAGES IN SERVER
      // create new XMLHttpRequest
      const request_messages = new XMLHttpRequest();
      request_messages.open('POST', '/load_messages');

      // send request to server
      const channel_id_toserver = new FormData();
      channel_id_toserver.append('channel_id', channel_id);
      request_messages.send(channel_id_toserver);

      // receive messages from server
      request_messages.onload = () => {

        const data = JSON.parse(request_messages.responseText);

        // display messages in html
        if (data.success) {

          data.messages.forEach(message => {
            const div = document.createElement('div');
            div.id = message.id;
            div.className = 'message';
            div.innerHTML = `${message.time.bold()} | ${message.username.bold()}: ${message.text}`;
            document.querySelector('#messages').append(div);
            add_delete_button(div, message.username);
          });
        }
        else {
            document.querySelector('#messages').innerHTML = 'Sorry, there was an error retrieving messages from the server.';
        }
      };


      // SEND AND RECEIVE MESSAGES VIA WEBSOCKET
      // Connect to websocket
      var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

      // When form is submitted it should emit a "submit message" event,
      // which should include channel_id, username, and timestamp

        document.querySelector('#form').onsubmit = () => {

          const message = document.querySelector('#new-message').value;

          // get current date and format it
          const date = new Date();
          const time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

          socket.emit('submit message',
                      {'username':username, 'message': message, 'time':time, 'channel_id': channel_id }
                      );

          document.querySelector('#new-message').value = '';

          return false;
      };

      // When a new message is sent, add to the messages displayed and delete messages past 100
      socket.on('send message', message => {

          // count # of messages (child elements of messages div)
          const div = document.createElement('div');
          div.id = message.id;
          div.className = 'message';
          div.innerHTML = `${message.time.bold()} | ${message.username.bold()}: ${message.text}`;
          document.querySelector('#messages').append(div);

          // add delete button only if username = message's username
          add_delete_button(div, message.username);

          // delete befor adding messages
          while (document.getElementById("messages").childElementCount > 100)
          {
            document.getElementById("messages").firstChild.remove();
          }

      });


      // ADD DELETE BUTTON TO MESSAGE
      function add_delete_button(message_element, message_username) {

          // check if message is from user and add delete button if it is
          if (username == message_username){

              // add delete button
              const delete_button = document.createElement('button');
              delete_button.className = 'btn btn-outline-danger';
              delete_button.innerHTML = 'delete';
              message_element.append(delete_button);

              // when delete button is clicked delete message on client and server
              delete_button.onclick = function() {

                  // create request to delete message on server via POST
                  const request_delete = new XMLHttpRequest();
                  request_delete.open('POST', '/delete_message');

                  const message_id_toserver = new FormData();
                  message_id_toserver.append('message_id', message_element.id);
                  message_id_toserver.append('channel_id', channel_id);
                  request_delete.send(message_id_toserver);

                  // send request to delete message on server
                  request_delete.onload = () => {
                      const data = JSON.parse(request_delete.responseText);
                      // if message deleted on server delete also on client, else alert user of error
                      if(data.success){
                          this.parentElement.remove();
                      }
                      else {
                        alert('Sorry, the server failed to delete button')
                      }
                  };
              };

          }
      };

  });
