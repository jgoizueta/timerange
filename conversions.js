const {
    TIME_LEVELS,
    YEAR, MONTH, DAY, HOUR, MINUTE, SECOND,
    ABBR_INTERVAL_SEP,
    ISO_INTERVAL_SEP,
    ISO_INTERVAL_SEPS,
    MS_PER_DAY,
    MS_PER_HOUR,
    MS_PER_MINUTE,
    MS_PER_S,
    startLevel,
    dateValue,
    normDate,
    fullDate,
    valueComponents
} = require('./time');

class Formatter {
    constructor (format, resolution, base, numUnits = 1, unit = null) {
        this._format = format;
        this.resolution = resolution;
        this.base = base;
        this.numUnits = numUnits;
        this.unit = unit === null ? TIME_LEVELS.indexOf(this.resolution) : unit;
    }
    check (iso) {
        return iso.match(this._format);
    }
}

class YearBasedFormatter extends Formatter {
    constructor (numYears, format, resolution, base) {
        super(format, resolution, base, numYears, YEAR);
    }
    parse (iso) {
        const match = this.check(iso);
        const m = Number(match[1]);
        const year = m => (m - this.base) * this.numUnits + this.base;
        return {
            start: fullDate(year(m)),
            end: fullDate(year(m + 1)),
            resolution: this.resolution
        };
    }
    _period (year) {
        return this.base + (year - this.base) / this.numUnits;
    }
}

class MillenniumFormatter extends YearBasedFormatter {
    constructor () {
        super(1000, /^M(\d+)$/, 'millennium', 1);
    }
    format (year) {
        const millennium = this._period(year);
        return `M${millennium}`;
    }
}

class CenturyFormatter extends YearBasedFormatter {
    constructor () {
        super(100, /^C(\d+)$/, 'century', 1);
    }
    format (year) {
        const century = this._period(year);
        return `C${century}`;
    }
}

class DecadeFormatter extends YearBasedFormatter {
    constructor () {
        super(10, /^D(\d+)$/, 'decade', 0);
    }
    format (year) {
        const decade = this._period(year);
        return `D${decade}`;
    }
}

class YearFormatter extends YearBasedFormatter {
    constructor () {
        super(1, /^(\d+)$/, 'year', 0);
    }
    format (year) {
        return pad(year, 4);
    }
}

class MonthBasedFormatter extends Formatter {
    constructor (numMonths, format, resolution) {
        super(format, resolution, 1, numMonths, MONTH);
    }
    parse (iso) {
        const match = this.check(iso);
        const year = Number(match[1]);
        const units = Number(match[2]);
        const month = units => (units - 1) * this.numUnits + 1;
        return {
            start: fullDate(year, month(units)),
            end: fullDate(year, month(units + 1)),
            resolution: this.resolution
        };
    }
    _period (month) {
        return 1 + (month - 1) / this.numUnits;
    }
}
class SemesterFormatter extends MonthBasedFormatter {
    constructor () {
        super(6, /^(\d\d\d\d)S(\d)$/, 'semester');
    }
    format (year, month) {
        const semester = this._period(month);
        return `${pad(year, 4)}S${semester}`;
    }
}

class TrimesterFormatter extends MonthBasedFormatter {
    constructor () {
        super(4, /^(\d\d\d\d)t(\d)$/, 'trimester');
    }
    format (year, month) {
        const trimester = this._period(month);
        return `${pad(year, 4)}t${trimester}`;
    }
}

class QuarterFormatter extends MonthBasedFormatter {
    constructor () {
        super(3, /^(\d\d\d\d)-?Q(\d)$/, 'quarter');
    }
    format (year, month) {
        const quarter = this._period(month);
        return `${pad(year, 4)}-Q${quarter}`;
    }
}

class MonthFormatter extends MonthBasedFormatter {
    constructor () {
        super(1, /^(\d\d\d\d)-(\d\d)$/, 'month');
    }
    format (year, month) {
        return `${pad(year, 4)}-${pad(month, 2)}`;
    }
}

