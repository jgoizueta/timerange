const periodISO = require('../periodISO');

function time (y, m = 1, d = 1, h = 0, min = 0, sec = 0) {
    return Date.UTC(y, m - 1, d, h, min, sec);
}

function ISOperiod (start, end) {
    const { iso, duration, resolution } = periodISO(start, end);
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
});
