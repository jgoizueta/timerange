/**
 *   A TimeRange consists of a time interval (start, end times, representing t such that start <= t < end)
 *   and a resolution.
 *   This can be represented uniquely as a text (abbreviated form),
 *   and has an implicit duration (in the resolution units).
 *   The interval can be represented in ISO format, but it doesn't determine
 *   the time range, since the same interval can be interpreted at different resolutions
 *   (e.g. 1 year, 365 days, ...). The interval (start, end times) need to
 *   be consistent with the resolution units (lie at unit boundaries).
 *   A TimeRange doesn't keep track of the time zone; all methods that involve multiple time
 *   ranges or time instants assume they all share the same reference time zone.
 *   The ordinal time values used here are UNIX-like epoch values, but we assume them to correspond to the reference time zone,
 *   not necessarily UTC.
 */


const { timeStartEndToText, textToTimeStartEnd, roundDateValue, incDateValue, compareResolutions } = require('./conversions');
const { dateValue } = require('./time');
TimeInstant = require('./timeinstant');

function startEndTimeValues (value, attr) {
    const { start, end, resolution } = textToTimeStartEnd(value);
    return [dateValue(...start), dateValue(...end), { resolution, [attr]: value }];
}

function minResolution(r1, r2) {
    return compareResolutions(r1, r2) < 0 ? r1 : r2;
}


module.exports = class TimeRange {
    constructor (startValue, endValue, { text=null, iso=null, duration=null, resolution=null }) {
        // TODO: support empty TR when startValue >= endValue
        this._text = text;
        this._iso = iso;
        this._startValue = startValue;
        this._endValue = endValue;
        this._resolution = resolution;
        this._duration = duration;
    }

    static fromText (text) {
        return new TimeRange(...startEndTimeValues(text, 'text'));
    }

    static fromISO (iso) {
        return new TimeRange(...startEndTimeValues(iso, 'iso'));
    }

    static fromStartEndValues (startValue, endValue, resolution=null) {
        return new TimeRange(startValue, endValue, { resolution });
    }

    static fromStartEnd (start, end, resolution=null) {
        return TimeRange.fromStartEndValues(start.value, end.value, resolution);
    }

    static fromStartValueDuration (startValue, duration, resolution, adjust='floor') {
        startValue = roundDateValue(startValue, resolution, adjust);
        const endValue = incDateValue(startValue, resolution, duration);
        return TimeRange.fromStartEndValues(startValue, endValue, resolution);
    }

    static fromStartDuration (start, duration, resolution, adjust='floor') {
        return TimeRange.fromStartValueDuration(start.value, duration, resolution, adjust);
    }

    in(resolutionUnits) {
        return TimeRange.fromStartEndValues(this._startValue, this._endValue, resolutionUnits);
    }

    get durationSeconds () {
        return (this._endValue - this._startValue)/1000;
    }

    get text () {
        if (this._text === null) {
            this._set();
        }
        return this._text;
    }

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

    get iso () {
        if (this._iso === null) {
            this._set();
        }
        return this._iso;
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
            minResolution(this.resolution, other.resolution)
        );
    }

    union (other) { // envelope, hull, extension, ... (smallest interval containing both this and other)
        return TimeRange.fromStartEndValues(
            Math.min(this.startValue, other.startValue),
            Math.max(this.endValue, other.endValue),
            minResolution(this.resolution, other.resolution)
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
