const { timeStartEndToText, textToTimeStartEnd, roundDateValue } = require('../lib/conversions');

function time (y, m = 1, d = 1, h = 0, min = 0, sec = 0) {
    return Date.UTC(y, m - 1, d, h, min, sec);
}

function timeValue (parsed) {
    return time(...parsed);
}

function startTimeValue(iso) {
    return timeValue(textToTimeStartEnd(iso).start);
}

function endTimeValue (iso) {
    return timeValue(textToTimeStartEnd(iso).end);
}

function resolution (iso) {
    return textToTimeStartEnd(iso).resolution;
}

describe('textToTimeStartEnd on single calendar unit', () => {
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

describe('textToTimeStartEnd on complex abbr interval', () => {
    test('should compute correct year start time', () => {
        expect(startTimeValue('2017..2017')).toEqual(time(2017));
        expect(startTimeValue('2017..2018')).toEqual(time(2017));
        expect(startTimeValue('2017..2019')).toEqual(time(2017));
    });

    test('should compute correct year end time', () => {
        expect(endTimeValue('2017..2017')).toEqual(time(2018));
        expect(endTimeValue('2017..2018')).toEqual(time(2019));
        expect(endTimeValue('2017..2019')).toEqual(time(2020));
    });

    test('should compute correct month start time', () => {
        expect(startTimeValue('2017-12..2018-03')).toEqual(time(2017, 12));
        expect(startTimeValue('2017-03..2017-06')).toEqual(time(2017, 3));
        expect(startTimeValue('2017-03..06')).toEqual(time(2017, 3));
    });

    test('should compute correct month end time', () => {
        expect(endTimeValue('2017-12..2018-03')).toEqual(time(2018, 4));
        expect(endTimeValue('2017-03..2017-06')).toEqual(time(2017, 7));
        expect(endTimeValue('2017-03..06')).toEqual(time(2017, 7));
    });

    test('should compute correct day start time', () => {
        expect(startTimeValue('2017-12-31..2018-03-14')).toEqual(time(2017, 12, 31));
        expect(startTimeValue('2017-03-12..2017-06-14')).toEqual(time(2017, 3, 12));
        expect(startTimeValue('2017-03-12..06-14')).toEqual(time(2017, 3, 12));
        expect(startTimeValue('2017-03-12..14')).toEqual(time(2017, 3, 12));
    });

    test('should compute correct day end time', () => {
        expect(endTimeValue('2017-12-31..2018-03-14')).toEqual(time(2018, 3, 15));
        expect(endTimeValue('2017-03-12..2017-06-14')).toEqual(time(2017, 6, 15));
        expect(endTimeValue('2017-03-12..06-14')).toEqual(time(2017, 6, 15));
        expect(endTimeValue('2017-03-12..14')).toEqual(time(2017, 3, 15));
    });
    test('should compute correct hour start time', () => {
        expect(startTimeValue('2017-12-07T21..23')).toEqual(time(2017, 12, 7, 21));
        expect(startTimeValue('2017-12-07T21..07T23')).toEqual(time(2017, 12, 7, 21));
        expect(startTimeValue('2017-12-07T21..12-07T23')).toEqual(time(2017, 12, 7, 21));
        expect(startTimeValue('2017-12-07T21..2017-12-07T23')).toEqual(time(2017, 12, 7, 21));
        expect(startTimeValue('2017-12-07T21..2018-02-07T23')).toEqual(time(2017, 12, 7, 21));
        expect(startTimeValue('2017-03-07T21..05-07T23')).toEqual(time(2017, 3, 7, 21));
    });

    test('should compute correct hour end time', () => {
        expect(endTimeValue('2017-12-07T21..23')).toEqual(time(2017, 12, 7, 24));
        expect(endTimeValue('2017-12-07T21..07T23')).toEqual(time(2017, 12, 7, 24));
        expect(endTimeValue('2017-12-07T21..12-07T23')).toEqual(time(2017, 12, 7, 24));
        expect(endTimeValue('2017-12-07T21..2017-12-07T23')).toEqual(time(2017, 12, 7, 24));
        expect(endTimeValue('2017-12-07T21..2018-02-07T23')).toEqual(time(2018, 2, 7, 24));
        expect(endTimeValue('2017-03-07T21..05-07T23')).toEqual(time(2017, 5, 7, 24));
    });

    test('should compute correct second start time', () => {
        expect(startTimeValue('2017-03-07T13:51:52..54')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52..51:54')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52..53:54')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52..13:51:54')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52..15:51:54')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52..07T13:51:54')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52..11T13:51:54')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52..03-07T13:51:54')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52..05-07T13:51:54')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52..2017-03-07T13:51:54')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52..2018-03-07T13:51:54')).toEqual(time(2017, 3, 7, 13, 51, 52));
    });

    test('should compute correct second end time', () => {
        expect(endTimeValue('2017-03-07T13:51:52..54')).toEqual(time(2017, 3, 7, 13, 51, 55));
        expect(endTimeValue('2017-03-07T13:51:52..51:54')).toEqual(time(2017, 3, 7, 13, 51, 55));
        expect(endTimeValue('2017-03-07T13:51:52..53:54')).toEqual(time(2017, 3, 7, 13, 53, 55));
        expect(endTimeValue('2017-03-07T13:51:52..13:51:54')).toEqual(time(2017, 3, 7, 13, 51, 55));
        expect(endTimeValue('2017-03-07T13:51:52..15:51:54')).toEqual(time(2017, 3, 7, 15, 51, 55));
        expect(endTimeValue('2017-03-07T13:51:52..07T13:51:54')).toEqual(time(2017, 3, 7, 13, 51, 55));
        expect(endTimeValue('2017-03-07T13:51:52..11T13:51:54')).toEqual(time(2017, 3, 11, 13, 51, 55));
        expect(endTimeValue('2017-03-07T13:51:52..03-07T13:51:54')).toEqual(time(2017, 3, 7, 13, 51, 55));
        expect(endTimeValue('2017-03-07T13:51:52..05-07T13:51:54')).toEqual(time(2017, 5, 7, 13, 51, 55));
        expect(endTimeValue('2017-03-07T13:51:52..2017-03-07T13:51:54')).toEqual(time(2017, 3, 7, 13, 51, 55));
        expect(endTimeValue('2017-03-07T13:51:52..2018-03-07T13:51:54')).toEqual(time(2018, 3, 7, 13, 51, 55));
    });

    test('should compute correct quarter start time', () => {
        expect(startTimeValue('2017Q1..3')).toEqual(time(2017, 1));
        expect(startTimeValue('2017Q1..Q3')).toEqual(time(2017, 1));
        expect(startTimeValue('2017Q1..2017Q3')).toEqual(time(2017, 1));
        expect(startTimeValue('2017Q2..3')).toEqual(time(2017, 4));
        expect(startTimeValue('2017Q3..4')).toEqual(time(2017, 7));
        expect(startTimeValue('2017Q4..2018Q2')).toEqual(time(2017, 10));
    });

    test('should compute correct quarter end time', () => {
        expect(endTimeValue('2017Q1..3')).toEqual(time(2017, 10));
        expect(endTimeValue('2017Q1..Q3')).toEqual(time(2017, 10));
        expect(endTimeValue('2017Q1..2017Q3')).toEqual(time(2017, 10));
        expect(endTimeValue('2017Q2..3')).toEqual(time(2017, 10));
        expect(endTimeValue('2017Q3..4')).toEqual(time(2018));
        expect(endTimeValue('2017Q4..2018Q2')).toEqual(time(2018, 7));
    });

    test('should compute correct week start time', () => {
        expect(startTimeValue('2017W05..07')).toEqual(time(2017, 1, 30));
        expect(startTimeValue('2017W05..W07')).toEqual(time(2017, 1, 30));
        expect(startTimeValue('2017W05..2017W07')).toEqual(time(2017, 1, 30));
        expect(startTimeValue('2010W01..2011W01')).toEqual(time(2010, 1, 4));
    });

    test('should compute correct week end time', () => {
        expect(endTimeValue('2017W05..07')).toEqual(time(2017, 2, 20));
        expect(endTimeValue('2017W05..W07')).toEqual(time(2017, 2, 20));
        expect(endTimeValue('2017W05..2017W07')).toEqual(time(2017, 2, 20));
        expect(endTimeValue('2010W01..2012W01')).toEqual(time(2012, 1, 9));
    });

    test('should compute correct century start time', () => {
        expect(startTimeValue('C20..22')).toEqual(time(1901));
        expect(startTimeValue('C20..C22')).toEqual(time(1901));
        expect(startTimeValue('C5..C20')).toEqual(time(401));
        expect(startTimeValue('C5..20')).toEqual(time(401));
    });

    test('should compute correct century end time', () => {
        expect(endTimeValue('C20..22')).toEqual(time(2201));
        expect(endTimeValue('C20..C22')).toEqual(time(2201));
        expect(endTimeValue('C5..C20')).toEqual(time(2001));
        expect(endTimeValue('C5..20')).toEqual(time(2001));
    });

    test('should compute correct decade start time', () => {
        expect(startTimeValue('D201..202')).toEqual(time(2010));
        expect(startTimeValue('D201..D202')).toEqual(time(2010));
        expect(startTimeValue('D10..200')).toEqual(time(100));
        expect(startTimeValue('D10..D200')).toEqual(time(100));
        expect(startTimeValue('D1..200')).toEqual(time(10));
        expect(startTimeValue('D1..D200')).toEqual(time(10));
    });

    test('should compute correct decade end time', () => {
        expect(endTimeValue('D201..202')).toEqual(time(2030));
        expect(endTimeValue('D201..D202')).toEqual(time(2030));
        expect(endTimeValue('D10..200')).toEqual(time(2010));
        expect(endTimeValue('D10..D200')).toEqual(time(2010));
        expect(endTimeValue('D1..200')).toEqual(time(2010));
        expect(endTimeValue('D1..D200')).toEqual(time(2010));
    });

    test('should compute correct millennium start time', () => {
        expect(startTimeValue('M1..3')).toEqual(time(1));
        expect(startTimeValue('M1..M3')).toEqual(time(1));
        expect(startTimeValue('M2..3')).toEqual(time(1001));
        expect(startTimeValue('M2..M3')).toEqual(time(1001));
    });

    test('should compute correct millennium end time', () => {
        expect(endTimeValue('M1..3')).toEqual(time(3001));
        expect(endTimeValue('M1..M3')).toEqual(time(3001));
        expect(endTimeValue('M2..3')).toEqual(time(3001));
        expect(endTimeValue('M2..M3')).toEqual(time(3001));
    });
});

