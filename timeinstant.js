const { msToDate, dateValue, valueComponents } = require('./time');
const { timeStartEndToText } = require('./conversions');

// Fixed-time-zone dates.
// This represent a time instant (point in time) as a
// epoch milliseconds value or as structured fields (up to second precision).
// It includes an optional informational time zone string that declares
// to what TZ this value is related.
// The idea is that this represent a date, just like a Date object,
// but in relation ot some externally defined time zone
// so we want to avoid the time zone handling that Date does.
// These dates cannot be converted from the TZ they're specified in,
// not even to/from UTC.
module.exports = class TimeInstant {
    constructor (milliseconds, tz = null) {
        this._value = milliseconds;
        this._date = msToDate(milliseconds);
        this._timeZone = tz; // informational
    }
    static fromValue (milliseconds, tz) {
        return new TimeInstant(milliseconds, tz);
    }
    static fromComponents (components, tz) {
        return this.fromValue(dateValue(...components), tz);
    }
    // static fromUTCDate (date) {
    //     return this.fromValue(date.getTime());
    // }
    static fromTZ (tz, ...components) {
        return this.fromComponents(components, tz);
    }

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
    get timeZone () {
        return this._timeZone;
    }
}