function isoDow (y, m, d) {
    const dow = (new Date(y, m - 1, d)).getDay();
    return dow === 0 ? 7 : dow;
}

function addDays (date, days) {
    const newDate = new Date(date.valueOf());
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}

// compute start date of yWw
function startOfIsoWeek (y, w) {
    const dow = isoDow(y, 1, 1);
    const startDay = dow > 4 ? 9 - dow : 2 - dow;
    const startDate = new Date(y, 0, startDay);
    return addDays(startDate, (w - 1) * 7);
}

class WeekFormatter extends Formatter {
    constructor () {
        super(/^(\d\d\d\d)-?W(\d\d)$/, 'week', 1, 7, DAY);
    }
    parse (iso) {
        const match = this.check(iso);
        const year = Number(match[1]);
        const week = Number(match[2]);
        const start = startOfIsoWeek(year, week);
        const end = startOfIsoWeek(year, week + 1);
        const fields = date => [date.getFullYear(), date.getMonth() + 1, date.getDate()];
        return {
            start: fullDate(...fields(start)),
            end: fullDate(...fields(end)),
            resolution: this.resolution
        };
    }
    format(year, month, day) {
        const yd = yearDay(year, dateValue(year, month, day));
        const [iy, w] = yearWeek(year, yd);

        return isoWeek(iy, w);
    }
}

class YMDHMSFormatter extends Formatter {
    constructor (format, resolution, base) {
        super(format, resolution, base);
    }
    parse (iso) {
        const match = this.check(iso);
        const parts = match.slice(1).map(v => parseInt(v));
        const incrementedParts = parts.map((v, i) => i == parts.length - 1 ? v + 1 : v);
        return {
            start: fullDate(...parts),
            end: fullDate(...incrementedParts),
            resolution: this.resolution
        };
    }
}

class DayFormatter extends YMDHMSFormatter {
    constructor () {
        super(/^(\d\d\d\d)-(\d\d)-(\d\d)$/, 'day', 1);
    }
    format (year, month, day) {
        return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
    }

}

class HourFormatter extends YMDHMSFormatter {
    constructor () {
        super(/^(\d\d\d\d)-(\d\d)-(\d\d)(?:T|\s)(\d\d)$/, 'hour', 0);
    }
    format (year, month, day, hour) {
        return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}T${pad(hour, 2)}`;
    }
}

class MinuteFormatter extends YMDHMSFormatter {
    constructor () {
        super(/^(\d\d\d\d)-(\d\d)-(\d\d)(?:T|\s)(\d\d):(\d\d)$/, 'minute', 0);
    }
    format (year, month, day, hour, minute) {
        return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}T${pad(hour, 2)}:${pad(minute, 2)}`;
    }
}