describe('textToTimeStartEnd on complex iso interval', () => {
    test('should compute correct year start time', () => {
        expect(startTimeValue('2017/2018')).toEqual(time(2017));
        expect(startTimeValue('2017/2019')).toEqual(time(2017));
        expect(startTimeValue('2017/2020')).toEqual(time(2017));
        expect(startTimeValue('2017--2018')).toEqual(time(2017));
        expect(startTimeValue('2017--2019')).toEqual(time(2017));
        expect(startTimeValue('2017--2020')).toEqual(time(2017));
    });

    test('should compute correct year end time', () => {
        expect(endTimeValue('2017/2018')).toEqual(time(2018));
        expect(endTimeValue('2017/2019')).toEqual(time(2019));
        expect(endTimeValue('2017/2020')).toEqual(time(2020));
        expect(endTimeValue('2017--2018')).toEqual(time(2018));
        expect(endTimeValue('2017--2019')).toEqual(time(2019));
        expect(endTimeValue('2017--2020')).toEqual(time(2020));
    });

    test('should compute correct month start time', () => {
        expect(startTimeValue('2017-12/2018-04')).toEqual(time(2017, 12));
        expect(startTimeValue('2017-03/2017-07')).toEqual(time(2017, 3));
        expect(startTimeValue('2017-03/07')).toEqual(time(2017, 3));
        expect(startTimeValue('2017-12--2018-04')).toEqual(time(2017, 12));
        expect(startTimeValue('2017-03--2017-07')).toEqual(time(2017, 3));
        expect(startTimeValue('2017-03--07')).toEqual(time(2017, 3));
    });

    test('should compute correct month end time', () => {
        expect(endTimeValue('2017-12/2018-04')).toEqual(time(2018, 4));
        expect(endTimeValue('2017-03/2017-07')).toEqual(time(2017, 7));
        expect(endTimeValue('2017-03/07')).toEqual(time(2017, 7));
        expect(endTimeValue('2017-12--2018-04')).toEqual(time(2018, 4));
        expect(endTimeValue('2017-03--2017-07')).toEqual(time(2017, 7));
        expect(endTimeValue('2017-03--07')).toEqual(time(2017, 7));
    });

    test('should compute correct day start time', () => {
        expect(startTimeValue('2017-12-31/2018-03-15')).toEqual(time(2017, 12, 31));
        expect(startTimeValue('2017-03-12/2017-06-15')).toEqual(time(2017, 3, 12));
        expect(startTimeValue('2017-03-12/06-15')).toEqual(time(2017, 3, 12));
        expect(startTimeValue('2017-03-12/15')).toEqual(time(2017, 3, 12));
    });

    test('should compute correct day end time', () => {
        expect(endTimeValue('2017-12-31/2018-03-15')).toEqual(time(2018, 3, 15));
        expect(endTimeValue('2017-03-12/2017-06-15')).toEqual(time(2017, 6, 15));
        expect(endTimeValue('2017-03-12/06-15')).toEqual(time(2017, 6, 15));
        expect(endTimeValue('2017-03-12/15')).toEqual(time(2017, 3, 15));
    });
    test('should compute correct hour start time', () => {
        expect(startTimeValue('2017-12-07T21/23')).toEqual(time(2017, 12, 7, 21));
        expect(startTimeValue('2017-12-07T21/07T23')).toEqual(time(2017, 12, 7, 21));
        expect(startTimeValue('2017-12-07T21/12-07T23')).toEqual(time(2017, 12, 7, 21));
        expect(startTimeValue('2017-12-07T21/2017-12-07T23')).toEqual(time(2017, 12, 7, 21));
        expect(startTimeValue('2017-12-07T21/2018-02-07T23')).toEqual(time(2017, 12, 7, 21));
        expect(startTimeValue('2017-03-07T21/05-07T23')).toEqual(time(2017, 3, 7, 21));
    });

    test('should compute correct hour end time', () => {
        expect(endTimeValue('2017-12-07T21/23')).toEqual(time(2017, 12, 7, 23));
        expect(endTimeValue('2017-12-07T21/07T23')).toEqual(time(2017, 12, 7, 23));
        expect(endTimeValue('2017-12-07T21/12-07T23')).toEqual(time(2017, 12, 7, 23));
        expect(endTimeValue('2017-12-07T21/2017-12-07T23')).toEqual(time(2017, 12, 7, 23));
        expect(endTimeValue('2017-12-07T21/2018-02-07T23')).toEqual(time(2018, 2, 7, 23));
        expect(endTimeValue('2017-03-07T21/05-07T23')).toEqual(time(2017, 5, 7, 23));

        expect(endTimeValue('2017-12-07T21/08T00')).toEqual(time(2017, 12, 7, 24));
        expect(endTimeValue('2017-12-07T21/12-08T00')).toEqual(time(2017, 12, 7, 24));
        expect(endTimeValue('2017-12-07T21/2017-12-08T00')).toEqual(time(2017, 12, 7, 24));
        expect(endTimeValue('2017-12-07T21/2018-02-08T00')).toEqual(time(2018, 2, 7, 24));
        expect(endTimeValue('2017-03-07T21/05-08T00')).toEqual(time(2017, 5, 7, 24));
    });

    test('should compute correct second start time', () => {
        expect(startTimeValue('2017-03-07T13:51:52/55')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52/51:55')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52/53:55')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52/13:51:55')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52/15:51:55')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52/07T13:51:55')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52/11T13:51:55')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52/03-07T13:51:55')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52/05-07T13:51:55')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52/2017-03-07T13:51:55')).toEqual(time(2017, 3, 7, 13, 51, 52));
        expect(startTimeValue('2017-03-07T13:51:52/2018-03-07T13:51:55')).toEqual(time(2017, 3, 7, 13, 51, 52));
    });

    test('should compute correct second end time', () => {
        expect(endTimeValue('2017-03-07T13:51:52/55')).toEqual(time(2017, 3, 7, 13, 51, 55));
        expect(endTimeValue('2017-03-07T13:51:52/51:55')).toEqual(time(2017, 3, 7, 13, 51, 55));
        expect(endTimeValue('2017-03-07T13:51:52/53:55')).toEqual(time(2017, 3, 7, 13, 53, 55));
        expect(endTimeValue('2017-03-07T13:51:52/13:51:55')).toEqual(time(2017, 3, 7, 13, 51, 55));
        expect(endTimeValue('2017-03-07T13:51:52/15:51:55')).toEqual(time(2017, 3, 7, 15, 51, 55));
        expect(endTimeValue('2017-03-07T13:51:52/07T13:51:55')).toEqual(time(2017, 3, 7, 13, 51, 55));
        expect(endTimeValue('2017-03-07T13:51:52/11T13:51:55')).toEqual(time(2017, 3, 11, 13, 51, 55));
        expect(endTimeValue('2017-03-07T13:51:52/03-07T13:51:55')).toEqual(time(2017, 3, 7, 13, 51, 55));
        expect(endTimeValue('2017-03-07T13:51:52/05-07T13:51:55')).toEqual(time(2017, 5, 7, 13, 51, 55));
        expect(endTimeValue('2017-03-07T13:51:52/2017-03-07T13:51:55')).toEqual(time(2017, 3, 7, 13, 51, 55));
        expect(endTimeValue('2017-03-07T13:51:52/2018-03-07T13:51:55')).toEqual(time(2018, 3, 7, 13, 51, 55));
    });

    test('should compute correct quarter start time', () => {
        expect(startTimeValue('2017Q1/4')).toEqual(time(2017, 1));
        expect(startTimeValue('2017Q1/Q4')).toEqual(time(2017, 1));
        expect(startTimeValue('2017Q1/2017Q4')).toEqual(time(2017, 1));
        expect(startTimeValue('2017Q2/4')).toEqual(time(2017, 4));
        expect(startTimeValue('2017Q3/2018Q1')).toEqual(time(2017, 7));
        expect(startTimeValue('2017Q4/2018Q3')).toEqual(time(2017, 10));
    });

    test('should compute correct quarter end time', () => {
        expect(endTimeValue('2017Q1/4')).toEqual(time(2017, 10));
        expect(endTimeValue('2017Q1/Q4')).toEqual(time(2017, 10));
        expect(endTimeValue('2017Q1/2017Q4')).toEqual(time(2017, 10));
        expect(endTimeValue('2017Q2/4')).toEqual(time(2017, 10));
        expect(endTimeValue('2017Q3/2018Q1')).toEqual(time(2018));
        expect(endTimeValue('2017Q4/2018Q3')).toEqual(time(2018, 7));
    });

    test('should compute correct week start time', () => {
        expect(startTimeValue('2017W05/08')).toEqual(time(2017, 1, 30));
        expect(startTimeValue('2017W05/W08')).toEqual(time(2017, 1, 30));
        expect(startTimeValue('2017W05/2017W08')).toEqual(time(2017, 1, 30));
        expect(startTimeValue('2010W01/2011W02')).toEqual(time(2010, 1, 4));
    });

    test('should compute correct week end time', () => {
        expect(endTimeValue('2017W05/08')).toEqual(time(2017, 2, 20));
        expect(endTimeValue('2017W05/W08')).toEqual(time(2017, 2, 20));
        expect(endTimeValue('2017W05/2017W08')).toEqual(time(2017, 2, 20));
        expect(endTimeValue('2010W01/2012W02')).toEqual(time(2012, 1, 9));
    });

    test('should compute correct century start time', () => {
        expect(startTimeValue('C20/23')).toEqual(time(1901));
        expect(startTimeValue('C20/C23')).toEqual(time(1901));
        expect(startTimeValue('C5/C21')).toEqual(time(401));
        expect(startTimeValue('C5/20')).toEqual(time(401));
    });

    test('should compute correct century end time', () => {
        expect(endTimeValue('C20/23')).toEqual(time(2201));
        expect(endTimeValue('C20/C23')).toEqual(time(2201));
        expect(endTimeValue('C5/C21')).toEqual(time(2001));
        expect(endTimeValue('C5/21')).toEqual(time(2001));
    });

    test('should compute correct decade start time', () => {
        expect(startTimeValue('D201/203')).toEqual(time(2010));
        expect(startTimeValue('D201/D203')).toEqual(time(2010));
        expect(startTimeValue('D10/201')).toEqual(time(100));
        expect(startTimeValue('D10/D201')).toEqual(time(100));
        expect(startTimeValue('D1/201')).toEqual(time(10));
        expect(startTimeValue('D1/D201')).toEqual(time(10));
    });

    test('should compute correct decade end time', () => {
        expect(endTimeValue('D201/203')).toEqual(time(2030));
        expect(endTimeValue('D201/D203')).toEqual(time(2030));
        expect(endTimeValue('D10/201')).toEqual(time(2010));
        expect(endTimeValue('D10/D201')).toEqual(time(2010));
        expect(endTimeValue('D1/201')).toEqual(time(2010));
        expect(endTimeValue('D1/D201')).toEqual(time(2010));
    });

    test('should compute correct millennium start time', () => {
        expect(startTimeValue('M1/4')).toEqual(time(1));
        expect(startTimeValue('M1/M4')).toEqual(time(1));
        expect(startTimeValue('M2/4')).toEqual(time(1001));
        expect(startTimeValue('M2/M4')).toEqual(time(1001));
    });

    test('should compute correct millennium end time', () => {
        expect(endTimeValue('M1/4')).toEqual(time(3001));
        expect(endTimeValue('M1/M4')).toEqual(time(3001));
        expect(endTimeValue('M2/4')).toEqual(time(3001));
        expect(endTimeValue('M2/M4')).toEqual(time(3001));
    });
});

