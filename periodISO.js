// TODO: constants.js

const TIME_LEVELS = ['year', 'month', 'day', 'hour', 'minute', 'second'];
const TIME_STARTS = [1, 1, 1, 0, 0, 0];
const YEAR_LEVEL = 0;
const MONTH_LEVEL = 1;
const DAY_LEVEL = 2;
const HOUR_LEVEL = 3;
const MINUTE_LEVEL = 4;
const SECOND_LEVEL = 5;
const RESOLUTION_LEVEL = {
  'millennium': TIME_LEVELS.indexOf('year'),
  'century': TIME_LEVELS.indexOf('year'),
  'decade': TIME_LEVELS.indexOf('year'),
  'year': TIME_LEVELS.indexOf('year'),
  'semester': TIME_LEVELS.indexOf('month'),
  'trimester': TIME_LEVELS.indexOf('month'),
  'quarter': TIME_LEVELS.indexOf('month'),
  'month': TIME_LEVELS.indexOf('month'),
  'week': TIME_LEVELS.indexOf('day'),
  'day': TIME_LEVELS.indexOf('day'),
  'hour': TIME_LEVELS.indexOf('hour'),
  'minute': TIME_LEVELS.indexOf('minute'),
  'second': TIME_LEVELS.indexOf('second')
};

const MS_PER_DAY = 86400000;
const MS_PER_HOUR = 3600000;
const MS_PER_MINUTE = 60000;
const MS_PER_S = 1000;

ABBR_INTERVAL_SEP = '..';
ISO_INTERVAL_SEPS = [ '--', '/' ];
ISO_INTERVAL_SEP = '/';

function startLevel (parsed) {
    let i = TIME_LEVELS.length - 1;
    while (i > 0 && parsed[TIME_LEVELS[i]] === TIME_STARTS[i]) {
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

function utcDate(...components) {
    if (components.length > 1) {
        components = [components[0], components[1] - 1, ...components.slice(2)]
    }
    return new Date(Date.UTC(...components));
}

function* take(n, iterable) {
    for (let x of iterable) {
        if (n <= 0) return;
        n--;
        yield x;
    }
}

function normDate(...components) {
    function* splitDate(d) {
        yield d.getUTCFullYear();
        yield d.getUTCMonth() + 1;
        yield d.getUTCDate();
        yield d.getUTCHours();
        yield d.getUTCMinutes();
        yield d.getUTCSeconds();
    }
    const date = utcDate(...components);
    return [...take(components.length, splitDate(date))];
}

function parsedValue (dateValue) {
    const date = msToDate(dateValue);
    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        hour: date.getUTCHours(),
        minute: date.getUTCMinutes(),
        second: date.getUTCSeconds()
    };
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
        }
    }
    _isForced (forcedResolution, resolution) {
        return !forcedResolution || forcedResolution === resolution;
    }
}

function isoMillennium(m) {
    return `M${m}`;
}

function isoCentury(c) {
    return `C${c}`;
}

function isoDecade(d) {
    return `D${d}`;
}

