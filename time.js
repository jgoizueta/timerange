const TIME_LEVELS = ['year', 'month', 'day', 'hour', 'minute', 'second'];
const TIME_STARTS = [1, 1, 1, 0, 0, 0];

const YEAR = TIME_LEVELS.indexOf('year');
const MONTH = TIME_LEVELS.indexOf('month');
const DAY = TIME_LEVELS.indexOf('day');
const HOUR = TIME_LEVELS.indexOf('hour');
const MINUTE = TIME_LEVELS.indexOf('minute');
const SECOND = TIME_LEVELS.indexOf('second');

const TIME_UNITS = {
    millennium: { length: 1000, level: YEAR },
    century:    { length:  100, level: YEAR },
    decade:     { length:   10, level: YEAR },
    year:       { length:    1, level: YEAR },
    semester:   { length:    6, level: MONTH },
    trimester:  { length:    4, level: MONTH },
    quarter:    { length:    3, level: MONTH },
    month:      { length:    1, level: MONTH },
    week:       { length:    7, level: DAY },
    day:        { length:    1, level: DAY },
    hour:       { length:    1, level: HOUR },
    minute:     { length:    1, level: MINUTE },
    second:     { length:    1, level: SECOND    }
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
    TIME_UNITS,
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
