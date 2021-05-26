const { Connection } = require("mongoose");
const uuid = require("uuid")


class User{
    
    constructor(name,index,isAdmin=false) {
        this._name = name;
        this._id = uuid.v4().toString();
        this._index = index;
        this._connections = null;
        this._userJoinBrodcasted = false;
        this._isAdmin = isAdmin;
    }

    get isAdmin() {
        return this._isAdmin;
    }

    set admin(value) {
        this._isAdmin = value;
    }

    get userJoinBrodcasted(){
        return this._userJoinBrodcasted;
    }
    
    set userJoinBrodcasted(value) {
        this._userJoinBrodcasted = value;
    }


    get id(){
    return this._id;
    }

    get name() {
        return this._name;   
    }

    get index() {
        return this._index;
    }

    get connections() {
        return this._connections;
    }

    set index(index) {
        this._index = index;
    }

    set connections(connections) {
        this._connections=connections
    }

    addConnection(socketID) {
        this._connections.push(socketID);
    }

}

module.exports = User;

