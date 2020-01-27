const {
    timeStartEndToText,
    textToTimeStartEnd,
    roundDateValue,
    incDateValue,
    leastResolution,
    FORMATTERS
} = require('./conversions');
const {
    dateValue,
    MS_PER_DAY,
    MS_PER_HOUR,
    MS_PER_MINUTE,
    MS_PER_S,
    AVG_MS_PER_YEAR,
    AVG_MS_PER_MONTH,
    DAY
} = require('./time');
const TimeInstant = require('./timeinstant');

const MS_PER = [
    AVG_MS_PER_YEAR,  // YEAR
    AVG_MS_PER_MONTH, // MONTH
    MS_PER_DAY,       // DAY
    MS_PER_HOUR,      // HOUR
    MS_PER_MINUTE,    // MINUTE
    MS_PER_S          // SECOND
];

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
     * Valid resolution values: millennium', 'century', 'decade', 'year', 'semester',
     * 'trimester', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second'.
     *
     * @param {Number} startValue - start of the range as elapsed milliseconds since a timezone-specific epoch
     * @param {Number} endValue - end of the range as elapsed milliseconds since a timezone-specific epoch
     * @param {String} resolution - optional units of resolution. Start and end should respect its boundaries.
     * If this is not specified, the largest possible resolution not interrupted by the start or end will be used.
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
     * @param {String} resolution - optional units of resolution; see fromStartEndValues.*
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
     * Construct a TimeRange from start and duration.
     * If the resolution is not specified,
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
     * Duration of a time range in resolution units
     *
     * @param {String} units - resolution units ('millennium', 'century', ...)
     * @return {Number}
     * @api
     */
    durationIn (units) {
        const ufmt = FORMATTERS[units];
        const fmt = FORMATTERS[this.resolution];
        const durationUnits = this.duration * fmt.numUnits; // duration in fmt.units
        if (ufmt.unit === fmt.unit) {
            // exact
            return durationUnits / ufmt.numUnits;
        }
        if (ufmt.unit >= DAY && fmt.unit >= DAY) {
            // exact
            return durationUnits * MS_PER[fmt.unit] / MS_PER[ufmt.unit];
        }

        // average
        return durationUnits * MS_PER[fmt.unit] / MS_PER[ufmt.unit];
        // return this.durationSeconds / MS_PER(units) * 1000;
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

    /**
     * Start of the interval (inclusive) as elapsed milliseconds since a timezone-specific epoch
     *
     * @return {Number}
     * @api
     */
    get startValue () {
        return this._startValue;
    }

    /**
     * End of the interval (exclusive) as elapsed milliseconds since a timezone-specific epoch
     *
     * @return {Number}
     * @api
     */
    get endValue () {
        return this._endValue;
    }

    /**
     * Start of the interval (inclusive) as TimeInstant
     *
     * @return {TimeInstant}
     * @api
     */
    get start () {
        return TimeInstant.fromValue(this._startValue, this._timeZone);
    }

    /**
     * End of the interval (exclusive) as TimeInstant
     *
     * @return {TimeInstant}
     * @api
     */
    get end () {
        return TimeInstant.fromValue(this._endValue, this._timeZone);
    }

    // Calendar resolution: the range is delimited by these calendar units
    /**
     * Calendar units of resolution of the time range; the limits (start and end)
     * should not break such units.
     * Possible values: 'millennium', 'century', 'decade', 'year', 'semester',
     * 'trimester', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second'.
     *
     * @return {String}
     * @api
     */
    get resolution () {
        if (this._resolution === null) {
            this._set();
        }
        return this._resolution;
    }


    /**
     * Duration of the time range in the calendar units of resolution.
     * This returns 1 for single-calendar-unit ranges.
     *
     * @return {Number}
     * @api
     */
    get duration () {
        if (this._duration === null) {
            this._set();
        }
        return this._duration;
    }

    /**
     * Is the time range a single calendar unit?
     *
     * @return {Boolean}
     * @api
     */
    get isCalendarUnit () {
        if (this._duration === null) {
            this._set();
        }
        return this._duration === 1;
    }

    /**
     * Does the time range contains completely another time range?
     *
     * @param {TimeRange} other - time range to be checked for inclusion
     * @return {Boolean} True if other completely within this range
     * @api
     */
    contains (other) {
        return other.startValue >= this.startValue && other.endValue <= this.endValue;
    }

    /**
     * Are two time ranges disjoint (non-overlapping)?
     *
     * @param {TimeRange} other - time range to be checked for intersection
     * @return {Boolean} True if this and the other ranges do not overlap
     * @api
     */
    isDisjoint (other) {
        return other.startValue >= this.endValue || other.endValue <= this.startValue;
    }

    /**
     * Do two time ranges intersect (overlap)?
     *
     * @param {TimeRange} other - time range to be checked for intersection
     * @return {Boolean} True if this and the other ranges overlap
     * @api
     */
    intersects (other) {
        return !this.isDisjoint(other);
    }

    /**
     * Does this range precedes (occurs before) another?
     *
     * @param {TimeRange} other - time range to be checked
     * @return {Boolean} True if this range ends before the start of the other
     * @api
     */
    precedes (other) {
        return other.startValue >= this.endValue;
    }

    /**
     * Does this range succeeds (occurs after) another?
     *
     * @param {TimeRange} other - time range to be checked
     * @return {Boolean} True if this range starts after the end of the other
     * @api
     */
    succeeds (other) {
        return this.startValue >= other.endValue; // other.precedes(this);
    }

    /**
     * Does this range starts before a time instant value?
     *
     * @param {Number} value - time instant as elapsed milliseconds since a timezone-specific epoch
     * @return {Boolean} True if this range starts before the instant
     * @api
     */
    startsBefore (value) {
        return this.startValue < value;
    }

    /**
     * Does this range ends before a time instant value?
     *
     * @param {Number} value - time instant as elapsed milliseconds since a timezone-specific epoch
     * @return {Boolean} True if this range ends before the instant
     * @api
     */
    endsBefore (value) {
        return this.endValue <= value;
    }

    /**
     * Does this range starts after a time instant value?
     *
     * @param {Number} value - time instant as elapsed milliseconds since a timezone-specific epoch
     * @return {Boolean} True if this range starts after the instant
     * @api
     */
    startsAfter (value) {
        return this.startValue >= value;
    }

    /**
     * Does this range ends after a time instant value?
     *
     * @param {Number} value - time instant as elapsed milliseconds since a timezone-specific epoch
     * @return {Boolean} True if this range ends after the instant
     * @api
     */
    endsAfter (value) {
        return this.endValue > value;
    }

    /**
     * Generator of all consecutive time ranges between two instant values.
     *
     * @param {Number} startValue - start time instant as elapsed milliseconds since a timezone-specific epoch
     * @param {Number} endValue - end time instant (returned ranges will not reach this time)
     * @param {String} resolution - resolution of the returned ranges
     * @param {String} duration - duration of the ranges (in the resolution units); by default 1.
     * @return {TimeRange} True if this range ends after the instant
     * @api
     */
    static *betweenValues (startValue, endValue, resolution, duration = 1) {
        for (let t = TimeRange.fromStartValueDuration(startValue, duration, resolution); t.endsBefore(endValue); t = t.next()) {
            yield t;
        }
    }

    /**
     * Generator of all consecutive time ranges between two instants.
     *
     * @param {TimeInstant} start - start time instant
     * @param {TimeInstant} end - end time instant (returned ranges will not reach this time)
     * @param {String} resolution - resolution of the returned ranges
     * @param {String} duration - duration of the ranges (in the resolution units); by default 1.
     * @return {TimeRange} True if this range ends after the instant
     * @api
     */
    static *between (start, end, resolution, duration = 1) {
        yield* TimeRange.betweenValues(start.value, end.value, resolution, duration);
    }

    /**
     * Intersection of two ranges: largest interval contained in both ranges
     * (empty if they don't overlap).
     *
     * @param {TimeRange} other - time range to intersect with this one
     * @return {TimeRange} Intersection range
     * @api
     */
    intersection (other) {
        return TimeRange.fromStartEndValues(
            Math.max(this.startValue, other.startValue),
            Math.min(this.endValue, other.endValue),
            leastResolution(this.resolution, other.resolution)
        );
    }

    /**
     * Union (envelope/hull) of two ranges: smallest interval containing both ranges
     *
     * @param {TimeRange} other - time range to combine with this one
     * @return {TimeRange} union range
     * @api
     */
    union (other) {
        return TimeRange.fromStartEndValues(
            Math.min(this.startValue, other.startValue),
            Math.max(this.endValue, other.endValue),
            leastResolution(this.resolution, other.resolution)
        );
    }

    /**
     * Following adjacent time range with same duration and resolution
     *
     * @return {TimeRange} next range
     * @api
     */
    next () {
        const startValue = this.endValue;
        const endValue = incDateValue(startValue, this.resolution, this.duration);
        return TimeRange.fromStartEndValues(
            startValue,
            endValue,
            this.resolution
        );
    }

    /**
     * Preceding adjacent time range with same duration and resolution
     *
     * @return {TimeRange} previous range
     * @api
     */
    prev () {
        const endValue = this.startValue;
        const startValue = incDateValue(endValue, this.resolution, -this.duration);
        return TimeRange.fromStartEndValues(
            startValue,
            endValue,
            this.resolution
        );
    }

    /**
     * Are two ranges equal (same start and end instants)?
     * Note they could have different nominal resolutions.
     *
     * @param {TimeRange} other - time range to be compared with this one
     * @return {Boolean} True if ranges are equivalent
     * @api
     */
    equivalent (other) {
        return this.startValue == other.startValue && this.endValue == other.endValue;
    }

    /**
     * Are two ranges identical (same start, end and resolution)?
     *
     * @param {TimeRange} other - time range to be compared with this one
     * @return {Boolean} True if ranges are identical
     * @api
     */
    identical (other) {
        return this.equivalent(other) && this.resolution == other.resolution;
    }
}
