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

const ABBR_INTERVAL_SEP = '..';
const ISO_INTERVAL_SEPS = [ '--', '/' ];
const ISO_INTERVAL_SEP = '/';

const MS_PER_DAY = 86400000;
const MS_PER_HOUR = 3600000;
const MS_PER_MINUTE = 60000;
const MS_PER_S = 1000;

function msToDate (msEpoch) {
    return new Date(msEpoch);
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

function startLevel (components) {
    let i = TIME_LEVELS.length - 1;
    while (i > 0 && components[i] === TIME_STARTS[i]) {
        --i;
    }
    return i;
}

function fullDate(...components) {
    // normDate(...components) + TIME_STARTS.slice(components.length - TIME_STARTS.length)
    return _normDate(true, components);
}

module.exports = {
    TIME_LEVELS,
    TIME_STARTS,
    YEAR, MONTH, DAY, HOUR, MINUTE, SECOND,
    RESOLUTION_LEVEL,
    UNIT_LENGTH,
    ABBR_INTERVAL_SEP,
    ISO_INTERVAL_SEPS,
    ISO_INTERVAL_SEP,
    msToDate,
    dateValue,
    utcDate,
    _normDate,
    MS_PER_DAY,
    MS_PER_HOUR,
    MS_PER_MINUTE,
    MS_PER_S,
    startLevel,
    normDate,
    valueComponents,
    fullDate
};
