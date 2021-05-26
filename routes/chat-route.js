const express = require("express");
const Room = require("../utils/room-util");
const User = require("../utils/user-util");
const Message = require("../utils/message-util");
const axios = require("axios");
const [
  getRoom,
  addRoom,
  deleteRoom,
  addUser,
  deleteUser,
  addConnectionToUser,
  addMessage,
  getMessages,
  deleteConnectionToUser,
  setUserJoinBrodcasted,
] = require("../schema/room-schema");
const { connection } = require("mongoose");

const router = express.Router();

router.get("/:code", fetchRoom, async (req, res) => {
  console.log("CHAT ROUTE GET MEHOD CALLED ");

  const CODE = req.params.code;
  const NAME = req.query.name;
  const USERS = res.room.users;
  const ROOM = CODE;
  const index = getUserIndex(USERS, NAME);
  let userJoinBrodcasted = false;
  let userConnection = null;

  let isAuthorizedUser = false;
  USERS.forEach((user) => {
    if (user._name === NAME) {
      isAuthorizedUser = true;
    }
  });

  if (isAuthorizedUser) {
    res.render("chat", {
      users: USERS,
      code: CODE,
    });
  } else {
    res.status(401).render("reload", {
      message: "User doesnt Exist",
      errorCode: 401,
    });
  }

  console.log(
    "CODE: ",
    CODE,
    " NAME: ",
    NAME,
    " USERS: ",
    USERS,
    " INDEX: ",
    index,
    " userConnection: ",
    userConnection,
    "userJoinBrodcasted ",
    userJoinBrodcasted
  );

  const io = req.app.get("io");
  io.once("connection", async (socket) => {
    console.log("SOCKET CONNECTED WITH ID ", socket.id);

    socket.on("init", async (data) => {
      socket.join(ROOM);
      console.log("SOCKET INIT METHOD RECEIVED WITH DATA :", data);
      try {
        let room = await updateRoom(req, res);
        console.log("ROOM RECEIVED AFTER UPDATING ROOM :", room);
      } catch (error) {
        console.log("error when updating room ", error);
      }
      try {
        let room = await addConnectionToUser(CODE, NAME, socket.id);
        console.log("ROOM RECEIVED AFTER ADDING CONNECTION TO USER :", room);
        if (room) {
          userConnection = getuserConnection(room.users, NAME);
          userJoinBrodcasted = isUserJoinBrodcasted(room.users, NAME);
        }
      } catch (error) {
        console.log(error);
      }

      console.log(
        "USERCONNECTON ",
        userConnection,
        " USERJOINBROADCASTED ",
        userJoinBrodcasted
      );
      if (userConnection && !userJoinBrodcasted) {
        let messageObj = new Message(data, -1, new Date().toLocaleTimeString());
        console.log(
          "USER JOIN METHOD EMITTED WITH DATA :",
          messageObj,
          " INDEX :",
          index
        );
        io.sockets.in(ROOM).emit("user-join", {
          messageObj: messageObj,
          userIndex: index,
        });
        try {
          let res = await setUserJoinBrodcasted(CODE, NAME, true);
          console.log("ROOM AFTER UPDATIN USERJOINEDBRODACST ", res);
        } catch (error) {
          console.log(error);
        }
      }
      //emit this to the socket that is askin
      let messages;
      try {
        messages = await getMessages(CODE);
      } catch (error) {
        console.log(error);
      }
      io.to(socket.id).emit("messages", messages);
      console.log("MESSAGES EMITTED WITH DATA ", messages);
      io.to(socket.id).emit("current-user", USERS[index]);
      console.log("CURRENT USER INFO SENT WITH DATA ", USERS[index]);
    });

    socket.on("user-left", async (data) => {
      console.log("USER LEFT EVENT RECEIVED WITH DATA ", data);
      try {
        let room = await updateRoom(req, res);
        console.log("ROOM RECEIVED AFTER UPDATING :", room);
      } catch (error) {
        console.log("error when updating room ", error);
      }
      let messageObj = new Message(data, -1, new Date().toLocaleTimeString());
      console.log(
        "USER_LEFT EVENT EMITTED WITH DATA :",
        messageObj,
        " INDEX: ",
        index
      );
      io.sockets.in(ROOM).emit("user-left", {
        messageObj: messageObj,
        userIndex: index,
      });
    });

    socket.on("disconnect", async () => {
      console.log("SOCKET DISCONNECTED  ", socket.id);
      let room;
      try {
        room = await deleteConnectionToUser(CODE, NAME, null);
        console.log("ROOM RECEIVED AFTER DELETING CONNECTION :", room);
      } catch (error) {
        console.log("error when deleting user");
      }
      let timeOut = setTimeout(async () => {
        userConnection = getuserConnection(room.users, NAME);
        if (!userConnection) {
          try {
            let res = await axios.put(
              `http://nowie-chat-app.herokuapp.com/room/${CODE}/delete?name=${NAME}`
            );
            console.log("ROOM RECEIVED AFTER DELETING USER ", res);
          } catch (error) {
            console.log("Error when deleting ", error);
          }
        }
      },1800000);
      console.log("TIME OUT RETURNED ", timeOut);
    });

    socket.on("message-sent", async (data) => {
      console.log("MESSAGE SENT EVENT RECEIVED WITH DATA: ", data);
      let messageObj = new Message(
        data,
        index,
        new Date().toLocaleTimeString()
      );
      try {
        let room = await addMessage(CODE, messageObj);
        console.log("ROOM RECEIVED AFTER ADDING MESSAGE :", room);
      } catch (error) {
        console.log(error);
      }
      console.log(
        "MESSAGE RECEIVED EVENT EMITTED WITH DATA:",
        messageObj,
        " INDEX: ",
        index
      );
      io.sockets.in(ROOM).emit("message-received", {
        sentid: socket.id,
        messageObj: messageObj,
        userIndex: index,
      });
    });
  });
});

async function fetchRoom(req, res, next) {
  console.log("FETCH METHOD CALLED ");
  let room;
  try {
    room = await getRoom(req.params.code);
    if (!room) {
      //render error page
      console.log("ROOM RECEIVED IN FETCH METHOD IS FALSY:", room);
      res.render("reload", { message: "ROOM DOESNT EXISTS", errorCode: 404 });
    }
  } catch (error) {
    res.render("reload", {
      message: "INTERNAL SERVER ERROR TRY AFTER SOME TIME",
      errorCode: 500,
    });
  }
  res.room = room;
  next();
}

async function updateRoom(req, res) {
  console.log("UPDATE ROOM METHOD CALLED ");
  let room;
  try {
    room = await getRoom(req.params.code);
    console.log("ROOM RECEIVED AFTER UPDATING ", room);
  } catch (error) {
    console.log(error);
  }
  if (!room) {
    //render error page
    console.log("ROOM RECEIVED IN UPDATE METHOD IS FALSY:", room);
    res.render("reload", { message: "ROOM DOESNT EXISTS", errorCode: 404 });
  }
}

function getuserConnection(users, name) {
  let connection = null;
  users.forEach((user) => {
    if (user._name === name) {
      connection = user._connections;
    }
  });
  return connection;
}

function getUserIndex(users, name) {
  for (let user of users) {
    if (user._name === name) {
      return user._index;
    }
  }
}

function isUserJoinBrodcasted(users, name) {
  for (let user of users) {
    if (user._name === name) return user._userJoinBrodcasted;
  }
}

module.exports = router;
