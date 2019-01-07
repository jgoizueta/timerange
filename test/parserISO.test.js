const parserISO = require('../parserISO');

function time (y, m = 1, d = 1, h = 0, min = 0, sec = 0) {
    return Date.UTC(y, m - 1, d, h, min, sec);
}

function timeValue (parsed) {
    return Date.UTC(parsed.year, parsed.month - 1, parsed.day, parsed.hour, parsed.minute, parsed.second);
}

function startTimeValue(iso) {
    return timeValue(parserISO(iso).start);
}

function endTimeValue (iso) {
    return timeValue(parserISO(iso).end);
}

function resolution (iso) {
    return parserISO(iso).resolution;
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

describe('parseISO on complex abbr interval', () => {
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

describe('parseISO on complex iso interval', () => {
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

describe('parseISO resolution', () => {
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