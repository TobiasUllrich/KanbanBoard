loadDataForHTML(); //When the HTML-Page is loaded
let containerIDs = ['todo','inprogress','awaitingfeedback','done']; //Corresponding Container IDs for List IDs
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
}

/**
 * Dragged HTML-Element gets dropped on another Container and then gets added to this Container
 * @param {number} newListId id of the list the new HTML-Element will get
 * @param {string} newContainerId id of the Container where the current dragged element is dropped in
 */
async function moveTo(newListId, newContainerId) {
  if (parentElementofDraggedElement.id !== newContainerId) {
    task = {"id": currentDraggedElement.id,"ticket_list": newListId};
    let ticketsFromServer = await sendRequest('PUT','/tickets/',task);
    console.log('ANTWORT DES PUT-REQUESTS: ',ticketsFromServer);
    placeTicketInAnotherList(newContainerId,newListId);
    removeTicketFromFormerList();
  }
}

/**
 * Creates a new HTML-Element inside the dropping Container
 * @param {string} newContainerId id of the Container where the current dragged element is dropped in
 * @param {string} newListId corresponding number to the Container where the current dragged element is dropped in
 */
function placeTicketInAnotherList(newContainerId,newListId) {
  document.getElementById(`editTicket${currentDraggedElement.id}`).innerHTML =`
  <div class="ticket-edit" onclick="editTicket('${currentDraggedElement.id}',${newListId})"><img  src="../../../static/img/edit16.png"></div>`;
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
  document.getElementById('ticket_title').value = document.getElementById(`title${ticketId}`).innerHTML;
  document.getElementById('ticket_description').value = document.getElementById(`description${ticketId}`).innerHTML;
  document.getElementById('ticket_created_at').value = switchYearAndDayOfDate(document.getElementById(`createdat${ticketId}`).innerHTML, '-');
  document.getElementById('ticket_created_at').disabled = true;
  document.getElementById('ticket_duedate').value = switchYearAndDayOfDate(document.getElementById(`duedate${ticketId}`).innerHTML, '-');
  document.getElementById('ticket_list').selectedIndex = listId - 1;
  document.getElementById('ticket_list').disabled = false;
  selectListboxItemByText('ticket_prio', document.getElementById(`prio${ticketId}`).innerHTML);
  selectUsersInForm(ticketId);
  openTicket();
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
    let userid = children[i].id.slice(children[i].id.indexOf("-") + 1, children[i].id.length); //Cuts of the id of the user at the end
    document.getElementById(`user-${userid}`).click(); //User gets selected
  }
}

/**
 * Fills the Ticket-PopUp with predefined or empty data and shows it to the user
 * @param {number} listId id of the list  
 */
function newTicket(listId) {
  actTicketId = '';
  actListId = listId;
  document.getElementById('ticket_title').value = '';
  document.getElementById('ticket_description').value = '';
  document.getElementById('ticket_created_at').value = `${getActualDate('-')}`;
  document.getElementById('ticket_created_at').disabled = true;
  document.getElementById('ticket_duedate').value = `${getActualDate('-')}`;
  document.getElementById('ticket_list').selectedIndex = listId - 1;
  document.getElementById('ticket_list').disabled = true;
  document.getElementById('ticket_prio').selectedIndex = 0;
  openTicket();
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
  let currentdate = new Date();
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
  let userNameArray=[];
  let parent = document.getElementsByTagName('label');
  for (let i = 0; i < parent.length; i++) {
    let children = parent[i].children;
    for (let j = 0; j < children.length; j++) {
      if (children[j].checked == true) {
        userArray.push(parseInt(children[j].id.slice(children[j].id.indexOf("-") + 1, children[j].id.length)));
        let id='username-'+children[j].id.slice(children[j].id.indexOf("-") + 1, children[j].id.length);
        userNameArray.push(document.getElementById(id).innerHTML);   
      };
    }
  }
  return {'val1': userArray, 'val2': userNameArray};
}

/**
 * Catches the value of the Prio-Field of the PopUp
 * @param {string} id of the Drop-Down-Field
 * @returns value of the Prio-Field
 */
function getValueOfSelectedIteminDropDownField(id){
  let e = document.getElementById(id);
  let val = e.options[e.selectedIndex].text;
  return val;
}

/**
 * Selects the User
 * @param {string} id of the user-box
 */
function selectUser(id){
  document.getElementById(id).click();
}

/**
 * Deletes the Ticket in HTML
 * @param {string} ticketId id of the HTML-Element that is deleted
 */
