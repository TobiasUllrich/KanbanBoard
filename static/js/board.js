let currentDraggedElement; //Saves the currently dragged HTML-Element
let parentElementofDraggedElement; //Saves the parent of the currently dragged HTML-Element
let actTicketId; //Saves the id of the currently opened ticket
let actListId; //Saves the id of the list of the currently opened ticket

/**
 * Allows dropping of Elements over div-containers
 * @param {event} ev 
 */
function allowDrop(ev) {
  ev.preventDefault();
}

/**
 * When dragging starts: Saves the currently dragged HTML-Element and its parent in global variables
 * @param {string} id id of the dragged HTML-Element
 */
function startDragging(id) {
  currentDraggedElement = document.getElementById(id);
  parentElementofDraggedElement = currentDraggedElement.parentNode;
  //console.log('Element mit der id: ',id,' wird gerade gezogen!');
  //console.log('Wurzel ist Element mit id: ',parentElementofDraggedElement.id);
}

/**
 * Dragged HTML-Element gets dropped on another Container and then gets added to this Container
 * @param {number} newListId id of the list the new HTML-Element will get
 * @param {string} newContainerId id of the Container where the current dragged element is dropped in
 */
async function moveTo(newListId, newContainerId) {
  if (parentElementofDraggedElement.id !== newContainerId) {
    //console.log('Von ',parentElementofDraggedElement.id,' zu ',idWhereCurrentDraggedElementIsDropped);
    //console.log('Ziel ist Element mit id: ',newListId);

    //PUT-REQUEST
    await changeList(currentDraggedElement.id, newListId);
    await putReq(newListId)

    placeTicketInAnotherList(newContainerId);
    removeTicketFromFormerList();
  }
}

/**
 * Creates a new HTML-Element inside the dropping Container
 * @param {string} newContainerId id of the Container where the current dragged element is dropped in
 */
function placeTicketInAnotherList(newContainerId) {
  document.getElementById(newContainerId).innerHTML += `
  <div class="ticket" id='${currentDraggedElement.id}' draggable="true" ondragstart="startDragging('${currentDraggedElement.id}')">
   ${currentDraggedElement.innerHTML}
  </div>`;
}

/**
 * Deletes the dragged HTML-Element from its original list
 */
function removeTicketFromFormerList() {
  currentDraggedElement.remove();
}

/**
 * Fills the Ticket-PopUp with data and shows it to the user
 * @param {string} ticketId id of the opened ticket
 * @param {number} listId id of the list  
 */
function editTicket(ticketId, listId) {
  actTicketId = ticketId;
  actListId = listId;
  //console.log(actTicketId, ' ', actListId);
  document.getElementById('ticket_title').value = document.getElementById(`title${ticketId}`).innerHTML;
  document.getElementById('ticket_description').value = document.getElementById(`description${ticketId}`).innerHTML;
  document.getElementById('ticket_created_at').value = switchYearAndDayOfDate(document.getElementById(`createdat${ticketId}`).innerHTML, '-');
  document.getElementById('ticket_created_at').disabled = true;
  document.getElementById('ticket_duedate').value = switchYearAndDayOfDate(document.getElementById(`duedate${ticketId}`).innerHTML, '-');
  document.getElementById('ticket_list').selectedIndex = listId - 1;
  document.getElementById('ticket_list').disabled = true;
  selectListboxItemByText('ticket_prio', document.getElementById(`prio${ticketId}`).innerHTML);
  selectUsersInForm(ticketId);
  openTicket();
  //console.log(`Ticket with id ${ticketId} & list ${listId} can be edited here`);
}

/**
 * Demarks all Users in the Userlist of the PopUp-Form
 */
function demarkAllUsersInForm() {
  let parent = document.getElementsByTagName('label');
  for (let i = 0; i < parent.length; i++) {
    let children = parent[i].children;
    for (let j = 0; j < children.length; j++) {
      if (children[j].checked == true) {children[j].click()};
    }
  }
}

/**
 * Selects all Users in the Userlist of the PopUp-Form
 */
function selectUsersInForm(ticketId) {
  let parent = document.getElementById(`tickettouser${ticketId}`);
  let children = parent.children;
  for (let i = 0; i < children.length; i++) {
    //console.log(children[i].id);
    //console.log(children[i].id.slice(children[i].id.indexOf("-") + 1, children[i].id.length));
    let userid = children[i].id.slice(children[i].id.indexOf("-") + 1, children[i].id.length); //Cuts of the id of the user at the end
    //console.log(`user-${userid}`, ' auf true setzen');
    document.getElementById(`user-${userid}`).click(); //User gets selected
  }
}

/**
 * Fills the Ticket-PopUp with predefined or empty data and shows it to the user
 * @param {number} listId id of the list  
 */
