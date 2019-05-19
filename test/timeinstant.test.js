const TimeInstant = require('../timeinstant');

function time (y, m = 1, d = 1, h = 0, min = 0, sec = 0) {
    return Date.UTC(y, m - 1, d, h, min, sec);
}

describe('TimeInstant', () => {
    test('fromValue', () => {
        const c = [2018,3,4,5,6,7];
        const v = time(...c);
        const t = TimeInstant.fromValue(v);
        expect(t.components).toEqual(c);
        expect(t.value).toEqual(v)
        expect(t.text).toEqual('2018-03-04T05:06:07');
        expect(t.year).toEqual(c[0]);
        expect(t.month).toEqual(c[1]);
        expect(t.day).toEqual(c[2]);
        expect(t.hour).toEqual(c[3]);
        expect(t.minute).toEqual(c[4]);
        expect(t.second).toEqual(c[5]);
     });

     test('fromComponents', () => {
        const c = [2018,3,4,5,6,7];
        const v = time(...c);
        const t = TimeInstant.fromComponents(...c);
        expect(t.components).toEqual(c);
        expect(t.value).toEqual(v)
        expect(t.text).toEqual('2018-03-04T05:06:07');
        expect(t.year).toEqual(c[0]);
        expect(t.month).toEqual(c[1]);
        expect(t.day).toEqual(c[2]);
        expect(t.hour).toEqual(c[3]);
        expect(t.minute).toEqual(c[4]);
        expect(t.second).toEqual(c[5]);
     });

     test('fromText', () => {
        const c = [2018,3,4,5,6,7];
        const v = time(...c);
        const txt = '2018-03-04T05:06:07';
        const t = TimeInstant.fromText(txt);
        expect(t.components).toEqual(c);
        expect(t.value).toEqual(v)
        expect(t.text).toEqual(txt);
        expect(t.year).toEqual(c[0]);
        expect(t.month).toEqual(c[1]);
        expect(t.day).toEqual(c[2]);
        expect(t.hour).toEqual(c[3]);
        expect(t.minute).toEqual(c[4]);
        expect(t.second).toEqual(c[5]);
     });
 });
