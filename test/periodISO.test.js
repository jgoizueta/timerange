const periodISO = require('../periodISO');

function time (y, m = 1, d = 1, h = 0, min = 0, sec = 0) {
    return Date.UTC(y, m - 1, d, h, min, sec);
}

function ISOperiod (start, end, forced=null) {
    const { iso, duration, resolution } = periodISO(start, end, forced, false);
    return [iso, duration, resolution];
}

describe('periodISO calendar units', () => {
    test('should compute correct year', () => {
        expect(ISOperiod(time(2017), time(2018))).toEqual(['2017', 1, 'year']);
    });
    test('should compute correct month', () => {
        expect(ISOperiod(time(2017, 12), time(2018, 1))).toEqual(['2017-12', 1, 'month']);
        expect(ISOperiod(time(2017, 1), time(2017, 2))).toEqual(['2017-01', 1, 'month']);
    });
    test('should compute correct day', () => {
        expect(ISOperiod(time(2017, 12, 1), time(2017, 12, 2))).toEqual(['2017-12-01', 1, 'day']);
        expect(ISOperiod(time(2017, 12, 31), time(2018))).toEqual(['2017-12-31', 1, 'day']);
        expect(ISOperiod(time(2017, 11, 30), time(2017, 12))).toEqual(['2017-11-30', 1, 'day']);
    });
    test('should compute correct week', () => {
        expect(ISOperiod(time(2017, 1, 30), time(2017, 2, 6))).toEqual(['2017-W05', 1, 'week']);
        expect(ISOperiod(time(2013, 4, 8), time(2013, 4, 15))).toEqual(['2013-W15', 1, 'week']);
        expect(ISOperiod(time(2009, 12, 28), time(2010, 1, 4))).toEqual(['2009-W53', 1, 'week']);
        expect(ISOperiod(time(2010, 1, 4), time(2010, 1, 11))).toEqual(['2010-W01', 1, 'week']);
        expect(ISOperiod(time(2011, 12, 26), time(2012, 1, 2))).toEqual(['2011-W52', 1, 'week']);
        expect(ISOperiod(time(2012, 1, 2), time(2012, 1, 9))).toEqual(['2012-W01', 1, 'week']);
        expect(ISOperiod(time(2013, 12, 30), time(2014, 1, 6))).toEqual(['2014-W01', 1, 'week']);
        expect(ISOperiod(time(2014, 1, 6), time(2014, 1, 13))).toEqual(['2014-W02', 1, 'week']);
    });
    test('should compute correct quarter', () => {
        expect(ISOperiod(time(2017, 1), time(2017, 4))).toEqual(['2017-Q1', 1, 'quarter']);
        expect(ISOperiod(time(2017, 4), time(2017, 7))).toEqual(['2017-Q2', 1, 'quarter']);
        expect(ISOperiod(time(2017, 7), time(2017, 10))).toEqual(['2017-Q3', 1, 'quarter']);
        expect(ISOperiod(time(2017, 10), time(2018))).toEqual(['2017-Q4', 1, 'quarter']);
    });
    test('should compute correct hour', () => {
        expect(ISOperiod(time(2017, 12, 1, 3), time(2017, 12, 1, 4))).toEqual(['2017-12-01T03', 1, 'hour']);
        expect(ISOperiod(time(2017, 12, 1, 23), time(2017, 12, 2, 0))).toEqual(['2017-12-01T23', 1, 'hour']);
        expect(ISOperiod(time(2017, 12, 1, 0), time(2017, 12, 1, 1))).toEqual(['2017-12-01T00', 1, 'hour']);
        expect(ISOperiod(time(2017, 12, 31, 23), time(2018))).toEqual(['2017-12-31T23', 1, 'hour']);
    });
    test('should compute correct minute', () => {
        expect(ISOperiod(time(2017, 12, 1, 3, 2), time(2017, 12, 1, 3, 3))).toEqual(['2017-12-01T03:02', 1, 'minute']);
    });
    test('should compute correct century', () => {
        expect(ISOperiod(time(2001), time(2101))).toEqual(['C21', 1, 'century']);
        expect(ISOperiod(time(1901), time(2001))).toEqual(['C20', 1, 'century']);
        expect(ISOperiod(time(1801), time(1901))).toEqual(['C19', 1, 'century']);
    });
    test('should compute correct millennium', () => {
        expect(ISOperiod(time(2001), time(3001))).toEqual(['M3', 1, 'millenium']);
        expect(ISOperiod(time(1001), time(2001))).toEqual(['M2', 1, 'millenium']);
    });
    test('should compute correct decade', () => {
        expect(ISOperiod(time(2000), time(2010))).toEqual(['D200', 1, 'decade']);
        expect(ISOperiod(time(2010), time(2020))).toEqual(['D201', 1, 'decade']);
    });
    test('semesters period', () => {
        expect(ISOperiod(time(2017, 1), time(2017, 7))).toEqual(['2017S1', 1, 'semester']);
    });
});

