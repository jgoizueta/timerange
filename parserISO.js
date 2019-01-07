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
class IsoParser {
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

function dateFields (fields) {
    return {
        year: fieldDefault(fields.year, 1),
        month: fieldDefault(fields.month, 1),
        day: fieldDefault(fields.day, 1),
        hour: fieldDefault(fields.hour, 0),
        minute: fieldDefault(fields.minute, 0),
        second: fieldDefault(fields.second, 0)
    };
}

function fieldsFromMatch (match) {
    return dateFields({
        year: match[1],
        month: match[2],
        day: match[3],
        hour: match[4],
        minute: match[5],
        second: match[6]
    });
}

class YMDHMSParser extends IsoParser {
    constructor () {
        super(/^(\d\d\d\d)(?:\-?(\d\d)(?:\-?(\d\d)(?:[T\s]?(\d\d)(?:\:(\d\d)(?:\:(\d\d))?)?)?)?)?$/);
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
        return { start: fieldsFromMatch(start), end: fieldsFromMatch(end), resolution };
    }
}

class MillenniumParser extends IsoParser {
    constructor () {
        super(/^M(\d+)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const m = Number(match[1]);
        const year = m => (m - 1) * 1000 + 1;
        return {
            start: dateFields({ year: year(m) }),
            end: dateFields({ year: year(m + 1) }),
            resolution: 'millennium'
        };
    }
}

class CenturyParser extends IsoParser {
    constructor () {
        super(/^C(\d+)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const c = Number(match[1]);
        const year = c => (c - 1) * 100 + 1;
        return {
            start: dateFields({ year: year(c) }),
            end: dateFields({ year: year(c + 1) }),
            resolution: 'century'
        };
    }
}

class DecadeParser extends IsoParser {
    constructor () {
        super(/^D(\d+)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const d = Number(match[1]);
        const year = d => d * 10;
        return {
            start: dateFields({ year: year(d) }),
            end: dateFields({ year: year(d + 1) }),
            resolution: 'decade'
        };
    }
}

class SemesterParser extends IsoParser {
    constructor () {
        super(/^(\d\d\d\d)S(\d)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const year = Number(match[1]);
        const s = Number(match[2]);
        const month = s => (s - 1) * 6 + 1;
        return {
            start: dateFields({ year, month: month(s) }),
            end: dateFields({ year, month: month(s + 1) }),
            resolution: 'semester'
        };
    }
}

class TrimesterParser extends IsoParser {
    constructor () {
        super(/^(\d\d\d\d)t(\d)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const year = Number(match[1]);
        const t = Number(match[2]);
        const month = t => (t - 1) * 4 + 1;
        return {
            start: dateFields({ year, month: month(t) }),
            end: dateFields({ year, month: month(t + 1) }),
            resolution: 'trimester'
        };
    }
}

class QuarterParser extends IsoParser {
    constructor () {
        super(/^(\d\d\d\d)\-?Q(\d)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const year = Number(match[1]);
        const q = Number(match[2]);
        const month = q => (q - 1) * 3 + 1;
        return {
            start: dateFields({ year, month: month(q) }),
            end: dateFields({ year, month: month(q + 1) }),
            resolution: 'quarter'
        };
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

class WeekParser extends IsoParser {
    constructor () {
        super(/^(\d\d\d\d)\-?W(\d\d)$/);
    }
    parse (iso) {
        const match = this.check(iso);
        const year = Number(match[1]);
        const week = Number(match[2]);
        const start = startOfIsoWeek(year, week);
        const end = startOfIsoWeek(year, week + 1);
        const fields = date => ({
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
        });
        return {
            start: dateFields(fields(start)),
            end: dateFields(fields(end)),
            resolution: 'week'
        };
    }
}

const isoFormats = [
    new MillenniumParser(),
    new CenturyParser(),
    new DecadeParser(),
    new SemesterParser(),
    new TrimesterParser(),
    new QuarterParser(),
    new WeekParser(),
    new YMDHMSParser()
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
        };
        if (abbr !== null) {
            break;
        }
    };
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
        endPeriod = endParser.parse(isoEnd);
        end = abbr ? endPeriod.end : endPeriod.start;
    }
    return { start, end, resolution };
}
