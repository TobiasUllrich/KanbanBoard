/**
 * Loggs in the user
 */
async function login() {
  let fd = getDataFromMessageForm();
  try {
    showLoadingAnimation();
    let json = await waitingForServerResponse(fd);
    showLoginSuccess(json);
  }
  catch (e) {
    removeLoadingAnimation();
    showLoginFailed();
  }
}

/**
 * Fetches Data from the Login-Form
 * @returns Form-Data-Object
 */
function getDataFromMessageForm() {
  let fd = new FormData();
  fd.append('username', username.value);
  fd.append('password', password.value);
  fd.append('csrfmiddlewaretoken', token);
  return fd;
}

/**
 * Makes a POST-Request to the server
 * @param {Object} fd 
 * @returns a JSON
 */
async function waitingForServerResponse(fd) {
  let response = await fetch('/login/', {
    method: 'POST',
    body: fd
  });
  return await response.json();
}

/**
 * Shows that login was successful and redirects to chat
 * @param {JSON-Object} json 
 */
function showLoginSuccess(json) {
  removeLoadingAnimation();
  window.location.href = `${json['RedirectTo']}`;
}

/**
 * Shows that login failed
 */
function showLoginFailed() {
  showPasswordOrUsernameWrong();
}

/**
 * Shows that Password or Username was wrong
 */
function showPasswordOrUsernameWrong() {
  document.getElementById('error').classList.remove('d-none');
}

/**
 * Hides that Password or Username was wrong
 */
function hidePasswordOrUsernameWrong() {
  document.getElementById('error').classList.add('d-none');
}

/**
 * Shows loading Animation while sending POST-request to server
 */
function showLoadingAnimation() {
  username.disabled = true;
  password.disabled = true;
  hidePasswordOrUsernameWrong();
  document.getElementById('spinner').classList.remove('d-none');
}

/**
 * Removes loading Animation when response from server is there
 */
function removeLoadingAnimation() {
  username.disabled = false;
  password.disabled = false;
  document.getElementById('spinner').classList.add('d-none');
}