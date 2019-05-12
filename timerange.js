const { timeStartEndToText, textToTimeStartEnd, addDurationToDateValue } = require('./conversions');
const { dateValue } = require('./time');
TimeInstant = require('./timeinstant');

function startEndTimeValues (value, attr) {
    const { start, end, resolution } = textToTimeStartEnd(value);
    return [dateValue(...start), dateValue(...end), { resolution, [attr]: value }];
}

module.exports = class TimeRange {
    constructor (tz, startValue, endValue, { text=null, iso=null, duration=null, resolution=null }) {
        // TODO: support empty TR wnen startValue >= endValue
        this._text = text;
        this._iso = iso;
        this._startValue = startValue;
        this._endValue = endValue;
        // The timezone of a TimeRange is merely informative.
        // No time zone conversion is ever performed, e.g. when
        // several ranges are used in the same linear expression.
        // In same cases (e.g. defining a time range from a text constant)
        // it may not be available.
        this._timeZone = tz;
        this._resolution = resolution;
        this._duration = duration;
    }

    static fromText (text, { timeZone=null }={}) {
        return new TimeRange(timeZone, ...startEndTimeValues(text, 'text'));
    }

    static fromISO (iso, { timeZone=null }={}) {
        return new TimeRange(timeZone, ...startEndTimeValues(iso, 'iso'));
    }

    static fromStartEndValues (startValue, endValue, { timeZone=null, resolution=null }={}) {
        return new TimeRange(timeZone, startValue, endValue, { resolution });
    }

    static fromStartDuration (startValue, duration, resolution, adjust='floor') {
        // adjust: adjust start with 'floor'/'ceil' to resolution units
        // generate abbr of startValue with resolution; add duration to compute end
    }

    in(resolutionUnits) {
        return TimeRange.fromStartEndValues(this._startValue, this._endValue, { timeZone: this._timeZone, resolution: resolutionUnits }={});
    }

    get durationSeconds () {
        return this._endValue - this._startValue;
    }

    get timeZone () {
        return this._timeZone;
    }

    get text () {
        if (this._text === null) {
            this._set();
        }
        return this._text;
    }

    _set () {
        const { iso, resolution, abbr, duration } = timeStartEndToText(this._startValue, this._endValue, this._resolution);
        this._iso = iso;
        this._text = abbr;
        this._duration = duration;
        this._resolution = resolution;
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

    sameTimeZone(other) {
        return this.timeZone === other.timeZone;
    }


    contains (other) {
        // raise if !this.sameTimeZone(other)
        return other.startValue >= this.startValue && other.endValue <= this.endValue;
    }

    isDisjoint (other) {
        // raise if !this.sameTimeZone(other)
        return other.startValue >= this.endValue || other.endValue <= this.startValue;
    }

    intersects (other) {
        // raise if !this.sameTimeZone(other)
        return !this.isDisjoint(other);
    }

    // overlaps, precedes, succeeds, before, after
    // ends_before(t) starts_before(t) starts_after(t), ends after(t)
    // => loop:
    // for(let tr=TimeRange.fromStartDuration(t_start, dur, res), tr.ends_before(t_end); tr = tr.next())

    // largest interval contained in both this and other
    intersection (other) {
        // raise if !this.sameTimeZone(other)
        return TimeRange.fromStartEndValues(
            Math.max(this.startValue, other.startValue),
            Math.min(this.endValue, other.endValue),
            {
                timeZone: this.timeZone,
                resolution: TimeRange.minResolutoin(this.resolution, other.resolution)
            }
        );
    }

    union () { // envelope, hull, extension, ... (smallest interval containing both this and other)
        return TimeRange.fromStartEndValues(
            Math.min(this.startValue, other.startValue),
            Math.min(this.endValue, other.endValue),
            {
                timeZone: this.timeZone,
                resolution: TimeRange.minResolution(this.resolution, other.resolution)
            }
        );

    }

    // adjoint upper TR with same duration & resolution (& timeZone)
    next () {
        const startValue = this.endValue;
        const endValue = addDurationToDateValue(startValue, this.duration, this.resolution);
        return TimeRange.fromStartEndValues(
            startValue,
            endValue,
            {
                timeZone: this.timeZone,
                resolution: this.resolution
            }
        );
    }

    prev () {
        const endValue = this.startValue;
        const startValue = addDurationToDateValue(endValue, -this.duration, this.resolution);
        return TimeRange.fromStartEndValues(
            startValue,
            endValue,
            {
                timeZone: this.timeZone,
                resolution: this.resolution
            }
        );
    }

}