function isoYear(y) {
    return pad(y, 4)
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

class YearsPeriod extends Period {
    level () {
        return YEAR_LEVEL;
    }

    _reduce (period, forcedResolution) {
        const y1 = period.t1.year;
        const y2 = period.t2.year;
        let duration = y2 - y1;
        let resolution = 'year';
        let isoFirst, isoLast, isoNext;
        if (duration % 1000 === 0 && ((y1 - 1) % 1000) === 0 && this._isForced(forcedResolution, 'millennium')) {
            duration /= 1000;
            resolution = 'millennium';
            isoFirst = isoMillennium(1 + (y1 - 1) / 1000);
            isoNext = isoMillennium(1 + (y2 - 1) / 1000);
            isoLast = duration === 1 ? isoFirst : isoMillennium(1 + (y2 - 1) / 1000 - 1);
        } else if (duration % 100 === 0 && ((y1 - 1) % 100) === 0 && this._isForced(forcedResolution, 'century')) {
            duration /= 100;
            resolution = 'century';
            isoFirst = isoCentury(1 + (y1 - 1) / 100);
            isoNext = isoCentury(1 + (y2 - 1) / 100);
            isoLast = duration === 1 ? isoFirst : isoCentury(1 + (y2 - 1) / 100 - 1);
        } else if (duration % 10 === 0 && (y1 % 10) === 0 && this._isForced(forcedResolution, 'decade')) {
            duration /= 10;
            resolution = 'decade';
            isoFirst = isoDecade(y1 / 10);
            isoNext = isoDecade(y2 / 10);
            isoLast = duration === 1 ? isoFirst : isoDecade(y2 / 10 - 1);
        } else {
            isoFirst = isoYear(y1);
            isoNext = isoYear(y2);
            isoLast = duration === 1 ? isoFirst : isoYear(y2 - 1);
        }
        return { duration, resolution, isoFirst, isoLast, isoNext };
    }
}

class MonthsPeriod extends Period {
    level () {
        return MONTH_LEVEL;
    }

    _reduce (period) {
        const y1 = period.t1.year;
        const y2 = period.t2.year;
        const m1 = period.t1.month;
        const m2 = period.t2.month;
        let duration = 12 * y2 + m2 - 12 * y1 - m1;
        let resolution = 'month';
        let isoFirst, isoLast, isoNext;
        if (duration % 6 === 0 && ((m1 - 1) % 6) === 0) {
            duration /= 6;
            resolution = 'semester';
            isoFirst = isoSemester(y1, m1);
            isoNext = isoSemester(y2, m2);
            isoLast = duration === 1 ? isoFirst : isoSemester(...normDate(y2, m2 - 6));
        } else if (duration % 4 === 0 && ((m1 - 1) % 4) === 0) {
            duration /= 4;
            resolution = 'trimester';
            isoFirst = isoTrimester(y1, m1);
            isoNext = isoTrimester(y2, m2);
            isoLast = duration === 1 ? isoFirst : isoTrimester(...normDate(y2, m2 - 4));
        } else if (duration % 3 === 0 && ((m1 - 1) % 3) === 0) {
            duration /= 3;
            resolution = 'quarter';
            isoFirst = isoQuarter(y1, m1);
            isoNext = isoQuarter(y2, m2);
            isoLast = duration === 1 ? isoFirst : isoQuarter(...normDate(y2, m2 - 3));
        } else {
            isoFirst = isoMonth(y1, m1);
            isoNext = isoMonth(y2, m2);
            isoLast = duration === 1 ? isoFirst : isoMonth(...normDate(y2, m2 - 1));
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
        return DAY_LEVEL;
    }

    _reduce (period) {
        let duration = Math.round((period.v2 - period.v1) / MS_PER_DAY);
        let resolution = 'day';
        let isoFirst, isoLast, isoNext;
        if (duration % 7 === 0) {
            let y = period.t1.year;
            const v0 = Date.UTC(y, 0, 1);
            let yd = yearDay(y, period.v1);
            const [iy, w] = yearWeek(y, yd);
            if (iy && w) {
                duration /= 7;
                resolution = 'week';
                isoFirst = isoWeek(iy, w);
                isoNext = isoWeek(...yearWeek(period.t2.year, yearDay(period.t2.year, period.v2)));
                isoLast = duration === 1 ? isoFirst : isoWeek(...yearWeek(y, yd + (duration - 1) * 7));
            }
        }
        if (!isoFirst) {
            isoFirst = isoDay(period.t1.year, period.t1.month, period.t1.day);
            isoNext = isoDay(period.t2.year, period.t2.month, period.t2.day);
            isoLast = duration === 1 ? isoFirst : isoDay(...normDate(period.t2.year, period.t2.month, period.t2.day - 1));
        }
        return { duration, resolution, isoFirst, isoLast, isoNext };
    }
}

class HoursPeriod extends Period {
    level () {
        return HOUR_LEVEL;
    }

    _reduce (period) {
        const duration = Math.round((period.v2 - period.v1) / MS_PER_HOUR);
        const isoFirst = isoHour(period.t1.year, period.t1.month, period.t1.day, period.t1.hour);
        const isoNext = isoHour(period.t2.year, period.t2.month, period.t2.day, period.t2.hour);
        const isoLast = (duration === 1)
            ? isoFirst
            : isoHour(...normDate(period.t2.year, period.t2.month, period.t2.day, period.t2.hour - 1));
        return { duration, resolution: 'hour', isoFirst, isoLast, isoNext };
    }
}

class MinutesPeriod extends Period {
    level () {
        return MINUTE_LEVEL;
    }

    _reduce (period) {
        const duration = Math.round((period.v2 - period.v1) / MS_PER_MINUTE);
        const isoFirst = isoMinute(period.t1.year, period.t1.month, period.t1.day, period.t1.hour, period.t1.minute);
        const isoNext = isoMinute(period.t2.year, period.t2.month, period.t2.day, period.t2.hour, period.t2.minute);
        const isoLast = (duration === 1)
            ? isoFirst
            : isoMinute(...normDate(period.t2.year, period.t2.month, period.t2.day, period.t2.hour, period.t2.minute - 1));
        return { duration, resolution: 'minute', isoFirst, isoLast, isoNext };
    }
}

class SecondsPeriod extends Period {
    level () {
        return MINUTE_LEVEL;
    }

    _reduce (period) {
        const duration = Math.round((period.v2 - period.v1) / MS_PER_S);
        let isoFirst = isoSecond(period.t1.year, period.t1.month, period.t1.day, period.t1.hour, period.t1.minute, period.t1.second);
        let isoNext = isoSecond(period.t2.year, period.t2.month, period.t2.day, period.t2.hour, period.t2.minute, period.t2.second);
        const isoLast = (duration === 1)
            ? isoFirst
            : isoSecond(...normDate(period.t2.year, period.t2.month, period.t2.day, period.t2.hour, period.t2.minute, period.t2.second - 1));
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

module.exports = function periodISO (v1, v2, resolution=null, onlyCalendarUnit=true) {
    const t2 = parsedValue(v2);
    const t1 = parsedValue(v1);
    const l1 = startLevel(t1);
    const l2 = startLevel(t2);
    const period = { v1, v2, t1, t2 };
    let level = Math.max(l1, l2);

    if (resolution) {
        const rLevel = RESOLUTION_LEVEL[resolution];
        if (rLevel < level) {
            invalidResolution (period, resolution);
        }
        level = rLevel;
    }

    const handler = periodHandlers.find(handler => handler.check(level));
    return handler.range(period, resolution, onlyCalendarUnit);
}