describe('periodISO multiple calendar units', () => {
    test('milleniums period', () => {
        expect(ISOperiod(time(2001), time(4001))).toEqual(['M3--4', 2, 'millenium']);
        expect(ISOperiod(time(1001), time(4001))).toEqual(['M2--4', 3, 'millenium']);
    });
    test('centuries period', () => {
        expect(ISOperiod(time(2001), time(2201))).toEqual(['C21--22', 2, 'century']);
        expect(ISOperiod(time(1901), time(2201))).toEqual(['C20--22', 3, 'century']);
        expect(ISOperiod(time(1801), time(2001))).toEqual(['C19--20', 2, 'century']);
    });
    test('decades period', () => {
        expect(ISOperiod(time(2000), time(2020))).toEqual(['D200--201', 2, 'decade']);
        expect(ISOperiod(time(2010), time(2040))).toEqual(['D201--203', 3, 'decade']);
        expect(ISOperiod(time(2000), time(2100))).toEqual(['D200--209', 10, 'decade']);
        expect(ISOperiod(time(1000), time(2000))).toEqual(['D100--199', 100, 'decade']);
    });
    test('years period', () => {
        expect(ISOperiod(time(2017), time(2019))).toEqual(['2017--2018', 2, 'year']);
        expect(ISOperiod(time(2011), time(2021))).toEqual(['2011--2020', 10, 'year']);
        expect(ISOperiod(time(1833), time(1933))).toEqual(['1833--1932', 100, 'year']);
        expect(ISOperiod(time(1003), time(2003))).toEqual(['1003--2002', 1000, 'year']);
    });
    test('months period', () => {
        expect(ISOperiod(time(2017, 12), time(2018, 4))).toEqual(['2017-12--2018-03', 4, 'month']);
        expect(ISOperiod(time(2017, 1), time(2017, 6))).toEqual(['2017-01--05', 5, 'month']);
        expect(ISOperiod(time(2017, 2), time(2018, 2))).toEqual(['2017-02--2018-01', 12, 'month']);
        expect(ISOperiod(time(1917, 2), time(2017, 2))).toEqual(['1917-02--2017-01', 1200, 'month']);
        expect(ISOperiod(time(2001, 3), time(2101, 3))).toEqual(['2001-03--2101-02', 1200, 'month']);
    });
    test('days period', () => {
        expect(ISOperiod(time(2017, 12, 1), time(2017, 12, 4))).toEqual(['2017-12-01--03', 3, 'day']);
        expect(ISOperiod(time(2017, 12, 31), time(2018, 1, 3))).toEqual(['2017-12-31--2018-01-02', 3, 'day']);
        expect(ISOperiod(time(2017, 11, 28), time(2017, 12))).toEqual(['2017-11-28--30', 3, 'day']);
        expect(ISOperiod(time(2017, 3, 28), time(2017, 4))).toEqual(['2017-03-28--31', 4, 'day']);
        expect(ISOperiod(time(2017, 3, 30), time(2017, 4, 12))).toEqual(['2017-03-30--04-11', 13, 'day']);
        expect(ISOperiod(time(2017, 1, 2), time(2017, 2, 2))).toEqual(['2017-01-02--02-01', 31, 'day']);
        expect(ISOperiod(time(2017, 1, 2), time(2017, 3, 2))).toEqual(['2017-01-02--03-01', 59, 'day']);
        expect(ISOperiod(time(2017, 1, 2), time(2018, 1, 2))).toEqual(['2017-01-02--2018-01-01', 365, 'day']);
        expect(ISOperiod(time(2017, 1, 29), time(2017, 2, 5))).toEqual(['2017-01-29--02-04', 7, 'day']);
    });
    test('weeks period', () => {
        expect(ISOperiod(time(2017, 1, 30), time(2017, 2, 13))).toEqual(['2017-W05--06', 2, 'week']);
        expect(ISOperiod(time(2013, 4, 8), time(2013, 4, 22))).toEqual(['2013-W15--16', 2, 'week']);
        expect(ISOperiod(time(2009, 12, 28), time(2010, 1, 18))).toEqual(['2009-W53--2010-W02', 3, 'week']);
        expect(ISOperiod(time(2010, 1, 4), time(2010, 2, 1))).toEqual(['2010-W01--04', 4, 'week']);
        expect(ISOperiod(time(2009, 12, 28), time(2010, 1, 11))).toEqual(['2009-W53--2010-W01', 2, 'week']);
        expect(ISOperiod(time(2011, 12, 26), time(2012, 1, 16))).toEqual(['2011-W52--2012-W02', 3, 'week']);
        expect(ISOperiod(time(2012, 1, 2), time(2012, 1, 30))).toEqual(['2012-W01--04', 4, 'week']);
        expect(ISOperiod(time(2013, 12, 30), time(2014, 1, 20))).toEqual(['2014-W01--03', 3, 'week']);
        expect(ISOperiod(time(2014, 1, 6), time(2015, 1, 12))).toEqual(['2014-W02--2015-W02', 53, 'week']);
        expect(ISOperiod(time(2014, 1, 6), time(2015, 1, 5))).toEqual(['2014-W02--2015-W01', 52, 'week']);
    });
    test('quarters period', () => {
        expect(ISOperiod(time(2017, 4), time(2017, 10))).toEqual(['2017-Q2--3', 2, 'quarter']);
        expect(ISOperiod(time(2017, 4), time(2018, 1))).toEqual(['2017-Q2--4', 3, 'quarter']);
        expect(ISOperiod(time(2017, 7), time(2018, 4))).toEqual(['2017-Q3--2018-Q1', 3, 'quarter']);
        expect(ISOperiod(time(2017, 10), time(2019))).toEqual(['2017-Q4--2018-Q4', 5, 'quarter']);
    });
    test('should compute correct hour', () => {
        expect(ISOperiod(time(2017, 12, 1, 3), time(2017, 12, 1, 5))).toEqual(['2017-12-01T03--04', 2, 'hour']);
        expect(ISOperiod(time(2017, 12, 1, 23), time(2017, 12, 2, 3))).toEqual(['2017-12-01T23--02T02', 4, 'hour']);
        expect(ISOperiod(time(2017, 12, 1, 0), time(2018, 1, 1, 1))).toEqual(["2017-12-01T00--2018-01-01T00", 745, "hour"]);
        expect(ISOperiod(time(2017, 12, 31, 23), time(2019))).toEqual(["2017-12-31T23--2018-12-31T23", 8761, "hour"]);
    });
    test('should compute correct minute', () => {
        expect(ISOperiod(time(2017, 12, 1, 3, 2), time(2017, 12, 2, 3, 2))).toEqual(['2017-12-01T03:02--02T03:01', 1440, 'minute']);
    });

    describe('periodISO with forced resolution', () => {
        test('forced centuries', () => {
            expect(ISOperiod(time(2001), time(3001), 'century')).toEqual(['C21--30', 10, 'century']);
            expect(ISOperiod(time(1001), time(2001), 'century')).toEqual(['C11--20', 10, 'century']);
            expect(ISOperiod(time(2001), time(4001), 'century')).toEqual(['C21--40', 20, 'century']);
            expect(ISOperiod(time(1001), time(4001), 'century')).toEqual(['C11--40', 30, 'century']);
        });
    });
});
