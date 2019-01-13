const TIME_LEVELS = ['year', 'month', 'day', 'hour', 'minute', 'second'];
const TIME_STARTS = [1, 1, 1, 0, 0, 0];
const YEAR = TIME_LEVELS.indexOf('year');
const MONTH = TIME_LEVELS.indexOf('month');
const DAY = TIME_LEVELS.indexOf('day');
const HOUR = TIME_LEVELS.indexOf('hour');
const MINUTE = TIME_LEVELS.indexOf('minute');
const SECOND = TIME_LEVELS.indexOf('second');

const RESOLUTION_LEVEL = {
    millennium: YEAR,
    century: YEAR,
    decade: YEAR,
    year: YEAR,
    semester: MONTH,
    trimester: MONTH,
    quarter: MONTH,
    month: MONTH,
    week: DAY,
    day: DAY,
    hour: HOUR,
    minute: MINUTE,
    second: SECOND
};

const UNIT_LENGTH = {
    millennium: 1000,
    century: 100,
    decade: 10,
    year: 1,
    semester: 6,
    trimester: 4,
    quarter: 3,
    month: 1,
    week: 7,
    day: 1,
    hour: 1,
    minute: 1,
    second: 1
};

const ISO_FORMATS = {
    millennium: isoMillennium,
    century: isoCentury,
    decade: isoDecade,
    year: isoYear,
    semester: isoSemester,
    trimester: isoTrimester,
    quarter: isoQuarter,
    month: isoMonth,
    // week: isoWeek,
    day: isoDay,
    hour: isoHour,
    minute: isoMinute,
    second: isoSecond
};

const MS_PER_DAY = 86400000;
const MS_PER_HOUR = 3600000;
const MS_PER_MINUTE = 60000;
const MS_PER_S = 1000;

const ABBR_INTERVAL_SEP = '..';
const ISO_INTERVAL_SEPS = [ '--', '/' ];
const ISO_INTERVAL_SEP = '/';

function startLevel (components) {
    let i = TIME_LEVELS.length - 1;
    while (i > 0 && components[i] === TIME_STARTS[i]) {
        --i;
    }
    return i;
}

function msToDate (msEpoch) {
    return new Date(msEpoch);
}

function pad (x, n) {
    return x.toString().padStart(n, '0');
}

function dateValue(...components) {
    if (components.length > 1) {
        components = [components[0], components[1] - 1, ...components.slice(2)];
    }
    return Date.UTC(...components);
}

function utcDate(...components) {
    return msToDate(dateValue(...components));
}

function* take(n, iterable) {
    for (let x of iterable) {
        if (n <= 0) return;
        n--;
        yield x;
    }
}

function* dateComponents (d) {
    yield d.getUTCFullYear();
    yield d.getUTCMonth() + 1;
    yield d.getUTCDate();
    yield d.getUTCHours();
    yield d.getUTCMinutes();
    yield d.getUTCSeconds();
}

function valueComponents (dateValue) {
    const date = msToDate(dateValue);
    return [...dateComponents(date)];
}

function _normDate(allComponents, components) {
    const date = utcDate(...components);
    const n = allComponents ? TIME_LEVELS.size : components.length;
    return [...take(n, dateComponents(date))];
}

function normDate(...components) {
    return _normDate(false, components);
}

function inc(components, level, delta = 1) {
    const copy = components.slice();
    copy[level] += delta;
    return normDate(...copy);
}

function baseDuration(duration, resolution) {
    const level = RESOLUTION_LEVEL[resolution];
    const mult = UNIT_LENGTH[resolution];
    return [TIME_LEVELS[level], duration * mult];
}

function addToDateValue(value, duration, resolution) {
    return dateValue(inc(valueComponents(value), ...baseDuration(duration, resolution)));
}

