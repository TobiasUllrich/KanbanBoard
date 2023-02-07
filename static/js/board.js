//Beim Laden der Seite müssen die Tasks reingerendert werden!

let tasks=[
  {
    'id':0,
    'title':'Pullern',
    'category': 'todo',
  },
  {
    'id':1,
    'title':'Putzen',
    'category': 'inprogress',
  },
  {
    'id':2,
    'title':'Gehen',
    'category': 'awaitingfeedback',
  },
  {
    'id':3,
    'title':'Machen',
    'category': 'done',
  }
  ];

// Soll speichern welches Element gerade gezogen wird über die Funktion ondragstart()!
let currentDraggedElement;

// Von W3C übernommen: Erlaubt das Droppen von Elementen über div-Containern
function allowDrop(ev) {
  ev.preventDefault();
}

// Sobald man zu Ziehen anfängt wird diese Funktion ausgeführt und speichert die id der Box die gezogen wird
function startDragging(id){
  currentDraggedElement=id;
  console.log('Element mit der id: ',currentDraggedElement,' wird gerade gezogen!');
}

// Sobald ich die Box über dem entsprechenden Container droppe bekommt die Box die Kategorie des Containers
function moveTo(category) {
  tasks[currentDraggedElement]['category']=category;
  console.log('Array sieht jetzt so aus: ', tasks);
  //JETZT Seite neu RENDERN bzw. den einzelnen TASK neu rendern
}














/**
 * Array with month-abbreviations
 */
const monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

/**
 * Sends a Message to the chat
 */
async function sendMessage() {
  let fd = getDataFromMessageForm();
  let messageContainerSaved = messageContainer.innerHTML;
  let dateOfPost = giveActualDate(); //Get actual Date

  try {
    showLoadingAnimation(dateOfPost,username,messageField.value,'gray','gray','deleteMessage',messageContainerSaved);
    let jsonparsed = await waitingForServerResponse(fd);
    showSendingMessageSuccessful(`[${transformDateIntoWishedFormat(jsonparsed.fields.created_at)}]`,jsonparsed.fields.author['0'],jsonparsed.fields.text,'gray','black','',messageContainerSaved);
  }
  catch (e) {
    showSendingMessageFailed(dateOfPost,username,messageField.value,'red','red','deleteMessage', messageContainerSaved);
  }
}

/**
 * Fetches Data from the messageField
 * @returns Form-Data-Object
 */
function getDataFromMessageForm() {
  let fd = new FormData();
  fd.append('textmessage', messageField.value);
  fd.append('csrfmiddlewaretoken', token);
  return fd;
}

/**
 * Makes a POST-Request to the server
 * @param {Object} fd 
 * @returns a parsed JSON
 */
async function waitingForServerResponse(fd) {
  let response = await fetch('/chat/', {
    method: 'POST',
    body: fd
  });

  let json = await response.json();
  let jsonparsed = JSON.parse(json);
  return jsonparsed;
}

/**
 * Removes JS-Message (preview of real message)
 */
function removeMessageFromMessageContainer(){
  document.getElementById('deleteMessage').remove();
}

/**
 * Shows Message
 */
function showMessageInMessageContainer(date,username,textmessage,colorOfDate,colorOfText,id,messageContainerSaved){
  messageContainer.innerHTML = `
  <div id="${id}">
    <span class="color-${colorOfDate}">${date}</span> ${username}: <i class="color-${colorOfText}">${textmessage}</i>
  </div>`+ messageContainerSaved;
}

/**
 * Clears InputField with message
 */
function emptyTextField() {
  messageField.value = '';
}

/**
 * Shows Loading Animation and JS-Message (preview of real message)
 * @param {String} dateOfPost 
 * @param {String} username 
 * @param {String} message 
 * @param {String} colorOfDate 
 * @param {String} colorOfText 
 * @param {String} id 
 * @param {String} messageContainerSaved 
 */
function showLoadingAnimation(dateOfPost,username,message,colorOfDate,colorOfText,id,messageContainerSaved) {
  showMessageInMessageContainer(dateOfPost,username,message,colorOfDate,colorOfText,id,messageContainerSaved);
  document.getElementById('spinner').classList.remove('d-none');
}

/**
 * Removes Loading-Animation
 */
function removeLoadingAnimation() {
  emptyTextField();
  document.getElementById('spinner').classList.add('d-none');
}

/**
 * Show that POST-Request was accepted by the server
 * @param {String} date 
 * @param {String} username 
 * @param {String} textmessage 
 * @param {String} colorOfDate 
 * @param {String} colorOfText 
 * @param {String} id 
 * @param {String} messageContainerSaved 
 */
function showSendingMessageSuccessful(date,username,textmessage,colorOfDate,colorOfText,id,messageContainerSaved) {
  removeMessageFromMessageContainer();
  removeLoadingAnimation();
  showMessageInMessageContainer(date,username,textmessage,colorOfDate,colorOfText,id,messageContainerSaved);
}

/**
 * Show that POST-Request was NOT accepted by the server
 * @param {String} date 
 * @param {String} username 
 * @param {String} textmessage 
 * @param {String} colorOfDate 
 * @param {String} colorOfText 
 * @param {String} id 
 * @param {String} messageContainerSaved 
 */
function showSendingMessageFailed(date,username,textmessage,colorOfDate,colorOfText,id,messageContainerSaved) {
  showMessageInMessageContainer(date,username,textmessage,colorOfDate,colorOfText,id,messageContainerSaved);
  setTimeout(()=>{
    removeLoadingAnimation();
    document.getElementById('deleteMessage').innerHTML+=`<span class="color-red"> - Sry. Message could not be send. </span>`;
  },3000); 
}

/**
 * Generates string with the actual date in this format: [Jan. 11, 2023]
 * @returns string datetime
 */
function giveActualDate() {
  var currentdate = new Date();  /* Generates a date-variable with actual date */
  var datetime = "[" + currentdate.toLocaleString('default', { month: 'short' }) + ". "
    + currentdate.getDate() + ", "   /* Month */
    + currentdate.getFullYear() + "]";  /* Year */
  return datetime;
}

/**
 * Receives a string in the format "2010-10-30" and converts it into string "Oct. 10, 2010"
 * @param {string} datetotransform The received string
 * @returns string wisheddate
 */
function transformDateIntoWishedFormat(datetotransform) {
  let datum = datetotransform;
  let ersterstrich = datum.indexOf("-");
  let zweiterstrich = datum.lastIndexOf("-");
  let jahr = datum.slice(0, ersterstrich);
  let monat = datum.slice(ersterstrich + 1, zweiterstrich);
  if (monat.length == 2 && monat.slice(0, 0) == '0') {monat = monat.slice(1, 1)};
  monat = monthNames[monat - 1];
  let tag = datum.slice(zweiterstrich + 1, datum.length);
  if (tag.length == 2 && tag.slice(0, 1) == '0') {tag = tag.slice(-1)};
  let wisheddate = monat + " " + tag + ", " + jahr;
  return wisheddate;
}