class Room{
    _users = [];
    _messagaes = [];
    constructor(code,user) {
        this._code = code;
        this._users.push(user)
        this._admin = user;
        this._messagaes = []
    }

    get admin() {
        return this._admin;
    }

    get code() {
        return this._code;
    }

    get users() {
        return this._users;
    }

    get messagaes() {
        return this._messagaes;
    }

    addUser(user) {
        let index = this._users.findIndex(user);
        if (index >= 0)
            this._users.push(user);
        else throw new Error("User already exists");
    }

    removeUser(user) {
        if (user == this._admin) {
            this.removeAdmin();
        }
        else {

            let index = this._users.findIndex(user);
            if (index >= 0)
                this._users.splice(index, 1);
            else throw new Error("User Doesnt exists");
        }
    }

    removeAdmin() {
        if (this._users.length < 2) {
            throw new Error("Not enough users to sustain the chat");
        }
        else {
            this._users.splice(0, 1);
            this._admin=this._users[0];
        }
        
    }
    


}

module.exports = Room;