describe('textToTimeStartEnd resolution', () => {
    test('on single calendar unit', () => {
        expect(resolution('2018')).toEqual('year');
        expect(resolution('2018-12')).toEqual('month');
        expect(resolution('2018-12-31')).toEqual('day');
        expect(resolution('2018-12-31T03')).toEqual('hour');
        expect(resolution('2018-12-31T03:02')).toEqual('minute');
        expect(resolution('2018-12-31T03:02:03')).toEqual('second');
        expect(resolution('2018-Q1')).toEqual('quarter');
        expect(resolution('2018-W03')).toEqual('week');
        expect(resolution('C21')).toEqual('century');
        expect(resolution('D210')).toEqual('decade');
        expect(resolution('M3')).toEqual('millennium');
    });
    test('on complex abbreviated period', () => {
        expect(resolution('2018..2018')).toEqual('year');
        expect(resolution('2018..2020')).toEqual('year');
        expect(resolution('2018-02..04')).toEqual('month');
        expect(resolution('2018-02..2018-04')).toEqual('month');
        expect(resolution('2018-02..2019-01')).toEqual('month');
        expect(resolution('2018-12-31..2019-01-01')).toEqual('day');
        expect(resolution('2018-12-31T03..04')).toEqual('hour');
        expect(resolution('2018-12-31T03:02..T04:03')).toEqual('minute');
        expect(resolution('2018-12-31T03:02:03')).toEqual('second');
        expect(resolution('2018-12-31T03:02:03..04:03:01')).toEqual('second');
        expect(resolution('2018-Q1..Q3')).toEqual('quarter');
        expect(resolution('2018-W03..05')).toEqual('week');
        expect(resolution('C21..22')).toEqual('century');
        expect(resolution('D210..211')).toEqual('decade');
        expect(resolution('M3..M3')).toEqual('millennium');


    });

    test('on complex abbreviated period respect displayed resolution', () => {
        expect(resolution('2018-01-01..2018-12-31')).toEqual('day');
        expect(resolution('1901..2000')).toEqual('year');
        expect(resolution('1901-01..2000-12')).toEqual('month');
        expect(resolution('2017-Q1..2017-Q2')).toEqual('quarter');
    });

    test('on complex iso period', () => {
        expect(resolution('2018/2019')).toEqual('year');
        expect(resolution('2018/2021')).toEqual('year');
        expect(resolution('2018-02/04')).toEqual('month');
        expect(resolution('2018-02/2018-04')).toEqual('month');
        expect(resolution('2018-02/2019-01')).toEqual('month');
        expect(resolution('2018-12-31/2019-01-01')).toEqual('day');
        expect(resolution('2018-12-31T03/04')).toEqual('hour');
        expect(resolution('2018-12-31T03:02/T04:03')).toEqual('minute');
        expect(resolution('2018-12-31T03:02:03')).toEqual('second');
        expect(resolution('2018-12-31T03:02:03/04:03:01')).toEqual('second');
        expect(resolution('2018-Q1/Q4')).toEqual('quarter');
        expect(resolution('2018-W03/06')).toEqual('week');
        expect(resolution('C21/23')).toEqual('century');
        expect(resolution('D210/212')).toEqual('decade');
        expect(resolution('M3/M4')).toEqual('millennium');
    });

    test('on complex iso period respect displayed resolution', () => {
        expect(resolution('2018-01-01/2019-01-01')).toEqual('day');
        expect(resolution('1901/2001')).toEqual('year');
        expect(resolution('1901-01/2001-01')).toEqual('month');
        expect(resolution('2017-Q1/2018-Q1')).toEqual('quarter');
        expect(resolution('2017-Q1/2018-Q1')).toEqual('quarter');
    });

});

