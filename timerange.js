const {
    timeStartEndToText,
    textToTimeStartEnd,
    roundDateValue,
    incDateValue,
    leastResolution
} = require('./conversions');
const { dateValue } = require('./time');
TimeInstant = require('./timeinstant');

function startEndTimeValues (value, attr) {
    const { start, end, resolution } = textToTimeStartEnd(value);
    return [dateValue(...start), dateValue(...end), { resolution, [attr]: value }];
}

/**
 * Class TimeRange represents an interval of time between to instants
 * It includes its start instant and excludes the end instant: start <= t < end.
 *
 * It also includes an underlying resolution, so that the same time span,
 * e.g. year 2018, can be represented as a 1-year or a 12-month time range, etc.
 *
 * Besides the standardized (ISO 8601) representation, e.g. 2018/2019 for year 2018,
 * (or more precisely, 2018-01-01T00:00:00/2019-01-01T00:00:00),
 * an abbreviated text form is supported, where 2018 would represent said interval,
 * and 2018-01..2018-12 would represent it with month resolution. Note that whereas
 * the ISO interval format excludes the final period, the abbreviated form is inclusive.
 *
 * Time ranges can hold single or multiple unit-of-time intervals such as a calender year,
 * month, day, hour, etc., as well as arbitrary intervals. Minimum resolution is in seconds.
 *
 * The interval start and end instants need to be consistent with the resolution units
 * (lie at unit boundaries).
 *
 * A TimeRange doesn't keep track of the time zone; all methods that involve multiple time
 * ranges or time instants assume they all share the same reference time zone.
 * The ordinal time values used here are UNIX-like epoch values, but we assume them to
 * correspond to the reference time zone, not necessarily UTC.
 *
 * @param {String} text - abbreviated text representation of the range
 * @param {String} iso - ISO 8601 form
 * @param {Number} startValue - start of the range as elapsed milliseconds since a timezone-specific epoch
 * @param {Number} endValue - end of the range as elapsed milliseconds since a timezone-specific epoch
 * @param {TimeInstant} start - structured form of the start of the range
 * @param {TimeInstant} end - structured form of the end of the range
 * @param {Number} duration - length of the period in the units of resolution
 * @param {String} resolution - units of resolution
 *
 * @name TimeRange
 * @api
 * */
