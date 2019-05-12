const {
    TIME_LEVELS,
    TIME_STARTS,
    ABBR_INTERVAL_SEP,
    ISO_INTERVAL_SEPS,
    dateValue,
    fullDate
} = require('./time');

class Formatter {
    constructor (format) {
        this._format = format;
    }
    check (iso) {
        return iso.match(this._format);
    }
}

function fieldDefault (value, defaultValue) {
    return (value === undefined) ? defaultValue : Number(value);
}

function componentsFromMatch (match) {
    return match.slice(1).map((v, i) => fieldDefault(v, TIME_STARTS[i]));
}

class YMDHMSFormatter extends Formatter {
    constructor () {
        super(/^(\d\d\d\d)(?:-?(\d\d)(?:-?(\d\d)(?:[T\s]?(\d\d)(?::(\d\d)(?::(\d\d))?)?)?)?)?$/);
    }
    parse (iso) {
        const start = this.check(iso) || [];
        const end = start.slice();
        const i = [1, 2, 3, 4, 5, 6].find(i => end[i] === undefined) || 7;
        if (i === 1) {
            end[1] = 2;
        } else {
            end[i - 1] = Number(end[i - 1]) + 1;
        }
        const resolution = TIME_LEVELS[Math.max(i, 2) - 2];
        return { start: componentsFromMatch(start), end: componentsFromMatch(end), resolution };
    }
}

class MillenniumFormatter extends Formatter {
    constructor () {
        super(/^M(\d+)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const m = Number(match[1]);
        const year = m => (m - 1) * 1000 + 1;
        return {
            start: fullDate(year(m)),
            end: fullDate(year(m + 1)),
            resolution: 'millennium'
        };
    }
    format (year) {
        const millennium = 1 + (year - 1) / 1000;
        return `M${millennium}`;
    }
}

class CenturyFormatter extends Formatter {
    constructor () {
        super(/^C(\d+)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const c = Number(match[1]);
        const year = c => (c - 1) * 100 + 1;
        return {
            start: fullDate(year(c)),
            end: fullDate(year(c + 1)),
            resolution: 'century'
        };
    }
    format (year) {
        const century = 1 + (year - 1) / 100;
        return `C${century}`;
    }
}

class DecadeFormatter extends Formatter {
    constructor () {
        super(/^D(\d+)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const d = Number(match[1]);
        const year = d => d * 10;
        return {
            start: fullDate(year(d)),
            end: fullDate(year(d + 1)),
            resolution: 'decade'
        };
    }
    format (year) {
        const decade = year / 10;
        return `D${decade}`;
    }
}

class YearFormatter extends Formatter {
    constructor () {
        super(/^(\d+)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const year = Number(match[1]);
        return {
            start: fullDate(year),
            end: fullDate(year + 1),
            resolution: 'year'
        };
    }
    format (year) {
        return pad(year, 4);
    }
}

class SemesterFormatter extends Formatter {
    constructor () {
        super(/^(\d\d\d\d)S(\d)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const year = Number(match[1]);
        const s = Number(match[2]);
        const month = s => (s - 1) * 6 + 1;
        return {
            start: fullDate(year, month(s)),
            end: fullDate(year, month(s + 1)),
            resolution: 'semester'
        };
    }
    format (year, month) {
        return `${pad(year, 4)}S${1 + (month - 1) / 6}`;
    }
}

class TrimesterFormatter extends Formatter {
    constructor () {
        super(/^(\d\d\d\d)t(\d)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const year = Number(match[1]);
        const t = Number(match[2]);
        const month = t => (t - 1) * 4 + 1;
        return {
            start: fullDate(year, month(t)),
            end: fullDate(year, month(t + 1)),
            resolution: 'trimester'
        };
    }
    format (year, month) {
        return `${pad(year, 4)}t${1 + (month - 1) / 4}`;
    }
}

class QuarterFormatter extends Formatter {
    constructor () {
        super(/^(\d\d\d\d)-?Q(\d)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const year = Number(match[1]);
        const q = Number(match[2]);
        const month = q => (q - 1) * 3 + 1;
        return {
            start: fullDate(year, month(q)),
            end: fullDate(year, month(q + 1)),
            resolution: 'quarter'
        };
    }
    format (year, month) {
        return `${pad(year, 4)}-Q${1 + (month - 1) / 3}`;
    }
}

class MonthFormatter extends Formatter {
    constructor () {
        super(/^(\d\d\d\d)-(\d\d)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const year = Number(match[1]);
        const month = Number(match[2]);
        return {
            start: fullDate(year, month),
            end: fullDate(year, month + 1),
            resolution: 'month'
        };
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
        super(/^(\d\d\d\d)-?W(\d\d)$/);
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
            resolution: 'week'
        };
    }
    isoWeek(year, month, day) {
        const yd = yearDay(year, dateValue(year, month, day));
        const [iy, w] = yearWeek(year, yd);
        return `${pad(iy, 4)}-W${pad(w, 2)}`;
    }
}

// TODO: Day, Hour, Minute, Second Formatter
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
const FORMATTERS = {
    millennium: new MillenniumFormatter(),
    century: new CenturyFormatter(),
    decade: new DecadeFormatter(),
    semester: new SemesterFormatter(),
    trimester: new TrimesterFormatter(),
    quarter: new QuarterFormatter(),
    week: new WeekFormatter()
    // new YMDHMSFormatter()
};

const isoFormats = [ // => Object.values(FORMATTERS)
    new MillenniumFormatter(),
    new CenturyFormatter(),
    new DecadeFormatter(),
    new SemesterFormatter(),
    new TrimesterFormatter(),
    new QuarterFormatter(),
    new WeekFormatter(),
    new YMDHMSFormatter()
];

function findParser (iso) {
    return isoFormats.find(parser => parser.check(iso));
}

module.exports = function parseISO (iso) {
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
};