class SecondFormatter extends YMDHMSFormatter {
    constructor () {
        super(/^(\d\d\d\d)-(\d\d)-(\d\d)(?:T|\s)(\d\d):(\d\d):(\d\d)$/, 'second', 0);
    }
    format (year, month, day, hour, minute, second) {
        return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}T${pad(hour, 2)}:${pad(minute, 2)}:${pad(second, 2)}`;
    }
}

const FORMATTERS = [
    new MillenniumFormatter(),
    new CenturyFormatter(),
    new DecadeFormatter(),
    new YearFormatter(),
    new SemesterFormatter(),
    new TrimesterFormatter(),
    new QuarterFormatter(),
    new MonthFormatter(),
    new WeekFormatter(),
    new DayFormatter(),
    new HourFormatter(),
    new MinuteFormatter(),
    new SecondFormatter()
].reduce((obj, formatter) => { obj[formatter.resolution] = formatter; return obj;}, {});

function findParser (iso) {
    return Object.values(FORMATTERS).find(parser => parser.check(iso));
}

function pad (x, n) {
    return x.toString().padStart(n, '0');
}

function inc(components, level, delta = 1) {
    const copy = components.slice();
    copy[level] += delta;
    return normDate(...copy);
}

function baseDuration(duration, resolution) {
    const length = FORMATTERS[resolution].numUnits;
    const level = FORMATTERS[resolution].unit;
    return [TIME_LEVELS[level], duration * length];
}

function invalidPeriod (period, invalid) {
    throw new Error(`Invalid ${invalid} period between ${period.v1} and ${period.v2}`);
}

function invalidResolution (period, forcedResolution) {
    throw new Error(`Invalid forced resolution ${forcedResolution} for period between ${period.v1} and ${period.v2}`);
}

// Return year and week number given year and day number
function yearWeek (y, yd) {
    const dow = isoDow(y, 1, 1);
    const start = dow > 4 ? 9 - dow : 2 - dow;
    if ((Math.abs(yd - start) % 7) !== 0) {
        // y yd is not the start of any week
        return [];
    }
    if (yd < start) {
        // The week starts before the first week of the year => go back one year
        yd += Math.round((Date.UTC(y, 0, 1) - Date.UTC(y - 1, 0, 1)) / MS_PER_DAY);
        return yearWeek(y - 1, yd);
    } else if (Date.UTC(y, 0, 1) + (yd - 1 + 3) * MS_PER_DAY >= Date.UTC(y + 1, 0, 1)) {
        // The Wednesday (start of week + 3) lies in the next year => advance one year
        yd -= Math.round((Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1)) / MS_PER_DAY);
        return yearWeek(y + 1, yd);
    }
    return [y, 1 + Math.round((yd - start) / 7)];
}

function commonPrefixLength(s1, s2) {
    const maxL = Math.min(s1.length, s2.length);
    let l;
    for (l = 0; l < maxL; ++l) {
        if (s1[l] !== s2[l]) {
            break;
        }
    }
    return l;
}

function isDigit(chr) {
    return !!(chr.match(/^\d$/));
}

function reduce(start, end) {
    let l = commonPrefixLength(start, end);
    while (l > 0 && isDigit(start[l - 1]) === isDigit(start[l])) {
        --l;
    }
    if (l > 0) {
        end = end.slice(l);
    }
    return [start, end];
}

function isoInterval (first, next) {
    [first, next] = reduce(first, next);
    return `${first}${ISO_INTERVAL_SEP}${next}`;
}

// Abbreviated interval notation uses a single ISO specifier for simple calendar units,
// and otherwise uses FIRST--LAST syntax where LAST, unlike in ISO intervals, is inclusive,
// so that FIRST is the ISO of the initial calendar unit, and LAST that of the final unit in
// the period.
function abbrInterval (first, last) {
    if (first === last) {
        return first;
    }
    [first, last] = reduce(first, last);
    return `${first}${ABBR_INTERVAL_SEP}${last}`;
}

class Period {
    check (maxLevel) {
        return maxLevel === this.level();
    }
    range (period, forcedResolution, onlyCalendarUnit) {
        let { duration, resolution, isoFirst, isoLast, isoNext } = this._reduce(period, forcedResolution);
        if (forcedResolution && resolution !== forcedResolution) {
            invalidResolution (period, forcedResolution);
        }
        if (duration !== 1) {
            if (onlyCalendarUnit) {
                invalidPeriod(`${duration}-${resolution}`);
            }
        }
        return {
            duration, resolution, iso: isoInterval(isoFirst, isoNext), abbr: abbrInterval(isoFirst, isoLast)
        };
    }
    _isForced (forcedResolution, resolution) {
        return !forcedResolution || forcedResolution === resolution;
    }
}

function isoWeek(iy, w) {
    return `${pad(iy, 4)}-W${pad(w, 2)}`;
}

function formattersBasedOn(level) {
    return Object.values(FORMATTERS).filter(fmt => fmt.unit === level);
}

class YearsPeriod extends Period {
    level () {
        return YEAR;
    }

    _reduce (period, forcedResolution) {
        const y1 = period.start[0];
        const y2 = period.end[0];
        let duration = y2 - y1;
        let resolution = null;
        let isoFirst, isoLast, isoNext;
        const tryFormatters = formattersBasedOn(YEAR);
        for (let fmt of tryFormatters) {
            const n = fmt.numUnits;
            const checkStart = y => ((y - fmt.base) % n) === 0;
            if (duration % n === 0 && checkStart(y1) && this._isForced(forcedResolution, fmt.resolution)) {
                duration /= n;
                resolution = fmt.resolution;
                isoFirst = fmt.format(y1);
                isoNext = fmt.format(y2);
                isoLast = duration === 1 ? isoFirst : fmt.format(y2 - n);
                break;
            }
        }
        return { duration, resolution, isoFirst, isoLast, isoNext };
    }
}

class MonthsPeriod extends Period {
    level () {
        return MONTH;
    }

    _reduce (period, forcedResolution) {
        const [y1, m1] = period.start;
        const [y2, m2] = period.end;
        let duration = 12 * y2 + m2 - 12 * y1 - m1;
        let resolution = null;
        let isoFirst, isoLast, isoNext;
        const tryFormatters = formattersBasedOn(MONTH);
        for (let fmt of tryFormatters) {
            const n = fmt.numUnits;
            const checkStart = m => ((m - fmt.base) % n) === 0;
            if (duration % n === 0 && checkStart(m1) && this._isForced(forcedResolution, fmt.resolution)) {
                duration /= n;
                resolution = fmt.resolution;
                isoFirst = fmt.format(y1, m1);
                isoNext = fmt.format(y2, m2);
                isoLast = duration === 1 ? isoFirst : fmt.format(...inc(period.end, MONTH, -n));
                break;
            }
        }
        return { duration, resolution, isoFirst, isoLast, isoNext };
    }
}

function yearDay(y, v) {
    const v0 = Date.UTC(y, 0, 1);
    return 1 + Math.round((v - v0) / MS_PER_DAY);
}

class DaysPeriod extends Period {
    level () {
        return DAY;
    }

    _reduce (period) {
        let duration = Math.round((period.endValue - period.startValue) / MS_PER_DAY);
        let resolution = 'day';
        let isoFirst, isoLast, isoNext;
        if (duration % 7 === 0) {
            const y = period.start[0];
            const yd = yearDay(y, period.startValue);
            const [iy, w] = yearWeek(y, yd);
            if (iy && w) {
                duration /= 7;
                resolution = 'week';
                isoFirst = isoWeek(iy, w);
                const y2 = period.end[0];
                isoNext = isoWeek(...yearWeek(y2, yearDay(y2, period.endValue)));
                isoLast = duration === 1 ? isoFirst : isoWeek(...yearWeek(y, yd + (duration - 1) * 7));
            }
        }
        if (!isoFirst) {
            const fmt = FORMATTERS.day;
            isoFirst = fmt.format(...period.start);
            isoNext = fmt.format(...period.end);
            isoLast = duration === 1 ? isoFirst : fmt.format(...inc(period.end, DAY, -1));
        }
        return { duration, resolution, isoFirst, isoLast, isoNext };
    }
}

class HoursPeriod extends Period {
    level () {
        return HOUR;
    }

    _reduce (period) {
        const fmt = FORMATTERS.hour;
        const duration = Math.round((period.endValue - period.startValue) / MS_PER_HOUR);
        const isoFirst = fmt.format(...period.start);
        const isoNext = fmt.format(...period.end);
        const isoLast = (duration === 1)
            ? isoFirst
            : fmt.format(...inc(period.end, HOUR, -1));
        return { duration, resolution: fmt.resolution, isoFirst, isoLast, isoNext };
    }
}

class MinutesPeriod extends Period {
    level () {
        return MINUTE;
    }

    _reduce (period) {
        const fmt = FORMATTERS.minute;
        const duration = Math.round((period.endValue - period.startValue) / MS_PER_MINUTE);
        const isoFirst = fmt.format(...period.start);
        const isoNext = fmt.format(...period.end);
        const isoLast = (duration === 1)
            ? isoFirst
            : fmt.format(...inc(period.end, MINUTE, -1));
        return { duration, resolution: fmt.resolution, isoFirst, isoLast, isoNext };
    }
}

class SecondsPeriod extends Period {
    level () {
        return SECOND;
    }

    _reduce (period) {
        const fmt = FORMATTERS.second;
        const duration = Math.round((period.endValue - period.startValue) / MS_PER_S);
        let isoFirst = fmt.format(...period.start);
        let isoNext = fmt.format(...period.end);
        const isoLast = (duration === 1)
            ? isoFirst
            : fmt.format(...inc(period.end, SECOND, -1));
        return { duration, resolution: fmt.resolution, isoFirst, isoLast, isoNext };
    }
}

const periodHandlers = [
    new YearsPeriod(),
    new MonthsPeriod(),
    new DaysPeriod(),
    new HoursPeriod(),
    new MinutesPeriod(),
    new SecondsPeriod()
];

class StartEndPeriod {
    constructor (startValue, endValue) {
        this.startValue = startValue;
        this.endValue = endValue;
        this._start = null;
        this._end = null;
    }
    static fromValues (startValue, endValue) {
        return new StartEndPeriod(startValue, endValue);
    }
    get start () {
        if (!this._start) {
            this._start = valueComponents(this.startValue);
        }
        return this._start;
    }
    get end () {
        if (!this._end) {
            this._end = valueComponents(this.endValue);
        }
        return this._end;
    }
    get minBreakLevel () {
        return Math.max(startLevel(this.start), startLevel(this.end));
    }
}

function textToTimeStartEnd (iso) {
    iso = iso || '';
    let abbr = null;
    let isoStart = iso;
    let isoEnd = null;
    for (let [isAbbr, seps] of [[true, [ABBR_INTERVAL_SEP]], [false, ISO_INTERVAL_SEPS]]) {
        for (let sep of seps) {
            if (iso.includes(sep)) {
                abbr = isAbbr;
                [isoStart, isoEnd] = iso.split(sep);
                break;
            }
        }
        if (abbr !== null) {
            break;
        }
    }
    const startParser = findParser(isoStart);
    if (!startParser) {
        throw new Error(`No date parser found for ${iso}`);
    }
    let { start, end, resolution } = startParser.parse(isoStart);
    if (isoEnd && isoEnd !== isoStart) {
        if (isoStart.match(/^[A-Z]\d+$/) && isoEnd.match(/^\d+$/)) {
            isoEnd = isoStart[0] + isoEnd;
        } else if (isoEnd.length < isoStart.length) {
            isoEnd = isoStart.slice(0, isoStart.length - isoEnd.length) + isoEnd;
        }
        const endParser = findParser(isoEnd);
        if (!endParser) {
            throw new Error(`No date parser found for ${iso}`);
        }
        const endPeriod = endParser.parse(isoEnd);
        end = abbr ? endPeriod.end : endPeriod.start;
    }
    return { start, end, resolution };
}

function timeStartEndToText (v1, v2, resolution=null, onlyCalendarUnit=true) {
    const period = StartEndPeriod.fromValues(v1, v2);
    let level = period.minBreakLevel;

    if (resolution) {
        const rLevel = FORMATTERS[resolution].unit;
        if (rLevel < level) {
            invalidResolution (period, resolution);
        }
        level = rLevel;
    }

    const handler = periodHandlers.find(handler => handler.check(level));
    return handler.range(period, resolution, onlyCalendarUnit);
}

function addDurationToDateValue(value, duration, resolution) {
    return dateValue(inc(valueComponents(value), ...baseDuration(duration, resolution)));
}

module.exports = {
    textToTimeStartEnd,
    timeStartEndToText,
    addDurationToDateValue
};
