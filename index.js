const TimeRange = require('./lib/timerange');
const TimeInstant = require('./lib/timeinstant');
const { compareResolutions, leastResolution, greatestResolution } = require('./lib/conversions');

module.exports = {
    TimeRange,
    TimeInstant,
    compareResolutions,
    leastResolution,
    greatestResolution
};