function removeTicket(ticketId) {
  document.getElementById(ticketId).remove();
}

/**
 * Updates a Ticket in HTML
 */
function updateTicket(taskToRenderHTML){
  document.getElementById(`title${taskToRenderHTML['id']}`).innerHTML=taskToRenderHTML['ticket_title'] ;
  document.getElementById(`description${taskToRenderHTML['id']}`).innerHTML=taskToRenderHTML['ticket_description'] ;
  document.getElementById(`createdat${taskToRenderHTML['id']}`).innerHTML=switchYearAndDayOfDate(taskToRenderHTML['ticket_created_at'],'-');
  document.getElementById(`duedate${taskToRenderHTML['id']}`).innerHTML=switchYearAndDayOfDate(taskToRenderHTML['ticket_duedate'],'-');
  document.getElementById(`prio${taskToRenderHTML['id']}`).innerHTML=taskToRenderHTML['ticket_prio'];
  document.getElementById(`tickettouser${taskToRenderHTML['id']}`).innerHTML='';
  for(i=0;i<taskToRenderHTML['ticket_to_user'].length;i++){
    let id = `tickettouser${taskToRenderHTML['id']}-${taskToRenderHTML['ticket_to_user'][i].id}`;
    document.getElementById(`tickettouser${taskToRenderHTML['id']}`).innerHTML+=`
    <span id="${id}" class="colortext">${taskToRenderHTML['ticket_to_user'][i].username}</span>`;
  }
}

/**
 * Collects all data from the PopUp-Form
 * @returns task -> Json for Server-Request, taskToRenderHTML -> Json for HTML-Changes
 */
function collectTicketDataFromPopUp(){
  ticketId=actTicketId;
  title=document.getElementById('ticket_title').value;
  description=document.getElementById('ticket_description').value;
  createdat=document.getElementById('ticket_created_at').value;
  duedate=document.getElementById('ticket_duedate').value;
  console.log('Listen-Nummer-ID ',actListId);
  prio=getValueOfSelectedIteminDropDownField('ticket_prio');
  let result = getSelectedUsersAsArray();
  usersId = result.val1;
  usersName = result.val2;

  let tickettouser=[];
  let tickettouserHTML=[];
  for (i=0;i<result.val1.length;i++){
    tickettouserHTML.push({"id": result.val1[i], "username": result.val2[i]});
    tickettouser.push(+result.val1[i]);
  }

  task={
    "id": actTicketId,
    "ticket_created_at": document.getElementById('ticket_created_at').value,
    "ticket_description": document.getElementById('ticket_description').value,
    "ticket_duedate": document.getElementById('ticket_duedate').value,
    "ticket_list": actListId,
    "ticket_prio": getValueOfSelectedIteminDropDownField('ticket_prio'),
    "ticket_title": document.getElementById('ticket_title').value,
    "ticket_to_user": tickettouser
  }
  taskToRenderHTML={
    "id": actTicketId,
    "ticket_created_at": document.getElementById('ticket_created_at').value,
    "ticket_description": document.getElementById('ticket_description').value,
    "ticket_duedate": document.getElementById('ticket_duedate').value,
    "ticket_list": document.getElementById('ticket_list').value,
    "ticket_prio": getValueOfSelectedIteminDropDownField('ticket_prio'),
    "ticket_title": document.getElementById('ticket_title').value,
    "ticket_to_user": tickettouserHTML
  }
  return {task, taskToRenderHTML};
}

/**
 * Creates a new Ticket
 * @param {JSON} task Json for Server-Request
 * @param {JSON} taskToRenderHTML Json for HTML-Changes
 */
async function createTicket(task,taskToRenderHTML){
  let createNewTicketAtServer = await sendRequest('POST','/tickets/',task);
  console.log('ANTWORT DES POST-REQUESTS: ',createNewTicketAtServer);
  taskToRenderHTML['id']=createNewTicketAtServer['id'];
  renderTicket(taskToRenderHTML);
  renderUsersOfTicket(taskToRenderHTML);
}

/**
 * Answers the question if it is a brand-new ticket
 * @returns true if there is no ticket id
 */
function brandNewTicket(){
  return actTicketId == '';
}

/**
 * Answers the question if it is a brand-new ticket
 * @param {JSON} taskToRenderHTML Json for HTML-Changes
 * @returns true if ticket gets a new list id
 */
function updateTicketWithListchanged(taskToRenderHTML){
  return actListId != taskToRenderHTML['ticket_list'];
}