function isoDow (y, m, d) {
    const dow = (new Date(y, m - 1, d)).getDay();
    return dow === 0 ? 7 : dow;
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

function isoMillennium(year) {
    const millennium = 1 + (year - 1) / 1000;
    return `M${millennium}`;
}

function isoCentury(year) {
    const century = 1 + (year - 1) / 100;
    return `C${century}`;
}

function isoDecade(year) {
    const decade = year / 10;
    return `D${decade}`;
}

function isoYear(y) {
    return pad(y, 4);
}

function isoSemester(y, m) {
    return `${pad(y, 4)}S${1 + (m - 1) / 6}`;
}

function isoTrimester(y, m) {
    return `${pad(y, 4)}t${1 + (m - 1) / 4}`;
}

function isoQuarter(y, m) {
    return `${pad(y, 4)}-Q${1 + (m - 1) / 3}`;
}

function isoMonth(y, m) {
    return `${pad(y, 4)}-${pad(m, 2)}`;
}

function isoWeek(iy, w) {
    return `${pad(iy, 4)}-W${pad(w, 2)}`;
}

function isoDay(y, m, d) {
    return `${pad(y, 4)}-${pad(m, 2)}-${pad(d, 2)}`;
}

function isoHour(y, m, d, h) {
    return `${pad(y, 4)}-${pad(m, 2)}-${pad(d, 2)}T${pad(h, 2)}`;
}

function isoMinute(y, m, d, h, mn) {
    return `${pad(y, 4)}-${pad(m, 2)}-${pad(d, 2)}T${pad(h, 2)}:${pad(mn, 2)}`;
}

function isoSecond(y, m, d, h, mn, s) {
    return `${pad(y, 4)}-${pad(m, 2)}-${pad(d, 2)}T${pad(h, 2)}:${pad(mn, 2)}:${pad(s, 2)}`;
}

const RESOLUTION_BASE = {
    millennium: 1,
    century: 1,
    decade: 0,
    year: 0,
    semester: 1,
    trimester: 1,
    quarter: 1,
    month: 0
};

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
        const tryResolutions = Object.keys(RESOLUTION_LEVEL).filter(res => RESOLUTION_LEVEL[res] === YEAR);
        for (let tryResolution of tryResolutions) {
            const n = UNIT_LENGTH[tryResolution];
            const base = RESOLUTION_BASE[tryResolution];
            const checkStart = y => ((y - base) % n) === 0;
            if (duration % n === 0 && checkStart(y1) && this._isForced(forcedResolution, tryResolution)) {
                duration /= n;
                resolution = tryResolution;
                const isoFmt = ISO_FORMATS[resolution];
                isoFirst = isoFmt(y1);
                isoNext = isoFmt(y2);
                isoLast = duration === 1 ? isoFirst : isoFmt(y2 - n);
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
        const tryResolutions = Object.keys(RESOLUTION_LEVEL).filter(res => RESOLUTION_LEVEL[res] === MONTH);
        for (let tryResolution of tryResolutions) {
            const n = UNIT_LENGTH[tryResolution];
            const base = RESOLUTION_BASE[tryResolution];
            const checkStart = m => ((m - base) % n) === 0;
            if (duration % n === 0 && checkStart(m1) && this._isForced(forcedResolution, tryResolution)) {
                duration /= n;
                resolution = tryResolution;
                const isoFmt = ISO_FORMATS[resolution];
                isoFirst = isoFmt(y1, m1);
                isoNext = isoFmt(y2, m2);
                isoLast = duration === 1 ? isoFirst : isoFmt(...inc(period.end, MONTH, -n));
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
            isoFirst = isoDay(...period.start);
            isoNext = isoDay(...period.end);
            isoLast = duration === 1 ? isoFirst : isoDay(...inc(period.end, DAY, -1));
        }
        return { duration, resolution, isoFirst, isoLast, isoNext };
    }
}

class HoursPeriod extends Period {
    level () {
        return HOUR;
    }

    _reduce (period) {
        const duration = Math.round((period.endValue - period.startValue) / MS_PER_HOUR);
        const isoFirst = isoHour(...period.start);
        const isoNext = isoHour(...period.end);
        const isoLast = (duration === 1)
            ? isoFirst
            : isoHour(...inc(period.end, HOUR, -1));
        return { duration, resolution: 'hour', isoFirst, isoLast, isoNext };
    }
}

class MinutesPeriod extends Period {
    level () {
        return MINUTE;
    }

    _reduce (period) {
        const duration = Math.round((period.endValue - period.startValue) / MS_PER_MINUTE);
        const isoFirst = isoMinute(...period.start);
        const isoNext = isoMinute(...period.end);
        const isoLast = (duration === 1)
            ? isoFirst
            : isoMinute(...inc(period.end, MINUTE, -1));
        return { duration, resolution: 'minute', isoFirst, isoLast, isoNext };
    }
}

class SecondsPeriod extends Period {
    level () {
        return SECOND;
    }

    _reduce (period) {
        const duration = Math.round((period.endValue - period.startValue) / MS_PER_S);
        let isoFirst = isoSecond(...period.start);
        let isoNext = isoSecond(...period.end);
        const isoLast = (duration === 1)
            ? isoFirst
            : isoSecond(...inc(period.end, SECOND, -1));
        return { duration, resolution: 'second', isoFirst, isoLast, isoNext };
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

module.exports = function periodISO (v1, v2, resolution=null, onlyCalendarUnit=true) {
    const period = StartEndPeriod.fromValues(v1, v2);
    let level = period.minBreakLevel;

    if (resolution) {
        const rLevel = RESOLUTION_LEVEL[resolution];
        if (rLevel < level) {
            invalidResolution (period, resolution);
        }
        level = rLevel;
    }

    const handler = periodHandlers.find(handler => handler.check(level));
    return handler.range(period, resolution, onlyCalendarUnit);
};

module.exports.addPeriod = addToDateValue;