function createTicket(listId) {
  actTicketId = '';
  actListId = listId;
  //console.log(actTicketId, ' ', actListId);
  document.getElementById('ticket_title').value = '';
  document.getElementById('ticket_description').value = '';
  //console.log(getActualDate());
  document.getElementById('ticket_created_at').value = `${getActualDate('-')}`;
  document.getElementById('ticket_created_at').disabled = true;
  document.getElementById('ticket_duedate').value = `${getActualDate('-')}`;
  document.getElementById('ticket_list').selectedIndex = listId - 1;
  document.getElementById('ticket_list').disabled = true;
  document.getElementById('ticket_prio').selectedIndex = 0;
  openTicket();
  //console.log('New Ticket can be created here with ticket_list', listId);
}

/**
 * Opens the Ticket-PopUp
 */
function openTicket() {
  document.getElementById('board-popup').classList.add('d-flex');
}

/**
 * Closes the Ticket-PopUp
 */
function closeTicket() {
  demarkAllUsersInForm();
  actTicketId = '';
  actListId = '';
  document.getElementById('board-popup').classList.remove('d-flex');
}

/**
 * Closes the PopUp
 * @param {event} event 
 */
window.onclick = function (event) {
  if (event.target.id == 'board-popup') {
    closeTicket();
  }
}

/**
 * Searches a certain text in a listbox with a certain id
 * @param {string} idOfListbox id of the listbox
 * @param {string} text text we are searching for in the listbox
 */
function selectListboxItemByText(idOfListbox, text) {
  let listbox = document.getElementById(idOfListbox);
  for (let i = 0; i < listbox.options.length; i++) {
    if (listbox.options[i].text === text) {
      listbox.options[i].selected = true;
      break;
    }
  }
}

/**
 * Generates the actual Date in the format "2010-10-30" or "2010.10.30"
 * @param {string} separator ('.' or '-')
 * @returns the actual Date
 */
function getActualDate(separator) {
  let currentdate = new Date();  /* Erzeugt eine Datums-Variable mit aktuellem Datum */
  let year = currentdate.getFullYear();
  let month = currentdate.getMonth() + 1;
  month = String(month).padStart(2, '0');
  let day = currentdate.getDate();
  let dateToday = year + `${separator}` + month + `${separator}` + day;
  return dateToday;
}

/**
 * Receives a string-variable in the format "30-10-2010" and converts it into string "2010-10-30" or "2010.10.30"
 * @param {string} datetotransform The received string-variable
 * @param {string} separatorOutput The separator of the Output-Date ('.' or '-')
 * @returns string-variable newDate
 */
function switchYearAndDayOfDate(datetotransform, separatorOutput) {
  let datum = datetotransform;
  let ersterstrich = datum.indexOf("-");
  let zweiterstrich = datum.lastIndexOf("-");
  let tag = datum.slice(0, ersterstrich);
  if (tag.length == 1) {
    tag = "0" + tag;
  }
  let monat = datum.slice(ersterstrich + 1, zweiterstrich);
  if (monat.length == 1) {
    monat = "0" + monat;
  }
  let jahr = datum.slice(zweiterstrich + 1, datum.length);
  let newDate = jahr + `${separatorOutput}` + monat + `${separatorOutput}` + tag;
  return newDate;
}

/**
 * Catches all Users that are selected in the User-List of the PopUp and puts theier ids into an Array
 * @returns Array with user-ids
 */
function getSelectedUsersAsArray(){
  let userArray=[];
  let parent = document.getElementsByTagName('label');
  for (let i = 0; i < parent.length; i++) {
    let children = parent[i].children;
    for (let j = 0; j < children.length; j++) {
      if (children[j].checked == true) {
        //console.log('User marked ',children[j].id)
        //console.log('User marked ',children[j].id.slice(children[j].id.indexOf("-") + 1, children[j].id.length))
        userArray.push(parseInt(children[j].id.slice(children[j].id.indexOf("-") + 1, children[j].id.length)));
      };
    }
  }
  return userArray;
}

/**
 * Catches the value of the Prio-Field of the PopUp
 * @returns value of the Prio-Field
 */
function getValueOfSelectedPrio(){
  let e = document.getElementById('ticket_prio');
  let val = e.options[e.selectedIndex].text;
  return val;
}




function saveTicket() {
  console.log('TicketNummer ', actTicketId);
  console.log('Title ',document.getElementById('ticket_title').value);
  console.log('Description ',document.getElementById('ticket_description').value);
  console.log('Created_at ',document.getElementById('ticket_created_at').value);
  console.log('DueDate ',document.getElementById('ticket_duedate').value);
  console.log('Listen-Nummer ',actListId);
  console.log('Prio ',getValueOfSelectedPrio());
  console.log('Users ',getSelectedUsersAsArray());
  console.log('POST-REQUEST OR PUT-REQUEST');
  //MUSS UNBEDINGT NOCH IM HTML-CODE GEÄNDERT WERDEN IN DER TICKET-BOX
  closeTicket();
}