function abbrPeriod (start, end, forced=null) {
    const { abbr, duration, resolution } = timeStartEndToText(start, end, forced, false);
    return [abbr, duration, resolution];
}

function isoPeriod (start, end, forced=null) {
    return timeStartEndToText(start, end, forced, false).iso;
}

describe('timeStartEndToText calendar units', () => {
    test('should compute correct year', () => {
        expect(abbrPeriod(time(2017), time(2018))).toEqual(['2017', 1, 'year']);
    });
    test('should compute correct month', () => {
        expect(abbrPeriod(time(2017, 12), time(2018, 1))).toEqual(['2017-12', 1, 'month']);
        expect(abbrPeriod(time(2017, 1), time(2017, 2))).toEqual(['2017-01', 1, 'month']);
    });
    test('should compute correct day', () => {
        expect(abbrPeriod(time(2017, 12, 1), time(2017, 12, 2))).toEqual(['2017-12-01', 1, 'day']);
        expect(abbrPeriod(time(2017, 12, 31), time(2018))).toEqual(['2017-12-31', 1, 'day']);
        expect(abbrPeriod(time(2017, 11, 30), time(2017, 12))).toEqual(['2017-11-30', 1, 'day']);
    });
    test('should compute correct week', () => {
        expect(abbrPeriod(time(2017, 1, 30), time(2017, 2, 6))).toEqual(['2017-W05', 1, 'week']);
        expect(abbrPeriod(time(2013, 4, 8), time(2013, 4, 15))).toEqual(['2013-W15', 1, 'week']);
        expect(abbrPeriod(time(2009, 12, 28), time(2010, 1, 4))).toEqual(['2009-W53', 1, 'week']);
        expect(abbrPeriod(time(2010, 1, 4), time(2010, 1, 11))).toEqual(['2010-W01', 1, 'week']);
        expect(abbrPeriod(time(2011, 12, 26), time(2012, 1, 2))).toEqual(['2011-W52', 1, 'week']);
        expect(abbrPeriod(time(2012, 1, 2), time(2012, 1, 9))).toEqual(['2012-W01', 1, 'week']);
        expect(abbrPeriod(time(2013, 12, 30), time(2014, 1, 6))).toEqual(['2014-W01', 1, 'week']);
        expect(abbrPeriod(time(2014, 1, 6), time(2014, 1, 13))).toEqual(['2014-W02', 1, 'week']);
    });
    test('should compute correct quarter', () => {
        expect(abbrPeriod(time(2017, 1), time(2017, 4))).toEqual(['2017-Q1', 1, 'quarter']);
        expect(abbrPeriod(time(2017, 4), time(2017, 7))).toEqual(['2017-Q2', 1, 'quarter']);
        expect(abbrPeriod(time(2017, 7), time(2017, 10))).toEqual(['2017-Q3', 1, 'quarter']);
        expect(abbrPeriod(time(2017, 10), time(2018))).toEqual(['2017-Q4', 1, 'quarter']);
    });
    test('should compute correct hour', () => {
        expect(abbrPeriod(time(2017, 12, 1, 3), time(2017, 12, 1, 4))).toEqual(['2017-12-01T03', 1, 'hour']);
        expect(abbrPeriod(time(2017, 12, 1, 23), time(2017, 12, 2, 0))).toEqual(['2017-12-01T23', 1, 'hour']);
        expect(abbrPeriod(time(2017, 12, 1, 0), time(2017, 12, 1, 1))).toEqual(['2017-12-01T00', 1, 'hour']);
        expect(abbrPeriod(time(2017, 12, 31, 23), time(2018))).toEqual(['2017-12-31T23', 1, 'hour']);
    });
    test('should compute correct minute', () => {
        expect(abbrPeriod(time(2017, 12, 1, 3, 2), time(2017, 12, 1, 3, 3))).toEqual(['2017-12-01T03:02', 1, 'minute']);
    });
    test('should compute correct century', () => {
        expect(abbrPeriod(time(2001), time(2101))).toEqual(['C21', 1, 'century']);
        expect(abbrPeriod(time(1901), time(2001))).toEqual(['C20', 1, 'century']);
        expect(abbrPeriod(time(1801), time(1901))).toEqual(['C19', 1, 'century']);
    });
    test('should compute correct millennium', () => {
        expect(abbrPeriod(time(2001), time(3001))).toEqual(['M3', 1, 'millennium']);
        expect(abbrPeriod(time(1001), time(2001))).toEqual(['M2', 1, 'millennium']);
    });
    test('should compute correct decade', () => {
        expect(abbrPeriod(time(2000), time(2010))).toEqual(['D200', 1, 'decade']);
        expect(abbrPeriod(time(2010), time(2020))).toEqual(['D201', 1, 'decade']);
    });
    test('semesters period', () => {
        expect(abbrPeriod(time(2017, 1), time(2017, 7))).toEqual(['2017S1', 1, 'semester']);
    });
});

