const TimeRange = require('../lib/timerange');
const TimeInstant = require('../lib/timeinstant');

function time (y, m = 1, d = 1, h = 0, min = 0, sec = 0) {
    if (y >= 0 && y < 100) {
        const sgn = y < 0 ? '-' : '';
        return Date.parse(
            sgn + String(Math.abs(y)).padStart(4,0) +
            '-' + String(m).padStart(2,0) +
            '-' + String(d).padStart(2,0) +
            'T' + String(h).padStart(2,0) +
            ':' + String(min).padStart(2,0) +
            ':' + String(sec).padStart(2,0) +
            'Z'
        );
    }
    return Date.UTC(y, m - 1, d, h, min, sec);
}

function getToTexts(gen) {
    return Array.from(gen).map(t => t.text);
}

describe('TimeRange', () => {
    test('should compute start and end values from text description', () => {
        let t = TimeRange.fromText('2018');
        expect(t.text).toEqual('2018');
        expect(t.startValue).toEqual(time(2018));
        expect(t.endValue).toEqual(time(2019));
        expect(t.start).toEqual(TimeInstant.fromComponents(2018));
        expect(t.end).toEqual(TimeInstant.fromComponents(2019));

        t = TimeRange.fromText('2018..2019');
        expect(t.text).toEqual('2018..2019');
        expect(t.startValue).toEqual(time(2018));
        expect(t.endValue).toEqual(time(2020));
        expect(t.start).toEqual(TimeInstant.fromComponents(2018));
        expect(t.end).toEqual(TimeInstant.fromComponents(2020));
    });
    test('should compute iso format from text description', () => {
        let t = TimeRange.fromText('2018');
        expect(t.iso).toEqual('2018/2019');

        t = TimeRange.fromText('2018..2019');
        expect(t.iso).toEqual('2018/2020');
    });
    test('should be definable from open text description', () => {
        const past = TimeInstant.fromComponents(0);
        const future = TimeInstant.fromComponents(3000);
        let t;

        t = TimeRange.fromTextOpen('2000..2010', past, future);
        expect(t.startValue).toEqual(time(2000));
        expect(t.endValue).toEqual(time(2011));

        t = TimeRange.fromTextOpen('2000..', past, future);
        expect(t.startValue).toEqual(time(2000));
        expect(t.endValue).toEqual(future.value);

        t = TimeRange.fromTextOpen('..2000', past, future);
        expect(t.startValue).toEqual(past.value);
        expect(t.endValue).toEqual(time(2001));

        t = TimeRange.fromTextOpen('..', past, future);
        expect(t.startValue).toEqual(past.value);
        expect(t.endValue).toEqual(future.value);

        // by default initial time is year 0:
        t = TimeRange.fromTextOpen('..2000');
        expect(t.startValue).toEqual(past.value);
        expect(t.endValue).toEqual(time(2001));
    });

    test('can change resolution', () => {
        let t = TimeRange.fromText('2018..2019').in('month');
        expect(t.text).toEqual('2018-01..2019-12');
    });
    test('define from ISO', () => {
        let t = TimeRange.fromISO('2018-05/2019-01');
        expect(t.text).toEqual('2018-05..12');
    });
    test('has duration in seconds', () => {
        let t = TimeRange.fromISO('2018-05-12T07');
        expect(t.durationSeconds).toEqual(3600);
    });
    test('has duration in arbitrary units', () => {
        let t = TimeRange.fromISO('2018-05-12T07');
        expect(t.durationIn('second')).toEqual(3600);
        expect(t.durationIn('day')).toEqual(1/24);
        t = TimeRange.fromISO('2018-05-12..14');
        expect(t.durationIn('day')).toEqual(3);
        t = TimeRange.fromISO('2018-05');
        expect(Math.round(t.durationIn('day'))).toEqual(30);
        expect(Math.round(t.durationIn('week'))).toEqual(4);
    });
    test('has duration', () => {
        let t = TimeRange.fromISO('2018-05-12T07');
        expect(t.duration).toEqual(1);
        t = TimeRange.fromISO('2018-05-12T07..09');
        expect(t.duration).toEqual(3);
    });
    test('can define resolution', () => {
        const start = time(2018), end = time(2020);
        let t = TimeRange.fromStartEndValues(start, end, 'year');
        expect(t.text).toEqual('2018..2019');
        expect(t.duration).toEqual(2);
        expect(t.resolution).toEqual('year');
        t = TimeRange.fromStartEndValues(start, end, 'month');
        expect(t.text).toEqual('2018-01..2019-12');
        expect(t.duration).toEqual(24);
        expect(t.resolution).toEqual('month');
        t = TimeRange.fromStartEndValues(start, end, 'day');
        expect(t.text).toEqual('2018-01-01..2019-12-31');
        expect(t.duration).toEqual(2*365);
        expect(t.resolution).toEqual('day');
    });
    test('can iterate between time values', () => {
        let values = getToTexts(TimeRange.betweenValues(time(2019, 5, 1), time(2019, 8, 1), 'month'));
        expect(values).toEqual([ '2019-05', '2019-06', '2019-07' ]);

        values = getToTexts(TimeRange.betweenValues(time(2019, 4), time(2020, 8, 1), 'quarter'));
        expect(values).toEqual([ '2019-Q2', '2019-Q3', '2019-Q4', '2020-Q1', '2020-Q2' ]);

        values = getToTexts(TimeRange.betweenValues(time(2001), time(2300, 8, 1), 'century'));
        expect(values).toEqual([ 'C21', 'C22' ]);

        values = getToTexts(TimeRange.betweenValues(time(2019, 5, 13), time(2019, 6, 1), 'week'));
        expect(values).toEqual([ '2019-W20', '2019-W21' ]);
    });
    test('can iterate between time instants', () => {
        let values = getToTexts(TimeRange.between(TimeInstant.fromComponents(2019, 5, 1), TimeInstant.fromComponents(2019, 8, 1), 'month'));
        expect(values).toEqual([ '2019-05', '2019-06', '2019-07' ]);

        values = getToTexts(TimeRange.between(TimeInstant.fromComponents(2019, 4), TimeInstant.fromComponents(2020, 8, 1), 'quarter'));
        expect(values).toEqual([ '2019-Q2', '2019-Q3', '2019-Q4', '2020-Q1', '2020-Q2' ]);

        values = getToTexts(TimeRange.between(TimeInstant.fromComponents(2001), TimeInstant.fromComponents(2300, 8, 1), 'century'));
        expect(values).toEqual([ 'C21', 'C22' ]);

        values = getToTexts(TimeRange.between(TimeInstant.fromComponents(2019, 5, 13), TimeInstant.fromComponents(2019, 6, 1), 'week'));
        expect(values).toEqual([ '2019-W20', '2019-W21' ]);
    });
    test('intersections', () => {
        let t1 = TimeRange.fromText('2019Q1..2019Q3')
        let t2 = TimeRange.fromText('2019S2')
        expect(t1.intersects(t2)).toEqual(true);
        expect(t1.intersection(t2).text).toEqual('2019-Q3')
        let t3 = TimeRange.fromText('2019Q4')
        expect(t1.intersects(t3)).toEqual(false);
        expect(t1.intersection(t3).isEmpty).toEqual(true);
        expect(t1.intersection(t3).text).toEqual('');
    });
    test('can define with different resolutions', () => {
        let t = TimeRange.fromStartEndValues(time(2017,4,3), time(2019,5,3,13,32));
        expect(t.text).toEqual('2017-04-03T00:00..2019-05-03T13:31');
    });
    test('unions', () => {
        let t1 = TimeRange.fromText('2019Q1..2019Q2')
        let t2 = TimeRange.fromText('2019Q4')
        expect(t1.union(t2).text).toEqual('2019-Q1..4');
    });
    test('equality', () => {
        let t1 = TimeRange.fromText('2019Q1..2020Q4');
        let t2 = TimeRange.fromText('2019..2020');
        expect(t1.equivalent(t1)).toEqual(true);
        expect(t1.identical(t1)).toEqual(true);
        expect(t1.equivalent(t2)).toEqual(true);
        expect(t1.identical(t2)).toEqual(false);
    });
    test('inequality', () => {
        let t1 = TimeRange.fromText('2019Q1..2021Q1');
        let t2 = TimeRange.fromText('2019..2020');
        expect(t1.equivalent(t2)).toEqual(false);
        expect(t1.identical(t2)).toEqual(false);
    });
    test('next', () => {
       expect(TimeRange.fromText('2017-12').next().text).toEqual('2018-01');
       expect(TimeRange.fromText('2017-10..11').next().text).toEqual('2017-12..2018-01');
       expect(TimeRange.fromText('2017W51').next().text).toEqual('2017-W52');
       expect(TimeRange.fromText('2017W52').next().text).toEqual('2018-W01');
    });
    test('prev', () => {
        expect(TimeRange.fromText('2018-01').prev().text).toEqual('2017-12');
        expect(TimeRange.fromText('2017-12..2018-01').prev().text).toEqual('2017-10..11');
        expect(TimeRange.fromText('2017W52').prev().text).toEqual('2017-W51');
        expect(TimeRange.fromText('2018W01').prev().text).toEqual('2017-W52');
     });
 });
