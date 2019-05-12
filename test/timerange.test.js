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
});
