/**
 * Registers the User
 * @returns exits the function if user-passwords are not equal
 */
async function register() {
  if (password1.value !== password2.value) {
    showPasswordsAreNotEqual();
    return;
  }
  let fd = getDataFromRegisterForm();
  try {
    hideAllAlertInfos();
    await waitingForServerResponse(fd);
    showRegisteredSuccessfully();
    emptyInputfields();
  }
  catch (e) {
    showUserAlreadyExisting();
  }
}

/** Fetches Data from the Register-Form
 * @returns Form-Data-Object
 */
function getDataFromRegisterForm() {
  let fd = new FormData();
  fd.append('username', username.value);
  fd.append('password1', password1.value);
  fd.append('password2', password2.value);
  fd.append('csrfmiddlewaretoken', token);
  return fd;
}

/**
 * Makes a POST-Request to the server
 * @param {Object} fd 
 * @returns a JSON
 */
async function waitingForServerResponse(fd) {
  let response = await fetch('/register/', {
    method: 'POST',
    body: fd
  });

  let json = await response.json();
  return json;
}

/**
 * Shows that registration failed, because passwords are not equal
 */
function showPasswordsAreNotEqual() {
  document.getElementById('spinner').classList.add('d-none'); //Hide Spinner
  document.getElementById('ok').classList.add('d-none'); //Hide OK 
  document.getElementById('loginLink').classList.add('d-none'); //Hide Login-Link
  document.getElementById('error').classList.add('d-none'); //Hide Error
  document.getElementById('pwerror').classList.remove('d-none'); //Show PwError
}

/**
 * Hides all messages until user tries to register
 */
function hideAllAlertInfos() {
  document.getElementById('error').classList.add('d-none'); //Hide Error
  document.getElementById('spinner').classList.remove('d-none'); //Show Spinner
  document.getElementById('pwerror').classList.add('d-none'); //Hide PwError
}

/**
 * Shows that registration was successful
 */
function showRegisteredSuccessfully() {
  document.getElementById('pwerror').classList.add('d-none'); //Hide PwError 
  document.getElementById('spinner').classList.add('d-none'); //Hide Spinner
  document.getElementById('ok').classList.remove('d-none'); //Show OK
  document.getElementById('loginLink').classList.remove('d-none'); //Show Login-Link
}

/**
 * Shows that registration failed, because username already exists
 */
function showUserAlreadyExisting() {
  document.getElementById('spinner').classList.add('d-none'); //Hide Spinner
  document.getElementById('ok').classList.add('d-none'); //Hide OK
  document.getElementById('loginLink').classList.add('d-none'); //Hide Login-Link
  document.getElementById('pwerror').classList.add('d-none'); //Hide PwError 
  document.getElementById('error').classList.remove('d-none'); //Show Error
}

/**
 * Clears Input-Fields after registration
 */
function emptyInputfields() {
  username.value = "";
  password1.value = "";
  password2.value = "";
  username.placeholder = "Username";
  password1.placeholder = "Password";
  password2.placeholder = "Password";
}