describe('timeStartEndToText abbr multiple calendar units', () => {
    test('millenniums period', () => {
        expect(abbrPeriod(time(2001), time(4001))).toEqual(['M3..4', 2, 'millennium']);
        expect(abbrPeriod(time(1001), time(4001))).toEqual(['M2..4', 3, 'millennium']);
    });
    test('centuries period', () => {
        expect(abbrPeriod(time(2001), time(2201))).toEqual(['C21..22', 2, 'century']);
        expect(abbrPeriod(time(1901), time(2201))).toEqual(['C20..22', 3, 'century']);
        expect(abbrPeriod(time(1801), time(2001))).toEqual(['C19..20', 2, 'century']);
    });
    test('decades period', () => {
        expect(abbrPeriod(time(2000), time(2020))).toEqual(['D200..201', 2, 'decade']);
        expect(abbrPeriod(time(2010), time(2040))).toEqual(['D201..203', 3, 'decade']);
        expect(abbrPeriod(time(2000), time(2100))).toEqual(['D200..209', 10, 'decade']);
        expect(abbrPeriod(time(1000), time(2000))).toEqual(['D100..199', 100, 'decade']);
    });
    test('years period', () => {
        expect(abbrPeriod(time(2017), time(2019))).toEqual(['2017..2018', 2, 'year']);
        expect(abbrPeriod(time(2011), time(2021))).toEqual(['2011..2020', 10, 'year']);
        expect(abbrPeriod(time(1833), time(1933))).toEqual(['1833..1932', 100, 'year']);
        expect(abbrPeriod(time(1003), time(2003))).toEqual(['1003..2002', 1000, 'year']);
    });
    test('months period', () => {
        expect(abbrPeriod(time(2017, 12), time(2018, 4))).toEqual(['2017-12..2018-03', 4, 'month']);
        expect(abbrPeriod(time(2017, 1), time(2017, 6))).toEqual(['2017-01..05', 5, 'month']);
        expect(abbrPeriod(time(2017, 2), time(2018, 2))).toEqual(['2017-02..2018-01', 12, 'month']);
        expect(abbrPeriod(time(1917, 2), time(2017, 2))).toEqual(['1917-02..2017-01', 1200, 'month']);
        expect(abbrPeriod(time(2001, 3), time(2101, 3))).toEqual(['2001-03..2101-02', 1200, 'month']);
    });
    test('days period', () => {
        expect(abbrPeriod(time(2017, 12, 1), time(2017, 12, 4))).toEqual(['2017-12-01..03', 3, 'day']);
        expect(abbrPeriod(time(2017, 12, 31), time(2018, 1, 3))).toEqual(['2017-12-31..2018-01-02', 3, 'day']);
        expect(abbrPeriod(time(2017, 11, 28), time(2017, 12))).toEqual(['2017-11-28..30', 3, 'day']);
        expect(abbrPeriod(time(2017, 3, 28), time(2017, 4))).toEqual(['2017-03-28..31', 4, 'day']);
        expect(abbrPeriod(time(2017, 3, 30), time(2017, 4, 12))).toEqual(['2017-03-30..04-11', 13, 'day']);
        expect(abbrPeriod(time(2017, 1, 2), time(2017, 2, 2))).toEqual(['2017-01-02..02-01', 31, 'day']);
        expect(abbrPeriod(time(2017, 1, 2), time(2017, 3, 2))).toEqual(['2017-01-02..03-01', 59, 'day']);
        expect(abbrPeriod(time(2017, 1, 2), time(2018, 1, 2))).toEqual(['2017-01-02..2018-01-01', 365, 'day']);
        expect(abbrPeriod(time(2017, 1, 29), time(2017, 2, 5))).toEqual(['2017-01-29..02-04', 7, 'day']);
    });
    test('weeks period', () => {
        expect(abbrPeriod(time(2017, 1, 30), time(2017, 2, 13))).toEqual(['2017-W05..06', 2, 'week']);
        expect(abbrPeriod(time(2013, 4, 8), time(2013, 4, 22))).toEqual(['2013-W15..16', 2, 'week']);
        expect(abbrPeriod(time(2009, 12, 28), time(2010, 1, 18))).toEqual(['2009-W53..2010-W02', 3, 'week']);
        expect(abbrPeriod(time(2010, 1, 4), time(2010, 2, 1))).toEqual(['2010-W01..04', 4, 'week']);
        expect(abbrPeriod(time(2009, 12, 28), time(2010, 1, 11))).toEqual(['2009-W53..2010-W01', 2, 'week']);
        expect(abbrPeriod(time(2011, 12, 26), time(2012, 1, 16))).toEqual(['2011-W52..2012-W02', 3, 'week']);
        expect(abbrPeriod(time(2012, 1, 2), time(2012, 1, 30))).toEqual(['2012-W01..04', 4, 'week']);
        expect(abbrPeriod(time(2013, 12, 30), time(2014, 1, 20))).toEqual(['2014-W01..03', 3, 'week']);
        expect(abbrPeriod(time(2014, 1, 6), time(2015, 1, 12))).toEqual(['2014-W02..2015-W02', 53, 'week']);
        expect(abbrPeriod(time(2014, 1, 6), time(2015, 1, 5))).toEqual(['2014-W02..2015-W01', 52, 'week']);
    });
    test('quarters period', () => {
        expect(abbrPeriod(time(2017, 4), time(2017, 10))).toEqual(['2017-Q2..3', 2, 'quarter']);
        expect(abbrPeriod(time(2017, 4), time(2018, 1))).toEqual(['2017-Q2..4', 3, 'quarter']);
        expect(abbrPeriod(time(2017, 7), time(2018, 4))).toEqual(['2017-Q3..2018-Q1', 3, 'quarter']);
        expect(abbrPeriod(time(2017, 10), time(2019))).toEqual(['2017-Q4..2018-Q4', 5, 'quarter']);
    });
    test('should compute correct hour', () => {
        expect(abbrPeriod(time(2017, 12, 1, 3), time(2017, 12, 1, 5))).toEqual(['2017-12-01T03..04', 2, 'hour']);
        expect(abbrPeriod(time(2017, 12, 1, 23), time(2017, 12, 2, 3))).toEqual(['2017-12-01T23..02T02', 4, 'hour']);
        expect(abbrPeriod(time(2017, 12, 1, 0), time(2018, 1, 1, 1))).toEqual(["2017-12-01T00..2018-01-01T00", 745, "hour"]);
        expect(abbrPeriod(time(2017, 12, 31, 23), time(2019))).toEqual(["2017-12-31T23..2018-12-31T23", 8761, "hour"]);
    });
    test('should compute correct minute', () => {
        expect(abbrPeriod(time(2017, 12, 1, 3, 2), time(2017, 12, 2, 3, 2))).toEqual(['2017-12-01T03:02..02T03:01', 1440, 'minute']);
    });
});

