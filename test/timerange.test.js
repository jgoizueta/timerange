const TimeRange = require('../timerange');
const TimeInstant = require('../timeinstant');

function time (y, m = 1, d = 1, h = 0, min = 0, sec = 0) {
    return Date.UTC(y, m - 1, d, h, min, sec);
}

describe('TimeRange', () => {
    test('should compute start and end values from text description', () => {
        let t = TimeRange.fromText('2018');
        expect(t.text).toEqual('2018');
        expect(t.startValue).toEqual(time(2018));
        expect(t.endValue).toEqual(time(2019));
        expect(t.start).toEqual(TimeInstant.fromComponents([2018]));
        expect(t.end).toEqual(TimeInstant.fromComponents([2019]));

        t = TimeRange.fromText('2018..2019');
        expect(t.text).toEqual('2018..2019');
        expect(t.startValue).toEqual(time(2018));
        expect(t.endValue).toEqual(time(2020));
        expect(t.start).toEqual(TimeInstant.fromComponents([2018]));
        expect(t.end).toEqual(TimeInstant.fromComponents([2020]));
    });
    test('should keep time zone description', () => {
        const t = TimeRange.fromText('2018', { timeZone: 'XXX' });
        expect(t.startValue).toEqual(time(2018));
        expect(t.endValue).toEqual(time(2019));
        expect(t.start).toEqual(TimeInstant.fromTZ('XXX', 2018));
        expect(t.end).toEqual(TimeInstant.fromTZ('XXX', 2019));
        expect(t.timeZone).toEqual('XXX');
    });
    test('should compute iso format from text description', () => {
        let t = TimeRange.fromText('2018');
        expect(t.iso).toEqual('2018/2019');

        t = TimeRange.fromText('2018..2019');
        expect(t.iso).toEqual('2018/2020');
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
    test('has duration', () => {
        let t = TimeRange.fromISO('2018-05-12T07');
        expect(t.duration).toEqual(1);
        t = TimeRange.fromISO('2018-05-12T07..09');
        expect(t.duration).toEqual(3);
    });
    test('can define resolution', () => {
        const start = time(2018), end = time(2020);
        let t = TimeRange.fromStartEndValues(start, end, { resolution: 'year' });
        expect(t.text).toEqual('2018..2019');
        expect(t.duration).toEqual(2);
        expect(t.resolution).toEqual('year');
        t = TimeRange.fromStartEndValues(start, end, { resolution: 'month' });
        expect(t.text).toEqual('2018-01..2019-12');
        expect(t.duration).toEqual(24);
        expect(t.resolution).toEqual('month');
        t = TimeRange.fromStartEndValues(start, end, { resolution: 'day' });
        expect(t.text).toEqual('2018-01-01..2019-12-31');
        expect(t.duration).toEqual(2*365);
        expect(t.resolution).toEqual('day');
    });
});
