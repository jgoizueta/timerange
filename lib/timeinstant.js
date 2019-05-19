const {
    dateValue,
    valueComponents,
    YEAR, MONTH, DAY, HOUR, MINUTE, SECOND,
    fullDate
} = require('./time');
const { timeStartEndToText, textToTimeStartEnd } = require('./conversions');

/**
 * Class TimeInstant represent zone-less dates (and times).
 * A time instant (point in time) is represented as a epoch value in milliseconds
 * or as structured fields (components) up to seconds precision,
 * in reference to some unspecified time zone.
 *
 * The idea is that this represent a date, just like a Date object,
 * but in relation ot some externally defined time zone,
 * so we want to avoid the time zone handling that Date does.
 * These dates cannot be converted from the TZ they're specified in,
 * It also includes an underlying resolution, so that the same time span,
 * not even to/from UTC.
 *
 * Besides the standardized (ISO 8601) representation, e.g. 2018/2019 for year 2018,
 * (or more precisely, 2018-01-01T00:00:00/2019-01-01T00:00:00),
 * an abbreviated text form is supported, where 2018 would represent said interval,
 * and 2018-01..2018-12 would represent it with month resolution. Note that whereas
 * the ISO interval format excludes the final period, the abbreviated form is inclusive.
 *
 * @name TimeInstant
 * @api
 * */
module.exports = class TimeInstant {
    constructor (milliseconds, components) {
        this._value = milliseconds;
        this._components = components;
    }

    /**
     * Construct a TimeInstant from an epoch value in milliseconds.
     *
     * @param {Number} milliseconds - elapsed milliseconds since a timezone-specific epoch
     * @return {TimeInstant}
     * @api
     */
    static fromValue (milliseconds) {
        return new TimeInstant(milliseconds, valueComponents(milliseconds));
    }

    /**
     * Construct a TimeInstant from structured components (year, month, day, hour, minute, second)
     *
     * @param {Number} year
     * @param {Number} month (1-12; optional)
     * @param {Number} day (1-31; optional)
     * @param {Number} hour (0-23; optional)
     * @param {Number} minute (0-59; optional)
     * @param {Number} second (0-59; optional)
     * @return {TimeInstant}
     * @api
     */
    static fromComponents (...components) {
        return new TimeInstant(dateValue(...components), fullDate(...components));
    }

    /**
     * Construct a TimeInstant from text string (ISO 8601 format)
     *
     * @param {String} text
     * @return {TimeInstant}
     * @api
     */
    static fromText(text) {
        const { start } = textToTimeStartEnd(text);
        return TimeInstant.fromComponents(...start);
    }

    /**
     * Return the time instant value as epoch in milliseconds
     *
     * @return {Number} elapsed milliseconds since a timezone-specific epoch
     * @api
     */
    get value () {
        return this._value;
    }

    /**
     * Return the time instant structure components (year, month, day, hour, minute, second)
     *
     * @return {Array}
     * @api
     */
    get components () {
        return this._components;;
    }

    /**
     * Year of the time instant
     *
     * @return {Number}
     * @api
     */
    get year () {
        return this.components[YEAR];
    }

    /**
     * Month of the time instant (1-12)
     *
     * @return {Number}
     * @api
     */
    get month () {
        return this.components[MONTH];
    }

    /**
     * Day of the time instant (1-31)
     *
     * @return {Number}
     * @api
     */
    get day () {
        return this.components[DAY];
    }

    /**
     * Hour of the time instant (0-23)
     *
     * @return {Number}
     * @api
     */
    get hour () {
        return this.components[HOUR];
    }

    /**
     * Minute of the time instant (0-59)
     *
     * @return {Number}
     * @api
     */
    get minute () {
        return this.components[MINUTE];
    }

    /**
     * Second of the time instant (0-59)
     *
     * @return {Number}
     * @api
     */
    get second () {
        return this.components[SECOND];
    }

    /**
     * Time instant in text form (ISO 8601)
     *
     * @return {String}
     * @api
     */
    get text () {
        return timeStartEndToText(this._value, this._value + 1000).abbr;
    }
}