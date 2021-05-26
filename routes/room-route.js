const express = require("express");
const Room = require("../utils/room-util");
const User = require("../utils/user-util");
const [
  getRoom,
  addRoom,
  deleteRoom,
  addUser,
  deleteUser,
] = require("../schema/room-schema");

const router = express.Router();

router.post("/:code", createRoom, (req, res) => {
  res.status(200).json(res.room);
});

router.get("/:code", fetchRoom, (req, res) => {
  res.status(200).json(res.room);
});

router.put("/:code/add", updateRoomAddUser, (req, res) => {
  res.status(200).json(res.room);
});

router.put("/:code/delete", updateRoomDelUser, (req, res) => {
  res.status(200).json(res.room);
});

router.delete("/:code", dumpRoom, (req, res) => {
    res.status(200).json(res.room);
})

//middlewares
async function fetchRoom(req, res, next) {
  let room;
  try {
    room = await getRoom(req.params.code);
    if (!room) {
      return res.status(205).json({ message: "Room doesnt exists" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.room = room;
  next();
}

async function createRoom(req, res, next) {
  //modify
  let userObj = new User(req.query.name,0,true);
  let roomObj = new Room(req.params.code, userObj),
    room;
  try {
     room = await addRoom(roomObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  res.room = room;
  next();
}

async function dumpRoom(req, res, next) {
    let room,roomDoc;
    try {
        roomDoc = await getRoom(req.params.code);
        if (!roomDoc) {
            return res.status(205).json({ message: "Room doesnt exists" });
        }
        room = await deleteRoom(roomDoc.code);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    res.room = room;
    next();
}

async function updateRoomAddUser(req, res, next) {
  console.log("update room add user called");
  let room,
    roomDoc;
  try {
    roomDoc = await getRoom(req.params.code);
    if (!roomDoc) {
      return res.status(205).json({ message: "Room doesnt exists" });
    }
    for (let user of roomDoc.users) {
      if (user._name === req.query.name) {
        return res.status(205).json({ data: "username already exists" });
      } 
    }
    let index = (roomDoc.users.length) ? roomDoc.users[roomDoc.users.length - 1]._index + 1 : 0;
    let userObj = new User(req.query.name, index);
    if (index === 0) userObj._isAdmin = true;
    await addUser(roomDoc.code, userObj);
    room= await getRoom(req.params.code);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.room = room;

  next();
}

async function updateRoomDelUser(req, res, next) {
  let room,
    roomDoc,
    userObj = new User(req.query.name);
  try {
    roomDoc = await getRoom(req.params.code);
    if (!roomDoc) {
      return res.status(205).json({ message: "Room doesnt exists" });
    }
    await deleteUser(roomDoc.code, userObj.name);
    room= await getRoom(req.params.code);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  if (room.users.length === 0) {
    try {
      await deleteRoom(req.params.code);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  res.room = room;
  next();
}

module.exports = router;
