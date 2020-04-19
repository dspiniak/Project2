document.addEventListener('DOMContentLoaded', () => {

    //if user clicked button to go back to index change last_page status
    document.getElementById("index_link").onclick = () => {

      const request = new XMLHttpRequest();
      const pressed_button = "TRUE";
      request.open('POST', '/');

      request.send();
      request.onload = () => {
          window.location.href = '/';
      }

      return false;

    };

});



  // if user hasn't entered a page yet, set the first page he was in
  // if (!localStorage.getItem('last_page'))
  //   localStorage.setItem('last_page', document.title);

  // if user entered
