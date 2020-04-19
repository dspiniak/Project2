document.addEventListener('DOMContentLoaded', () => {

      // get channel_id and user session
      const channel_id = document.querySelector('#channel-id').textContent;
      const username =  localStorage.getItem('username');

      // load existing messages in server
      // create new XMLHttpRequest
      const request = new XMLHttpRequest();
      request.open('POST', '/load_messages');

      // send request to server
      request.send(channel_id);

      // receive messages from server
      request.onload = () => {

        const data = JSON.parse(request.responseText);

        // display messages in html
        if (data.success) {

          data.messages.forEach(message => {
            const div = document.createElement('div');
            div.id = 'message';
            div.className = 'message';
            div.innerHTML = `${message.time.bold()} | ${message.username.bold()}: ${message.message}`;
            document.querySelector('#messages').append(div);
          });
        }
        else {
            document.querySelector('#messages').innerHTML = 'There was an error.';
        }

      }





      // add delete buttons
      document.querySelectorAll('#message').forEach(message => {
        add_delete_button(message);
      });

      // add delete button
      function add_delete_button(message_element, message_username) {

        // check if message is from user and add delete button if it is
        if (username == message_username){
          const delete_button = document.createElement('button');
          delete_button.className = 'btn btn-outline-danger';
          delete_button.innerHTML = 'delete';
          message_element.append(delete_button);
          delete_button.onclick = function() {
              this.parentElement.remove();
          };
        };
      };

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
      socket.on('send message', data => {

          // count # of messages (child elements of messages div)
          const div = document.createElement('div');
          div.id = 'message';
          div.className = 'message';
          div.innerHTML = `${data.time.bold()} | ${data.username.bold()}: ${data.message}`;
          document.querySelector('#messages').append(div);

          // add delete button only if username = message's username
          add_delete_button(div, data.username);

          // delete befor adding messages
          while (document.getElementById("messages").childElementCount > 100)
          {
            document.getElementById("messages").firstChild.remove();
          }

      });

  });
