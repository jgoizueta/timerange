const periodISO = require('../periodISO');

function time (y, m = 1, d = 1, h = 0, min = 0, sec = 0) {
    return Date.UTC(y, m - 1, d, h, min, sec);
}

function ISOperiod (start, end) {
    return periodISO(start, end).iso;
}

describe('periodISO calendar units', () => {
    test('should compute correct year', () => {
        expect(ISOperiod(time(2017), time(2018))).toEqual('2017');
    });
    test('should compute correct month', () => {
        expect(ISOperiod(time(2017, 12), time(2018, 1))).toEqual('2017-12');
        expect(ISOperiod(time(2017, 1), time(2017, 2))).toEqual('2017-01');
    });
    test('should compute correct day', () => {
        expect(ISOperiod(time(2017, 12, 1), time(2017, 12, 2))).toEqual('2017-12-01');
        expect(ISOperiod(time(2017, 12, 31), time(2018))).toEqual('2017-12-31');
        expect(ISOperiod(time(2017, 11, 30), time(2017, 12))).toEqual('2017-11-30');
    });
    test('should compute correct week', () => {
        expect(ISOperiod(time(2017, 1, 30), time(2017, 2, 6))).toEqual('2017-W05');
        expect(ISOperiod(time(2013, 4, 8), time(2013, 4, 15))).toEqual('2013-W15');
        expect(ISOperiod(time(2009, 12, 28), time(2010, 1, 4))).toEqual('2009-W53');
        expect(ISOperiod(time(2010, 1, 4), time(2010, 1, 11))).toEqual('2010-W01');
        expect(ISOperiod(time(2011, 12, 26), time(2012, 1, 2))).toEqual('2011-W52');
        expect(ISOperiod(time(2012, 1, 2), time(2012, 1, 9))).toEqual('2012-W01');
        expect(ISOperiod(time(2013, 12, 30), time(2014, 1, 6))).toEqual('2014-W01');
        expect(ISOperiod(time(2014, 1, 6), time(2014, 1, 13))).toEqual('2014-W02');
    });
    test('should compute correct quarter', () => {
        expect(ISOperiod(time(2017, 1), time(2017, 4))).toEqual('2017-Q1');
        expect(ISOperiod(time(2017, 4), time(2017, 7))).toEqual('2017-Q2');
        expect(ISOperiod(time(2017, 7), time(2017, 10))).toEqual('2017-Q3');
        expect(ISOperiod(time(2017, 10), time(2018))).toEqual('2017-Q4');
    });
    test('should compute correct hour', () => {
        expect(ISOperiod(time(2017, 12, 1, 3), time(2017, 12, 1, 4))).toEqual('2017-12-01T03');
        expect(ISOperiod(time(2017, 12, 1, 23), time(2017, 12, 2, 0))).toEqual('2017-12-01T23');
        expect(ISOperiod(time(2017, 12, 1, 0), time(2017, 12, 1, 1))).toEqual('2017-12-01T00');
        expect(ISOperiod(time(2017, 12, 31, 23), time(2018))).toEqual('2017-12-31T23');
    });
    test('should compute correct minute', () => {
        expect(ISOperiod(time(2017, 12, 1, 3, 2), time(2017, 12, 1, 3, 3))).toEqual('2017-12-01T03:02');
    });
    test('should compute correct century', () => {
        expect(ISOperiod(time(2001), time(2101))).toEqual('C21');
        expect(ISOperiod(time(1901), time(2001))).toEqual('C20');
        expect(ISOperiod(time(1801), time(1901))).toEqual('C19');
    });
    test('should compute correct millennium', () => {
        expect(ISOperiod(time(2001), time(3001))).toEqual('M3');
        expect(ISOperiod(time(1001), time(2001))).toEqual('M2');
    });
    test('should compute correct decade', () => {
        expect(ISOperiod(time(2000), time(2010))).toEqual('D200');
        expect(ISOperiod(time(2010), time(2020))).toEqual('D201');
    });
});
