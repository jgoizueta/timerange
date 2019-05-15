const { msToDate, dateValue, valueComponents } = require('./time');
const { timeStartEndToText } = require('./conversions');

// Time zone-less dates.
// This represent a time instant (point in time) as a
// epoch milliseconds value or as structured fields (up to second precision).
// in reference to some unspecified time zone.
// The idea is that this represent a date, just like a Date object,
// but in relation ot some externally defined time zone
// so we want to avoid the time zone handling that Date does.
// These dates cannot be converted from the TZ they're specified in,
// not even to/from UTC.
module.exports = class TimeInstant {
    constructor (milliseconds) {
        this._value = milliseconds;
        this._date = msToDate(milliseconds);
    }
    static fromValue (milliseconds) {
        return new TimeInstant(milliseconds);
    }
    static fromComponents (components) {
        return this.fromValue(dateValue(...components));
    }
    // static fromUTCDate (date) {
    //     return this.fromValue(date.getTime());
    // }

    get value () {
        return this._value;
    }

    get components () {
        return valueComponents(this._value);
    }

    get year () {
        return this._date.getUTCFullYear();
    }
    get month () {
        return this._date.getUTCMonth() + 1;
    }
    get day () {
        return this._date.getUTCDate();
    }
    get hour () {
        return this._date.getUTCHours();
    }
    get minute () {
        return this._date.getUTCMinutes();
    }
    get second () {
        return this._date.getUTCSeconds();
    }
    get text () {
        return timeStartEndToText(this._value, this._value + 1000).iso;
    }
}
