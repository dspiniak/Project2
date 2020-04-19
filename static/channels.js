document.addEventListener('DOMContentLoaded', () => {

      // Add channel to html when form is submitted
      document.querySelector('#form').onsubmit = () => {

          // Initialize new request,
          const request = new XMLHttpRequest();
          request.open('POST', '/add_channel');

          // Get new channel from form, transform to user input object, and send request to server
          const channel = document.querySelector('#new-channel').value;
          const data1 = new FormData();
          data1.append('new_channel', channel);
          request.send(data1);
          document.querySelector('#new-channel').value = "";

          // Add new channel to list when XMLHttpRequest completes
          request.onload = () => {

              // Extract JSON data from request
              const data2 = JSON.parse(request.responseText);

              // Update the channels list
              if (data2.success) {
                  const li = document.createElement('li');
                  const a = document.createElement('a');

                  a.textContent = data2.new_channel;
                  a.setAttribute('href', "/channel/"+data2.new_channel);
                  li.appendChild(a);

                  document.querySelector('#channels').appendChild(li);
              }
              else {
                  alert('There was an error adding the channel');
              }
          }

          // do not submit form
          return false;
      };

  });
