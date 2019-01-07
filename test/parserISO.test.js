const parserISO = require('../parserISO');

function time (y, m = 1, d = 1, h = 0, min = 0, sec = 0) {
    return Date.UTC(y, m - 1, d, h, min, sec);
}

function timeValue (parsed) {
    return Date.UTC(parsed.year, parsed.month - 1, parsed.day, parsed.hour, parsed.minute, parsed.second);
}

function startTimeValue(iso) {
    return timeValue(parserISO(iso)[0]);
}

function endTimeValue (iso) {
    return timeValue(parserISO(iso)[1]);
}

describe('parseISO on single calendar unit', () => {
    test('should compute correct year start time', () => {
        expect(startTimeValue('2017')).toEqual(time(2017));
    });

    test('should compute correct year end time', () => {
        expect(endTimeValue('2017')).toEqual(time(2018));
    });

    test('should compute correct month start time', () => {
        expect(startTimeValue('2017-12')).toEqual(time(2017, 12));
    });

    test('should compute correct month end time', () => {
        expect(endTimeValue('2017-12')).toEqual(time(2018));
    });

    test('should compute correct day start time', () => {
        expect(startTimeValue('2017-12-31')).toEqual(time(2017, 12, 31));
    });

    test('should compute correct day end time', () => {
        expect(endTimeValue('2017-12-31')).toEqual(time(2018, 1, 1));
    });

    test('should compute correct hour start time', () => {
        expect(startTimeValue('2017-12-07T23')).toEqual(time(2017, 12, 7, 23));
    });

    test('should compute correct hour end time', () => {
        expect(endTimeValue('2017-12-07T23')).toEqual(time(2017, 12, 8, 0));
    });

    test('should compute correct minute start time', () => {
        expect(startTimeValue('2017-12-07T23:59')).toEqual(time(2017, 12, 7, 23, 59));
    });

    test('should compute correct minute end time', () => {
        expect(endTimeValue('2017-12-07T23:59')).toEqual(time(2017, 12, 8));
    });

    test('should compute correct second start time', () => {
        expect(startTimeValue('2017-12-07T23:59:58')).toEqual(time(2017, 12, 7, 23, 59, 58));
    });

    test('should compute correct second end time', () => {
        expect(endTimeValue('2017-12-07T23:59:58')).toEqual(time(2017, 12, 7, 23, 59, 59));
    });

    test('should compute correct quarter start time', () => {
        expect(startTimeValue('2017Q1')).toEqual(time(2017, 1));
        expect(startTimeValue('2017Q2')).toEqual(time(2017, 4));
        expect(startTimeValue('2017Q3')).toEqual(time(2017, 7));
        expect(startTimeValue('2017Q4')).toEqual(time(2017, 10));
    });

    test('should compute correct quarter end time', () => {
        expect(endTimeValue('2017Q1')).toEqual(time(2017, 4));
        expect(endTimeValue('2017Q2')).toEqual(time(2017, 7));
        expect(endTimeValue('2017Q3')).toEqual(time(2017, 10));
        expect(endTimeValue('2017Q4')).toEqual(time(2018));
    });

    test('should compute correct week start time', () => {
        expect(startTimeValue('2017W05')).toEqual(time(2017, 1, 30));
        expect(startTimeValue('2013W15')).toEqual(time(2013, 4, 8));
        expect(startTimeValue('2009W53')).toEqual(time(2009, 12, 28));
        expect(startTimeValue('2010W01')).toEqual(time(2010, 1, 4));
        expect(startTimeValue('2011W52')).toEqual(time(2011, 12, 26));
        expect(startTimeValue('2012W01')).toEqual(time(2012, 1, 2));
        expect(startTimeValue('2014W01')).toEqual(time(2013, 12, 30));
        expect(startTimeValue('2014W02')).toEqual(time(2014, 1, 6));
    });

    test('should compute correct week end time', () => {
        expect(endTimeValue('2017W05')).toEqual(time(2017, 2, 6));
        expect(endTimeValue('2013W15')).toEqual(time(2013, 4, 15));
        expect(endTimeValue('2009W53')).toEqual(time(2010, 1, 4));
        expect(endTimeValue('2010W01')).toEqual(time(2010, 1, 11));
        expect(endTimeValue('2011W52')).toEqual(time(2012, 1, 2));
        expect(endTimeValue('2012W01')).toEqual(time(2012, 1, 9));
        expect(endTimeValue('2014W01')).toEqual(time(2014, 1, 6));
        expect(endTimeValue('2014W02')).toEqual(time(2014, 1, 13));
    });

    test('should compute correct century start time', () => {
        expect(startTimeValue('C20')).toEqual(time(1901));
    });

    test('should compute correct century end time', () => {
        expect(endTimeValue('C20')).toEqual(time(2001));
    });

    test('should compute correct decade start time', () => {
        expect(startTimeValue('D201')).toEqual(time(2010));
    });

    test('should compute correct decade end time', () => {
        expect(endTimeValue('D201')).toEqual(time(2020));
    });

    test('should compute correct millennium start time', () => {
        expect(startTimeValue('M3')).toEqual(time(2001));
    });

    test('should compute correct millennium end time', () => {
        expect(endTimeValue('M3')).toEqual(time(3001));
    });

    test('should compute correct default start times', () => {
        expect(startTimeValue('0001')).toEqual(time(1));
        expect(startTimeValue('0001-01')).toEqual(time(1));
        expect(startTimeValue('0001-01-01')).toEqual(time(1));
        expect(startTimeValue('0001-01-01T00')).toEqual(time(1));
        expect(startTimeValue('0001-01-01T00:00')).toEqual(time(1));
        expect(startTimeValue('0001-01-01T00:00:00')).toEqual(time(1));
    });

    test('should compute correct default end times', () => {
        expect(endTimeValue('0001')).toEqual(time(2));
        expect(endTimeValue('0001-01')).toEqual(time(1, 2));
        expect(endTimeValue('0001-01-01')).toEqual(time(1, 1, 2));
        expect(endTimeValue('0001-01-01T00')).toEqual(time(1, 1, 1, 1));
        expect(endTimeValue('0001-01-01T00:00')).toEqual(time(1, 1, 1, 0, 1));
        expect(endTimeValue('0001-01-01T00:00:00')).toEqual(time(1, 1, 1, 0, 0, 1));
    });
});

describe('parseISO on complex interval', () => {
    test('should compute correct year start time', () => {
        expect(startTimeValue('2017--2017')).toEqual(time(2017));
        expect(startTimeValue('2017--2018')).toEqual(time(2017));
        expect(startTimeValue('2017--2019')).toEqual(time(2017));
    });

    test('abcxyz should compute correct year end time', () => {
        expect(endTimeValue('2017--2017')).toEqual(time(2018));
        expect(endTimeValue('2017--2018')).toEqual(time(2019));
        expect(endTimeValue('2017--2019')).toEqual(time(2020));
    });
});
