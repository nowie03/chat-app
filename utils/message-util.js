class Message{
    constructor(message, sentBy, time) {
        this._message = message;
        this._sentBy = sentBy;
        this._time = time;
    }

    get message() {
        return this._message;
    }

    get sentBy() {
        return this._sentBy;
    }

    get time() {
        return this._time;
    }

    set message(message) {
        this._message = message;

    }

    set time(time) {
        this._time = time;

    }

    set sentBy(sentBy) {
        this._sentBy = sentBy;
    }
}


module.exports = Message;

