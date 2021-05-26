const mongoose = require("mongoose");

const roomSchema = mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  admin: {
    type: Object,
    required: true,
  },
  users: {
    type: Array,
    required: true,
  },
  messages: {
    type: Array,
  },
});

const rooms = mongoose.model("room", roomSchema);

async function getRoom(code) {
  try {
    let doc = rooms.findOne({
      code: code,
    });
    return doc;
  } catch (error) {
    console.log("error when fetching room ", error);
  }
}

async function addRoom(room) {
  try {
    let roomDoc = await rooms.create({
      code: room.code,
      admin: room.admin,
      users: room.users,
      messages: room.messages,
    });
    return roomDoc;
  } catch (error) {
    console.log("error while saving to DB ", error);
  }
}

async function deleteRoom(code) {
  try {
    let doc = await rooms.findOneAndRemove({
      code: code,
    });
    return doc;
  } catch (error) {
    console.log("Error when deleting room ", error);
  }
}

async function addUser(code, user) {
  try {
    let doc = await rooms.findOneAndUpdate(
      {
        code: code,
      },
      {
        $push: {
          users: user,
        },
      },
      {
        new: true,
        useFindAndModify: false,
      }
    );
    return doc;
  } catch (error) {
    console.log("error when adding user ", error);
  }
}

async function deleteUser(code, name) {
  try {
    let doc = await rooms.findOneAndUpdate(
      {
        code: code,
      },
      {
        $pull: {
          users: {
            _name: name,
          },
        },
      },
      {
        new: true,
        useFindAndModify: false,
      }
    );
    if (doc.admin._name === name && doc.users.length>0) {
      let newAdmin = doc.users[0];
      try {
        doc =rooms.findOneAndUpdate({ code: code }, {
          $set: {
            admin: newAdmin,
            "users.$[user]._isAdmin": true,
          }
        }, {
          new: true,
          useFindAndModify: false,
          arrayFilters: [{
            "user._name":newAdmin._name
          }]
        })
      } catch (error) {
        console.log("error when updating admin ", error);
      }
    }
    return doc;
  } catch (error) {
    console.log("error when deleting user ", error);
  }
}

async function addConnectionToUser(code, name, socketID) {
  try {
    let doc = await rooms.findOneAndUpdate(
      {
        code: code,
      },
      {
        $set: {
          "users.$[orderItem]._connections": socketID,
        },
      },
      {
        new: true,
        useFindAndModify: false,
        arrayFilters: [
          {
            "orderItem._name": name,
          },
        ],
      }
    );
    return doc;
  } catch (error) {
    console.log("error when updating connections ", error);
  }
}

async function deleteConnectionToUser(code, name, socketID) {
  try {
    let roomDoc = rooms.findOneAndUpdate(
      {
        code: code,
      },
      {
        $set: { "users.$[user]._connections": socketID },
      },
      {
        new: true,
        useFindAndModify: false,
        arrayFilters: [
          {
            "user._name": name,
          },
        ],
      }
    );
    return roomDoc;
  } catch (error) {
    console.log("errror when deleting connection ", error);
  }
}

async function addMessage(code, message) {
  try {
    let doc = await rooms.findOneAndUpdate(
      {
        code: code,
      },
      {
        $push: {
          messages: message,
        },
      },
      {
        useFindAndModify: false,
        new: true,
      }
    );
    return doc;
  } catch (error) {
    console.log("error when adding message to db ", error);
  }
}

async function getMessages(code) {
  try {
    let doc = await rooms.findOne({
      code: code,
    });
    return doc.messages;
  } catch (error) {
    console.log("error when fecthing messages ", error);
  }
}

async function setUserJoinBrodcasted(code, name, value) {
  try {
    let room = rooms.findOneAndUpdate(
      {
        code: code,
      },
      {
        $set: {
          "users.$[user]._userJoinBrodcasted": value,
        },
      },
      {
        new: true,
        useFindAndModify: true,
        arrayFilters: [
          {
            "user._name": name,
          },
        ],
      }
    );
    return room;
  } catch (error) {
    console.log("error when adding userJoinBrodcasted to user ", error);
  }
}

module.exports = [
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
];