describe('timeStartEndToText iso multiple calendar units', () => {
    test('millenniums period', () => {
        expect(isoPeriod(time(2001), time(4001))).toEqual('M3/5');
        expect(isoPeriod(time(1001), time(4001))).toEqual('M2/5');
    });
    test('centuries period', () => {
        expect(isoPeriod(time(2001), time(2201))).toEqual('C21/23');
        expect(isoPeriod(time(1901), time(2201))).toEqual('C20/23');
        expect(isoPeriod(time(1801), time(2001))).toEqual('C19/21');
    });
    test('decades period', () => {
        expect(isoPeriod(time(2000), time(2020))).toEqual('D200/202');
        expect(isoPeriod(time(2010), time(2040))).toEqual('D201/204');
        expect(isoPeriod(time(2000), time(2100))).toEqual('D200/210');
        expect(isoPeriod(time(1000), time(2000))).toEqual('D100/200');
    });
    test('years period', () => {
        expect(isoPeriod(time(2017), time(2019))).toEqual('2017/2019');
        expect(isoPeriod(time(2011), time(2021))).toEqual('2011/2021');
        expect(isoPeriod(time(1833), time(1933))).toEqual('1833/1933');
        expect(isoPeriod(time(1003), time(2003))).toEqual('1003/2003');
    });
    test('months period', () => {
        expect(isoPeriod(time(2017, 12), time(2018, 4))).toEqual('2017-12/2018-04');
        expect(isoPeriod(time(2017, 1), time(2017, 6))).toEqual('2017-01/06');
        expect(isoPeriod(time(2017, 2), time(2018, 2))).toEqual('2017-02/2018-02');
        expect(isoPeriod(time(1917, 2), time(2017, 2))).toEqual('1917-02/2017-02');
        expect(isoPeriod(time(2001, 3), time(2101, 3))).toEqual('2001-03/2101-03');
    });
    test('days period', () => {
        expect(isoPeriod(time(2017, 12, 1), time(2017, 12, 4))).toEqual('2017-12-01/04');
        expect(isoPeriod(time(2017, 12, 31), time(2018, 1, 3))).toEqual('2017-12-31/2018-01-03');
        expect(isoPeriod(time(2017, 11, 28), time(2017, 12))).toEqual('2017-11-28/12-01');
        expect(isoPeriod(time(2017, 3, 28), time(2017, 4))).toEqual('2017-03-28/04-01');
        expect(isoPeriod(time(2017, 3, 30), time(2017, 4, 12))).toEqual('2017-03-30/04-12');
        expect(isoPeriod(time(2017, 1, 2), time(2017, 2, 2))).toEqual('2017-01-02/02-02');
        expect(isoPeriod(time(2017, 1, 2), time(2017, 3, 2))).toEqual('2017-01-02/03-02');
        expect(isoPeriod(time(2017, 1, 2), time(2018, 1, 2))).toEqual('2017-01-02/2018-01-02');
        expect(isoPeriod(time(2017, 1, 29), time(2017, 2, 5))).toEqual('2017-01-29/02-05');
    });
    test('weeks period', () => {
        expect(isoPeriod(time(2017, 1, 30), time(2017, 2, 13))).toEqual('2017-W05/07');
        expect(isoPeriod(time(2013, 4, 8), time(2013, 4, 22))).toEqual('2013-W15/17');
        expect(isoPeriod(time(2009, 12, 28), time(2010, 1, 18))).toEqual('2009-W53/2010-W03');
        expect(isoPeriod(time(2010, 1, 4), time(2010, 2, 1))).toEqual('2010-W01/05');
        expect(isoPeriod(time(2009, 12, 28), time(2010, 1, 11))).toEqual('2009-W53/2010-W02');
        expect(isoPeriod(time(2011, 12, 26), time(2012, 1, 16))).toEqual('2011-W52/2012-W03');
        expect(isoPeriod(time(2012, 1, 2), time(2012, 1, 30))).toEqual('2012-W01/05');
        expect(isoPeriod(time(2013, 12, 30), time(2014, 1, 20))).toEqual('2014-W01/04');
        expect(isoPeriod(time(2014, 1, 6), time(2015, 1, 12))).toEqual('2014-W02/2015-W03');
        expect(isoPeriod(time(2014, 1, 6), time(2015, 1, 5))).toEqual('2014-W02/2015-W02');
    });
    test('quarters period', () => {
        expect(isoPeriod(time(2017, 4), time(2017, 10))).toEqual('2017-Q2/4');
        expect(isoPeriod(time(2017, 4), time(2018, 1))).toEqual('2017-Q2/2018-Q1');
        expect(isoPeriod(time(2017, 7), time(2018, 4))).toEqual('2017-Q3/2018-Q2');
        expect(isoPeriod(time(2017, 10), time(2019))).toEqual('2017-Q4/2019-Q1');
    });
    test('should compute correct hour', () => {
        expect(isoPeriod(time(2017, 12, 1, 3), time(2017, 12, 1, 5))).toEqual('2017-12-01T03/05');
        expect(isoPeriod(time(2017, 12, 1, 23), time(2017, 12, 2, 3))).toEqual('2017-12-01T23/02T03');
        expect(isoPeriod(time(2017, 12, 1, 0), time(2018, 1, 1, 1))).toEqual("2017-12-01T00/2018-01-01T01");
        expect(isoPeriod(time(2017, 12, 31, 23), time(2019))).toEqual("2017-12-31T23/2019-01-01T00");
    });
    test('should compute correct minute', () => {
        expect(isoPeriod(time(2017, 12, 1, 3, 2), time(2017, 12, 2, 3, 2))).toEqual('2017-12-01T03:02/02T03:02');
    });
});

