const roomCodeHolder = document.querySelector(".room-code");
const usersList = document.querySelector(".list-group");
const userNameHolder = document.querySelector(".user-name");
const userImageHolder = document.querySelector(".user-image");
const userStatusIcon = document.querySelector(".user-status-icon");
const checkedIcon = "/public/img/checked.png";
const uncheckedIcon = "/public/img/multiply.png";
const messageContent = document.querySelector(".message-content");
const sendBtn = document.querySelector(".message-send");
const messageContainer = document.querySelector(".message-container");
const logoutIconList = document.querySelectorAll(".logout-icon");
const form = document.querySelector(".form");

const socket = io();
let USERNAME = location.href.split("=").splice(1, 1)[0];
let CODE = new URL(location.href).pathname.split("/").splice(2, 1)[0];
let USERINDEX = parseInt(
  usersList.lastElementChild.getAttribute("data-index")
);
let ISADMIN = false;

//emit a event from server that contains all userInfo
//if user===admin let him have spl privellages

console.log(
  "USERNAME :",
  USERNAME,
  " ",
  " CODE :",
  CODE,
  " USERINDEX :",
  USERINDEX
);

socket.emit("init",USERNAME);
console.log("SOCKET INIT EVENT EMITTED ", USERNAME);

socket.on("current-user", user => {
  USERNAME = user._name;
  USERINDEX = user._index;
  ISADMIN = user._isAdmin;
});

socket.on("messages", (data) => {
  data.forEach((message) => {
    if (message._sentBy === USERINDEX) {
      addMessageElement(
        message._message,
        message._time,
        message._sentBy,
        "message-sent"
      );
    } else {
      addMessageElement(
        message._message,
        message._time,
        message._sentBy,
        "message-received"
      );
    }
  });
});

socket.on("message-received", (data) => {
  console.log("MESSAGE-RECEIVED WITH DATA ", data);
  if (data.messageObj._sentBy !== USERINDEX || data.messageObj._sentBy === -1) {
    addMessageElement(
      data.messageObj._message,
      data.messageObj._time,
      data.userIndex,
      "message-received"
    );
  }
});

socket.on("user-join", (data) => {
  console.log("USER-JOINED WITH DATA ", data);
  let message = `${data.messageObj._message} joined the room`;
  addMessageElement(message, data.messageObj._time, -1, "message-received");
  if (data.messageObj._message !== USERNAME) {
    console.log(data.messageObj._sentBy, " ", data.userIndex);
    addUserElement(data.messageObj._message, data.userIndex);
  }
});

socket.on("user-left", (data) => {
  console.log("USER-LEFT WITH DATA :", data);
  let message = `${data.messageObj._message} left the room`;
  addMessageElement(message, data.messageObj._time, -1, "message-received");
  if (data.messageObj._message !== USERNAME)
    removeUserElement(data.messageObj._message, data.userIndex);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  console.log("MESSAGE SEND BUTTON CLICKED");
  socket.emit("message-sent", messageContent.value);
  console.log("MESSAGE_SENT EVENT EMITTED WITH DATA ", messageContent.value);
  let messageObj = {
    _message: messageContent.value,
    _sentBy: USERINDEX,
    _time: new Date().toLocaleTimeString(),
  };
  addMessageElement(
    messageObj._message,
    messageObj._time,
    USERINDEX,
    "message-sent"
  );
  messageContent.value = "";
});

logoutIconList.forEach((logoutIcon) => {
  logoutIcon.addEventListener("click", async (event) => {
    console.log("LOGOUT ICON CLICKED");
    socket.emit("user-left", USERNAME);
    console.log("USER-LEFT EVENT EMITTED WITH DATA", USERNAME);
    try {
      let res = await axios.put(
        `http://localhost:5000/room/${CODE}/delete?name=${USERNAME}`
      );
      console.log("ROOM RECEIVED AFTER DELETING USER ", res);
    } catch (error) {
      console.log("Error when deleting ", error);
    }

    window.location.assign("/");
  });
});

function addMessageElement(message, messageTime, index, classType) {
  const div = document.createElement("div");
  div.innerHTML = ` <img src="/public/png/${index}.png" class="user-icon-message" alt="">
    <p class="message-content d-inline text-break m-1 ">${message}</p>
    <div class="time text-end ">${messageTime}</div>`;
  div.classList.add("messagae", classType, "rounded", "p-2", "mb-2");
  messageContainer.append(div);
  messageContainer.scrollTop = messageContainer.scrollHeight;
  console.log(
    "MESSAGE ELEMENT ADDED WITH DATA ",
    message,
    " ",
    messageTime,
    " ",
    index,
    " ",
    classType
  );
}

function addUserElement(username, index) {
  const li = document.createElement("li");
  username = username.trim();
  li.innerHTML = `
  <div class="user position-relative">
  <img src="/public/png/${index}.png" class="user-image img-fluid" alt="">
  <p class="user-name m-1 p-2 d-inline text-wrap text-dark">
      ${username}
  </p>
  </div>
    `;
  li.setAttribute("id", username);
  li.classList.add("p-3", "mb-2", "rounded","list-group-item","d-flex");
  usersList.append(li);
  console.log("USER ELEMENT ADDED WITH DATA ", username, " ", index);
}

function removeUserElement(username) {
  let element = document.getElementById(username);
  if (element) element.remove();
  console.log("USER ELEMENT DELETED WITH DATA ", username);
}
