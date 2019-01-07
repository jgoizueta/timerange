const periodISO = require('../periodISO');

function time (y, m = 1, d = 1, h = 0, min = 0, sec = 0) {
    return Date.UTC(y, m - 1, d, h, min, sec);
}

function abbrPeriod (start, end, forced=null) {
    const { abbr, duration, resolution } = periodISO(start, end, forced, false);
    return [abbr, duration, resolution];
}

function isoPeriod (start, end, forced=null) {
    return periodISO(start, end, forced, false).iso;
}

describe('periodISO calendar units', () => {
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

describe('periodISO abbr multiple calendar units', () => {
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

describe('periodISO iso multiple calendar units', () => {
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

describe('periodISO with forced resolution', () => {
    test('forced centuries', () => {
        expect(abbrPeriod(time(2001), time(3001), 'century')).toEqual(['C21..30', 10, 'century']);
        expect(abbrPeriod(time(1001), time(2001), 'century')).toEqual(['C11..20', 10, 'century']);
        expect(abbrPeriod(time(2001), time(4001), 'century')).toEqual(['C21..40', 20, 'century']);
        expect(abbrPeriod(time(1001), time(4001), 'century')).toEqual(['C11..40', 30, 'century']);
    });
});
