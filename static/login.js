document.addEventListener('DOMContentLoaded', () => {

  document.querySelector('#form').onsubmit = () => {

    localStorage.setItem('username', document.querySelector('#username').value)
  };

});