function deleteTicket(ticketId = actTicketId) { //Use actTicket if no ticketId is provided at function-call
  if (ticketId !== '') { //Falls wir bei createTicket sind kann man das Ticket nicht löschen
    document.getElementById(`${ticketId}`).remove();
    console.log(`DELETE-REQUEST for ${ticketId} `);
    closeTicket();
  }
}




function putReq(newListId) {
  console.log(currentDraggedElement.id);
  console.log(newListId);
}







/**
 * Array with month-abbreviations
 */
const monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

/**
 * Sends a Message to the chat
 */
async function changeList(ticketId, listId) {
  let fd = getDataFromMessageForm(ticketId, listId);
  //let messageContainerSaved = messageContainer.innerHTML;
  //let dateOfPost = giveActualDate(); //Get actual Date

  try {
    //showLoadingAnimation(dateOfPost,username,messageField.value,'gray','gray','deleteMessage',messageContainerSaved);
    let json = await waitingForServerResponse(fd);
    //showSendingMessageSuccessful(`[${transformDateIntoWishedFormat(jsonparsed.fields.created_at)}]`,jsonparsed.fields.author['0'],jsonparsed.fields.text,'gray','black','',messageContainerSaved);
  }
  catch (e) {
    console.log(e);
    //showSendingMessageFailed(dateOfPost,username,messageField.value,'red','red','deleteMessage', messageContainerSaved);
  }
}

/**
 * Fetches Data from the messageField
 * @returns Form-Data-Object
 */
function getDataFromMessageForm(ticketId, listId) {
  let fd = new FormData();
  fd.append('id', ticketId);
  fd.append('ticket_list', listId);
  fd.append('csrfmiddlewaretoken', token);
  console.log(ticketId, listId, token);
  return fd;
}

/**
 * Makes a POST-Request to the server
 * @param {Object} fd 
 * @returns a parsed JSON
 */
async function waitingForServerResponse(fd) {
  let response = await fetch('/board/', {
    method: 'PUT',
    body: fd
    // headers: {
    //   "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    //   "Content-Type": "application/json"
    // }
    //headers = {'Authorization': f'Token {token}'}
    // headers: {
    //   'Authorization': `Token ${token}`
    // }
  });

  let json = await response.json();
  //let jsonparsed = JSON.parse(json);
  return json;
}

/**
 * Removes JS-Message (preview of real message)
 */
function removeMessageFromMessageContainer() {
  document.getElementById('deleteMessage').remove();
}

/**
 * Shows Message
 */
function showMessageInMessageContainer(date, username, textmessage, colorOfDate, colorOfText, id, messageContainerSaved) {
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
function showLoadingAnimation(dateOfPost, username, message, colorOfDate, colorOfText, id, messageContainerSaved) {
  showMessageInMessageContainer(dateOfPost, username, message, colorOfDate, colorOfText, id, messageContainerSaved);
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
function showSendingMessageSuccessful(date, username, textmessage, colorOfDate, colorOfText, id, messageContainerSaved) {
  removeMessageFromMessageContainer();
  removeLoadingAnimation();
  showMessageInMessageContainer(date, username, textmessage, colorOfDate, colorOfText, id, messageContainerSaved);
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
function showSendingMessageFailed(date, username, textmessage, colorOfDate, colorOfText, id, messageContainerSaved) {
  showMessageInMessageContainer(date, username, textmessage, colorOfDate, colorOfText, id, messageContainerSaved);
  setTimeout(() => {
    removeLoadingAnimation();
    document.getElementById('deleteMessage').innerHTML += `<span class="color-red"> - Sry. Message could not be send. </span>`;
  }, 3000);
}

/**
 * Generates string with the actual date in this format: [Jan. 11, 2023]
 * @returns string datetime
 */
function giveActualDate() {
  let currentdate = new Date();  /* Generates a date-variable with actual date */
  let datetime = "[" + currentdate.toLocaleString('default', { month: 'short' }) + ". "
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
  if (monat.length == 2 && monat.slice(0, 0) == '0') { monat = monat.slice(1, 1) };
  monat = monthNames[monat - 1];
  let tag = datum.slice(zweiterstrich + 1, datum.length);
  if (tag.length == 2 && tag.slice(0, 1) == '0') { tag = tag.slice(-1) };
  let wisheddate = monat + " " + tag + ", " + jahr;
  return wisheddate;
}