module.exports = class TimeRange {
    constructor (startValue, endValue, { text=null, iso=null, duration=null, resolution=null }) {
        this._text = text;
        this._iso = iso;
        this._startValue = startValue;
        this._endValue = endValue;
        this._resolution = resolution;
        this._duration = duration;
    }

    /**
     * Construct a TimeRange from an time range string
     *
     * @param {String} text - Abbreviated ISO-formatted string (e.g. `'2018-03'`)
     * @return {TimeRange}
     * @api
     */
    static fromText (text) {
        return new TimeRange(...startEndTimeValues(text, 'text'));
    }

    /**
     * Construct a TimeRange from an ISO 8601 interval string
     *
     * @param {String} iso - Interval string (e.g. `'2018-03/04'`)
     * @return {TimeRange}
     * @api
     */
    static fromISO (iso) {
        return new TimeRange(...startEndTimeValues(iso, 'iso'));
    }

    /**
     * Construct a TimeRange from start and end epoch values in milliseconds.
     *
     * @param {Number} startValue - start of the range as elapsed milliseconds since a timezone-specific epoch
     * @param {Number} endValue - end of the range as elapsed milliseconds since a timezone-specific epoch
     * @return {TimeRange}
     * @api
     */
    static fromStartEndValues (startValue, endValue, resolution=null) {
        return new TimeRange(startValue, endValue, { resolution });
    }

    /**
     * Construct a TimeRange from start and end time instants
     *
     * @param {TimeInstant} start - start of the range
     * @param {TimeInstant} end - end of the range
     * @return {TimeRange}
     * @api
     */
    static fromStartEnd (start, end, resolution=null) {
        return TimeRange.fromStartEndValues(start.value, end.value, resolution);
    }

    /**
     * Construct a TimeRange from start value in milliseconds and duration
     *
     * @param {Number} startValue - start of the range as elapsed milliseconds since a timezone-specific epoch
     * @param {Number} duration - number of units of resolution in the period
     * @param {String} resolution - units of resolution ('millennium', 'century', 'year', ...)
     * @param {String} adjust - optional rounding mode ('floor', 'ceil') applied to start value
     * @return {TimeRange}
     * @api
     */
    static fromStartValueDuration (startValue, duration, resolution, adjust='floor') {
        startValue = roundDateValue(startValue, resolution, adjust);
        const endValue = incDateValue(startValue, resolution, duration);
        return TimeRange.fromStartEndValues(startValue, endValue, resolution);
    }

    /**
     * Construct a TimeRange from start and duration
     *
     * @param {TimeInstant} start - start of the range
     * @param {Number} duration - number of units of resolution in the period
     * @param {String} resolution - units of resolution ('millennium', 'century', 'year', ...)
     * @param {String} adjust - optional rounding mode ('floor', 'ceil') applied to start value
     * @return {TimeRange}
     * @api
     */
    static fromStartDuration (start, duration, resolution, adjust='floor') {
        return TimeRange.fromStartValueDuration(start.value, duration, resolution, adjust);
    }

    /**
     * Convert a time range to a different resolution, e.g.
     * TimeRangel.fromText('2018').in('month').text // => '2018-01..2018-12'
     *
     * @param {String} resolutionUnits - new resolution units ('millennium', 'century', ...)
     * @return {TimeRange}
     * @api
     */
    in(resolutionUnits) {
        return TimeRange.fromStartEndValues(this._startValue, this._endValue, resolutionUnits);
    }

    /**
     * Duration of a time range in seconds
     *
     * @return {Number}
     * @api
     */
    get durationSeconds () {
        return (this._endValue - this._startValue)/1000;
    }

    /**
     * Abbreviated text representation of a time range. For simple calendar units
     * a simple form such as '2018-03' (month), '2018-03-01T11' (hour) is used,
     * and for compound periods two such representations are joined with a '..',
     * e.g. '2018-03..2018-04' or '2018-03..04' (a two-month period). Note that,
     * unlike the ISO interval format or the start/end properties, this is includes
     * the full final period (after the two dots).
     *
     * @return {String}
     * @api
     */
    get text () {
        if (this._text === null) {
            this._set();
        }
        return this._text;
    }

    /**
     * ISO 8601 text representation as a time interval.
     *
     * @return {String}
     * @api
     */
    get iso () {
        if (this._iso === null) {
            this._set();
        }
        return this._iso;
    }

    /**
     * Check if a time range is null (zero duration)
     *
     * @return {Boolean}
     * @api
     */
    get isEmpty () {
        return this._startValue >= this._endValue;
    }

    _set () {
        if (this.isEmpty) {
            this._iso = this._text = '';
            this._duration = 0;
        }
        else {
            const { iso, resolution, abbr, duration } = timeStartEndToText(this._startValue, this._endValue, this._resolution, false);
            this._iso = iso;
            this._text = abbr;
            this._duration = duration;
            this._resolution = resolution;
        }
    }

    get startValue () {
        return this._startValue;
    }

    get endValue () {
        return this._endValue;
    }

    get start () {
        return TimeInstant.fromValue(this._startValue, this._timeZone);
    }

    get end () {
        return TimeInstant.fromValue(this._endValue, this._timeZone);
    }

    // Calendar resolution: the range is delimited by these calendar units
    get resolution () {
        if (this._resolution === null) {
            this._set();
        }
        return this._resolution;
    }

    // Duration in calendar resolution units. 1 for single calendar units
    // (largest possible resolution not crossing calendar boundaries)
    get duration () {
        if (this._duration === null) {
            this._set();
        }
        return this._duration;
    }

    // Is a single calendar unit?
    get isCalendarUnit () {
        if (this._duration === null) {
            this._set();
        }
        return this._duration === 1;
    }

    contains (other) {
        return other.startValue >= this.startValue && other.endValue <= this.endValue;
    }

    isDisjoint (other) {
        return other.startValue >= this.endValue || other.endValue <= this.startValue;
    }

    // overlaps
    intersects (other) {
        return !this.isDisjoint(other);
    }

    // before
    precedes (other) {
        return other.startValue >= this.endValue;
    }

    // after
    succeeds (other) {
        return this.startValue >= other.endValue; // other.precedes(this);
    }

    startsBefore (value) {
        return this.startValue < value;
    }

    endsBefore (value) {
        return this.endValue <= value;
    }

    startsAfter (value) {
        return this.startValue >= value;
    }

    endsAfter (value) {
        return this.endValue > value;
    }

    static *betweenValues (startValue, endValue, resolution, duration = 1) {
        for (let t = TimeRange.fromStartValueDuration(startValue, duration, resolution); t.endsBefore(endValue); t = t.next()) {
            yield t;
        }
    }

    static *between (start, end, resolution, duration = 1) {
        return betweenValues(start.value, end.value, resolution, duration);
    }

    // largest interval contained in both this and other
    intersection (other) {
        return TimeRange.fromStartEndValues(
            Math.max(this.startValue, other.startValue),
            Math.min(this.endValue, other.endValue),
            leastResolution(this.resolution, other.resolution)
        );
    }

    union (other) { // envelope, hull, extension, ... (smallest interval containing both this and other)
        return TimeRange.fromStartEndValues(
            Math.min(this.startValue, other.startValue),
            Math.max(this.endValue, other.endValue),
            leastResolution(this.resolution, other.resolution)
        );
    }

    // adjoint upper TR with same duration & resolution (& timeZone)
    next () {
        const startValue = this.endValue;
        const endValue = incDateValue(startValue, this.resolution, this.duration);
        return TimeRange.fromStartEndValues(
            startValue,
            endValue,
            this.resolution
        );
    }

    prev () {
        const endValue = this.startValue;
        const startValue = incDateValue(endValue, this.resolution, -this.duration);
        return TimeRange.fromStartEndValues(
            startValue,
            endValue,
            this.resolution
        );
    }

    equivalent (other) {
        return this.startValue == other.startValue && this.endValue == other.endValue;
    }

    identical (other) {
        return this.equivalent(other) && this.resolution == other.resolution;
    }
}