describe('timeStartEndToText with forced resolution', () => {
    test('forced centuries', () => {
        expect(abbrPeriod(time(2001), time(3001), 'century')).toEqual(['C21..30', 10, 'century']);
        expect(abbrPeriod(time(1001), time(2001), 'century')).toEqual(['C11..20', 10, 'century']);
        expect(abbrPeriod(time(2001), time(4001), 'century')).toEqual(['C21..40', 20, 'century']);
        expect(abbrPeriod(time(1001), time(4001), 'century')).toEqual(['C11..40', 30, 'century']);
    });
});
describe('roundDateValue', () => {
    test('round correctly', () => {
        expect(roundDateValue(time(2018,1,1), 'month', 'floor')).toEqual(time(2018,1));
        expect(roundDateValue(time(2018,1,1), 'month', 'ceil')).toEqual(time(2018,1));
        expect(roundDateValue(time(2018,1,1,1), 'month', 'floor')).toEqual(time(2018,1));
        expect(roundDateValue(time(2018,1,1,1), 'month', 'ceil')).toEqual(time(2018,2));
        expect(roundDateValue(time(2018,1,1,2), 'month', 'floor')).toEqual(time(2018,1));
        expect(roundDateValue(time(2018,1,1,2), 'month', 'ceil')).toEqual(time(2018,2));

        expect(roundDateValue(time(2018,1,1), 'day', 'floor')).toEqual(time(2018,1,1));
        expect(roundDateValue(time(2018,1,1), 'day', 'ceil')).toEqual(time(2018,1,1));
        expect(roundDateValue(time(2018,1,1,1), 'day', 'floor')).toEqual(time(2018,1,1));
        expect(roundDateValue(time(2018,1,1,1), 'day', 'ceil')).toEqual(time(2018,1,2));
        expect(roundDateValue(time(2018,1,1,4), 'hour', 'floor')).toEqual(time(2018,1,1,4));
        expect(roundDateValue(time(2018,1,1,4), 'hour', 'ceil')).toEqual(time(2018,1,1,4));
        expect(roundDateValue(time(2018,1,1,4,1), 'hour', 'floor')).toEqual(time(2018,1,1,4));
        expect(roundDateValue(time(2018,1,1,4,1), 'hour', 'ceil')).toEqual(time(2018,1,1,5));

        expect(roundDateValue(time(2018,1,3), 'month', 'floor')).toEqual(time(2018,1));
        expect(roundDateValue(time(2018,1,3), 'month', 'ceil')).toEqual(time(2018,2));
        expect(roundDateValue(time(2018,1,3), 'quarter', 'floor')).toEqual(time(2018,1));
        expect(roundDateValue(time(2018,1,3), 'quarter', 'ceil')).toEqual(time(2018,4));
        expect(roundDateValue(time(2018,1,1), 'quarter', 'floor')).toEqual(time(2018,1));
        expect(roundDateValue(time(2018,1,1), 'quarter', 'ceil')).toEqual(time(2018,1));
        expect(roundDateValue(time(2018,1,1,1), 'quarter', 'floor')).toEqual(time(2018,1));
        expect(roundDateValue(time(2018,1,1,1), 'quarter', 'ceil')).toEqual(time(2018,4));

        expect(roundDateValue(time(2019,5,13), 'week', 'floor')).toEqual(time(2019,5,13));
        expect(roundDateValue(time(2019,5,13,13), 'week', 'floor')).toEqual(time(2019,5,13));
        expect(roundDateValue(time(2019,5,14), 'week', 'floor')).toEqual(time(2019,5,13));
        expect(roundDateValue(time(2019,5,19), 'week', 'floor')).toEqual(time(2019,5,13));
        expect(roundDateValue(time(2019,5,12,23), 'week', 'floor')).toEqual(time(2019,5,6));
        expect(roundDateValue(time(2019,5,20), 'week', 'floor')).toEqual(time(2019,5,20));

        expect(roundDateValue(time(2019,5,13), 'week', 'ceil')).toEqual(time(2019,5,13));
        expect(roundDateValue(time(2019,5,13,13), 'week', 'ceil')).toEqual(time(2019,5,20));
        expect(roundDateValue(time(2019,5,14), 'week', 'ceil')).toEqual(time(2019,5,20));
        expect(roundDateValue(time(2019,5,19), 'week', 'ceil')).toEqual(time(2019,5,20));
        expect(roundDateValue(time(2019,5,12,23), 'week', 'ceil')).toEqual(time(2019,5,13));
        expect(roundDateValue(time(2019,5,6,0,0,1), 'week', 'ceil')).toEqual(time(2019,5,13));
        expect(roundDateValue(time(2019,5,20), 'week', 'ceil')).toEqual(time(2019,5,20));

    });
});

