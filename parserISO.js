const {
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

class YearBasedFormatter extends Formatter {
    constructor (numYears, format, resolution, base) {
        super(format);
        this.numYears = numYears;
        this.resolution = resolution;
        this.base = base;
    }
    parse (iso) {
        const match = this.check(iso);
        const m = Number(match[1]);
        const year = m => (m - this.base) * this.numYears + this.base;
        return {
            start: fullDate(year(m)),
            end: fullDate(year(m + 1)),
            resolution: this.resolution
        };
    }
    _units (year) {
        return this.base + (year - this.base) / this.numYears;
    }
}

class MillenniumFormatter extends YearBasedFormatter {
    constructor () {
        super(1000, /^M(\d+)$/, 'millennium', 1);
    }
    format (year) {
        const millennium = this._units(year);
        return `M${millennium}`;
    }
}

class CenturyFormatter extends YearBasedFormatter {
    constructor () {
        super(100, /^C(\d+)$/, 'century', 1);
    }
    format (year) {
        const century = this._units(year);
        return `C${century}`;
    }
}

class DecadeFormatter extends YearBasedFormatter {
    constructor () {
        super(10, /^D(\d+)$/, 'decade', 0);
    }
    format (year) {
        const decade = this._units(year);
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
        super(format);
        this.numMonths = numMonths;
        this.resolution = resolution;
    }
    parse (iso) {
        const match = this.check(iso);
        const year = Number(match[1]);
        const units = Number(match[2]);
        const month = units => (units - 1) * this.numMonths + 1;
        return {
            start: fullDate(year, month(units)),
            end: fullDate(year, month(units + 1)),
            resolution: this.resolution
        };
    }
    _units (month) {
        return 1 + (month - 1) / this.numMonths;
    }
}
class SemesterFormatter extends MonthBasedFormatter {
    constructor () {
        super(6, /^(\d\d\d\d)S(\d)$/, 'semester');
    }
    format (year, month) {
        const semester = this._units(month);
        return `${pad(year, 4)}S${semester}`;
    }
}

class TrimesterFormatter extends MonthBasedFormatter {
    constructor () {
        super(4, /^(\d\d\d\d)t(\d)$/, 'trimester');
    }
    format (year, month) {
        const trimester = this._units(month);
        return `${pad(year, 4)}t${trimester}`;
    }
}

class QuarterFormatter extends MonthBasedFormatter {
    constructor () {
        super(3, /^(\d\d\d\d)-?Q(\d)$/, 'quarter');
    }
    format (year, month) {
        const quarter = this._units(month);
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
    format(year, month, day) {
        const yd = yearDay(year, dateValue(year, month, day));
        const [iy, w] = yearWeek(year, yd);
        return `${pad(iy, 4)}-W${pad(w, 2)}`;
    }
}

class YMDHMSFormatter extends Formatter {
    constructor (format, resolution) {
        super(format);
        this.resolution = resolution;
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
        super(/^(\d\d\d\d)-(\d\d)-(\d\d)$/, 'day')
    }
    format (year, month, day) {
        return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
    }

}

class HourFormatter extends YMDHMSFormatter {
    constructor () {
        super(/^(\d\d\d\d)-(\d\d)-(\d\d)(?:T|\s)(\d\d)$/, 'hour')
    }
    format (year, month, day, hour) {
        return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}T${pad(hour, 2)}`;
    }
}

class MinuteFormatter extends YMDHMSFormatter {
    constructor () {
        super(/^(\d\d\d\d)-(\d\d)-(\d\d)(?:T|\s)(\d\d):(\d\d)$/, 'minute')
    }
    format (year, month, day, hour, minute) {
        return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}T${pad(hour, 2)}:${pad(minute, 2)}`;
    }
}

class SecondFormatter extends YMDHMSFormatter {
    constructor () {
        super(/^(\d\d\d\d)-(\d\d)-(\d\d)(?:T|\s)(\d\d):(\d\d):(\d\d)$/, 'second')
    }
    format (year, month, day, hour, minute, second) {
        return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}T${pad(hour, 2)}:${pad(minute, 2)}:${pad(second, 2)}`;
    }
}

const FORMATTERS = {
    millennium: new MillenniumFormatter(),
    century: new CenturyFormatter(),
    decade: new DecadeFormatter(),
    year: new YearFormatter(),
    semester: new SemesterFormatter(),
    trimester: new TrimesterFormatter(),
    quarter: new QuarterFormatter(),
    month: new MonthFormatter(),
    week: new WeekFormatter(),
    day: new DayFormatter(),
    hour: new HourFormatter(),
    minute: new MinuteFormatter(),
    second: new SecondFormatter()
};

function findParser (iso) {
    return Object.values(FORMATTERS).find(parser => parser.check(iso));
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