/**
 * If the save-button of the PopUp-Formular gets pressed
 */
async function saveTicket() {
  let task = collectTicketDataFromPopUp().task;
  let taskToRenderHTML = collectTicketDataFromPopUp().taskToRenderHTML;

  if(brandNewTicket()){
    createTicket(task,taskToRenderHTML);
  }
  else if (updateTicketWithListchanged(taskToRenderHTML))
  {
    updateTicket(taskToRenderHTML);
    let updateTicketAtServer = await sendRequest('PUT','/tickets/', task);
    console.log('ANTWORT DES PUT-REQUESTS: ',updateTicketAtServer);
    currentDraggedElement = document.getElementById(taskToRenderHTML['id']);
    parentElementofDraggedElement = currentDraggedElement.parentNode;
    placeTicketInAnotherList(containerIDs[document.getElementById('ticket_list').value-1],taskToRenderHTML['ticket_list']);
    removeTicketFromFormerList();
  }
  else
  {
    updateTicket(taskToRenderHTML);
    let updateTicketAtServer = await sendRequest('PUT','/tickets/', task);
    console.log('ANTWORT DES PUT-REQUESTS: ',updateTicketAtServer);
  }
    closeTicket();
}

/**
 * Deletes a Ticket, but not if PopUp is opened for new ticket!
 * @param {string} ticketId Uses actTicket if no ticketId is provided at function-call
 */
async function deleteTicket(ticketId = actTicketId) {
  if (ticketId !== '') {
    removeTicket(ticketId);
    task={"id": ticketId, }
    let deleteTicketFromServer = await sendRequest('DELETE','/tickets/',task);
    console.log('ANTWORT DES DELETE-REQUESTS: ',deleteTicketFromServer);
    closeTicket();
  }
}

/**
 * Loads Data from Server via GET-Request
 */
async function loadDataForHTML(){
  task={};
  let ticketsFromServer = await sendRequest('GET','/tickets/', task);
  renderTickets(ticketsFromServer);
  let usersFromServer = await sendRequest('GET','/users/', task);
  renderUsers(usersFromServer);
};

/**
 * Renders tickets into the HTML
 * @param {JSON} jsonFromServer 
 */
function renderTickets(jsonFromServer){
  console.log(jsonFromServer);
  for(i=0;i<jsonFromServer.length;i++){
    renderTicket(jsonFromServer[i]);
    renderUsersOfTicket(jsonFromServer[i]);
  }
}

/**
 * Renders tickets into the HTML
 * @param {JSON} singleTicket 
 */
function renderTicket(singleTicket){
containerId=containerIDs[singleTicket.ticket_list-1];
ticketId=singleTicket.id;
title=singleTicket.ticket_title;
description=singleTicket.ticket_description;
createdAt=singleTicket.ticket_created_at;
dueDate=singleTicket.ticket_duedate;
prio=singleTicket.ticket_prio;
listId=singleTicket.ticket_list;
ticketToUser=singleTicket.ticket_to_user;

document.getElementById(containerId).innerHTML+=`
<div class="ticket" id="${ticketId}" draggable="true" ondragstart="startDragging(${ticketId})">
  <span>Title: <span id="title${ticketId}" class="colortext">${title}</span></span>
  <span>Description: <span id="description${ticketId}" class="colortext">${description}</span></span> 
  <span>Created at: <span id="createdat${ticketId}" class="colortext">${switchYearAndDayOfDate(createdAt,'-')}</span></span>
  <span>Due date: <span id="duedate${ticketId}" class="colortext">${switchYearAndDayOfDate(dueDate,'-')}</span></span>
  <span>Priority: <span id="prio${ticketId}" class="colortext">${prio}</span></span>
  <span>Users: 
    <span id="tickettouser${ticketId}" class="colortext"></span>
  </span>
  <div id="editTicket${ticketId}"><div class="ticket-edit" onclick="editTicket('${ticketId}',${listId})"><img  src="../../../static/img/edit16.png"></div></div>
  <div class="ticket-delete" onclick="deleteTicket(${ticketId})"><img  src="../../../static/img/delete16.png"></div>
</div>
`;
}

function renderUsersOfTicket(singleTicket){
ticketId=singleTicket.id;
ticketToUser=singleTicket.ticket_to_user;
for(j=0;j<ticketToUser.length;j++){
  document.getElementById(`tickettouser${ticketId}`).innerHTML+=`
  <span id="tickettouser${ticketId}-${ticketToUser[j].id}" class="colortext">${ticketToUser[j].username}</span>`;
};
}

