const {
    dateValue,
    valueComponents,
    YEAR, MONTH, DAY, HOUR, MINUTE, SECOND,
    fullDate
} = require('./time');
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
    constructor (milliseconds, components) {
        this._value = milliseconds;
        this._components = components;
    }
    static fromValue (milliseconds) {
        return new TimeInstant(milliseconds, valueComponents(milliseconds));
    }
    static fromComponents (...components) {
        return new TimeInstant(dateValue(...components), fullDate(...components));
    }
    // static fromUTCDate (date) {
    //     return this.fromValue(date.getTime());
    // }

    get value () {
        return this._value;
    }

    get components () {
        return this._components;;
    }

    get year () {
        return this.components[YEAR];
    }
    get month () {
        return this.components[MONTH];
    }
    get day () {
        return this.components[DAY];
    }
    get hour () {
        return this.components[HOUR];
    }
    get minute () {
        return this.components[MINUTE];
    }
    get second () {
        return this.components[SECOND];
    }
    get text () {
        return timeStartEndToText(this._value, this._value + 1000).iso;
    }
}