function renderUsers(usersFromServer){
  console.log(usersFromServer);
  for(j=0;j<usersFromServer.length;j++){
    document.getElementById('ticket_to_user').innerHTML+=`
    <li class="mdl-list__item">
    <span class="mdl-list__item-primary-content">
      <i class="material-icons  mdl-list__item-avatar">person</i>
      <b id='username-${usersFromServer[j].id}'>${usersFromServer[j].username}</b>
    </span>
    <span class="mdl-list__item-secondary-action">
      <label onclick="selectUser('user-${usersFromServer[j].id}')" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="list-checkbox-1">
        <input type="checkbox" id="user-${usersFromServer[j].id}" class="mdl-checkbox__input"/>
      </label>
    </span>
  </li>`;
  };
}

/**
 * Sends a Message to the chat
 */
async function sendRequest(method, url, task) {
  console.log(method,' ', url,' Task: ', task);
  let fd = getDataFromMessageForm(task).fd;
  let hds = getDataFromMessageForm(task).hds;

  try {
    showLoadingAnimation();
    return await waitingForServerResponse(method,url,fd,hds,task);
  }
  catch (e) {
    console.log('Fehler   ',e);
    showOperationFailed();
  }
}

/**
 * Fetches Data from the messageField
 * @returns Form-Data-Object
 */
function getDataFromMessageForm(task) {
  let fd = new FormData();
  let hds = new Headers();
  hds.append('Authorization', 'Token bba75e9f47dc83ccea62aee1904a78136837a184');

  if(task['id'] !== undefined){fd.append('id', task['id'])};
  if(task['ticket_title'] !== undefined){fd.append('ticket_title', task['ticket_title'])};
  if(task['ticket_description'] !== undefined){fd.append('ticket_description', task['ticket_description'])};
  if(task['ticket_created_at'] !== undefined){fd.append('ticket_created_at', task['ticket_created_at'])};
  if(task['ticket_duedate'] !== undefined){fd.append('ticket_duedate', task['ticket_duedate'])};
  if(task['ticket_list'] !== undefined){fd.append('ticket_list', task['ticket_list'])};
  if(task['ticket_prio'] !== undefined){fd.append('ticket_prio', task['ticket_prio'])};
  if(task['ticket_to_user'] !== undefined){fd.append('ticket_to_user', task['ticket_to_user'])};
  
  return {fd,hds};
}

/**
 * Makes a Request to the server (GET, POST, DELETE, PUT)
 * @param {Object} fd Form-Data-Object
 * @returns a JSON
 */
async function waitingForServerResponse(method,url,fd,hds,task) {
    let response;

  if(method=='GET'){
    response = await fetch(`${url}`, {method: method});
  }
  else if(method=='POST'){
    response = await fetch(`${url}`, {method: method, body: fd, headers: hds});
  }
  else{
    response = await fetch(`${url}${task['id']}/`, {method: method, body: fd, headers: hds});
  }

  let json = await response.json();
  showOperationSuccessful();
  return json;
}

/**
 * Get Token for username with password
 */
async function getToken(){
  let fd = new FormData();
  fd.append('username', 'tullrich');
  fd.append('password', 'tullrich');
  let hds = new Headers();
  hds.append('Authorization', 'Token bba75e9f47dc83ccea62aee1904a78136837a184');

  receivedToken = await fetch(`/get-token/`, {method: 'POST', body: fd, headers: hds});
  console.log(receivedToken);
}

/**
 * Shows Loading Animation
 */
function showLoadingAnimation() {
  document.getElementById('spinner').classList.add('d-flex');
}

/**
 * Removes Loading-Animation
 */
function removeLoadingAnimation() {
  document.getElementById('spinner').classList.remove('d-flex');
}

/**
 * Shows OK-Message in the header
 */
function showOkMessage(){
  // document.getElementById('error').classList.add('d-none');
  // document.getElementById('ok').classList.remove('d-none');
    setTimeout(() => {
      // document.getElementById('ok').classList.add('d-none');
  }, 1000);
}

/**
 * Shows Error-Message in the header
 */
function showErrorMessage(){
  // document.getElementById('error').classList.remove('d-none');
  // document.getElementById('ok').classList.add('d-none');
}

/**
 * Request was successful
 */
function showOperationSuccessful(){
  removeLoadingAnimation();
  showOkMessage();
}

/**
 * Request failed
 */
function showOperationFailed(){
  removeLoadingAnimation();
  showErrorMessage();
}