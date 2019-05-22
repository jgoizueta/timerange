const TimeInstant = require('../lib/timeinstant');

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

     test('round down', () => {
         expect(
             TimeInstant.fromText('2018-04-12T13:34:42').round('second').text
         ).toEqual('2018-04-12T13:34:42');
         expect(
            TimeInstant.fromText('2018-04-12T13:34:42').round('minute').text
        ).toEqual('2018-04-12T13:34:00');
        expect(
            TimeInstant.fromText('2018-04-12T13:34:42').round('hour').text
        ).toEqual('2018-04-12T13:00:00');
        expect(
            TimeInstant.fromText('2018-04-12T13:34:42').round('day').text
        ).toEqual('2018-04-12T00:00:00');
        expect(
            TimeInstant.fromText('2018-04-12T13:34:42').round('month').text
        ).toEqual('2018-04-01T00:00:00');
        expect(
            TimeInstant.fromText('2018-04-12T13:34:42').round('year').text
        ).toEqual('2018-01-01T00:00:00');
        expect(
            TimeInstant.fromText('2018-04-12T13:34:42').round('week').text
        ).toEqual('2018-04-09T00:00:00');
        expect(
            TimeInstant.fromText('2018-04-12T13:34:42').round('quarter').text
        ).toEqual('2018-04-01T00:00:00');
        expect(
            TimeInstant.fromText('2018-04-12T13:34:42').round('trimester').text
        ).toEqual('2018-01-01T00:00:00');
        expect(
            TimeInstant.fromText('2018-04-12T13:34:42').round('semester').text
        ).toEqual('2018-01-01T00:00:00');
        expect(
            TimeInstant.fromText('2018-04-12T13:34:42').round('decade').text
        ).toEqual('2010-01-01T00:00:00');
        expect(
            TimeInstant.fromText('2018-04-12T13:34:42').round('century').text
        ).toEqual('2001-01-01T00:00:00');
        expect(
            TimeInstant.fromText('2018-04-12T13:34:42').round('millennium').text
        ).toEqual('2001-01-01T00:00:00');
    });
    test('round up', () => {
        expect(
            TimeInstant.fromText('2018-04-12T13:34:42').round('second', 'ceil').text
        ).toEqual('2018-04-12T13:34:42');
        expect(
           TimeInstant.fromText('2018-04-12T13:34:42').round('minute', 'ceil').text
       ).toEqual('2018-04-12T13:35:00');
       expect(
           TimeInstant.fromText('2018-04-12T13:34:42').round('hour', 'ceil').text
       ).toEqual('2018-04-12T14:00:00');
       expect(
           TimeInstant.fromText('2018-04-12T13:34:42').round('day', 'ceil').text
       ).toEqual('2018-04-13T00:00:00');
       expect(
           TimeInstant.fromText('2018-04-12T13:34:42').round('month', 'ceil').text
       ).toEqual('2018-05-01T00:00:00');
       expect(
           TimeInstant.fromText('2018-04-12T13:34:42').round('year', 'ceil').text
       ).toEqual('2019-01-01T00:00:00');
       expect(
           TimeInstant.fromText('2018-04-12T13:34:42').round('week', 'ceil').text
       ).toEqual('2018-04-16T00:00:00');
       expect(
           TimeInstant.fromText('2018-04-12T13:34:42').round('quarter', 'ceil').text
       ).toEqual('2018-07-01T00:00:00');
       expect(
           TimeInstant.fromText('2018-04-12T13:34:42').round('trimester', 'ceil').text
       ).toEqual('2018-05-01T00:00:00');
       expect(
           TimeInstant.fromText('2018-04-12T13:34:42').round('semester', 'ceil').text
       ).toEqual('2018-07-01T00:00:00');
       expect(
           TimeInstant.fromText('2018-04-12T13:34:42').round('decade', 'ceil').text
       ).toEqual('2020-01-01T00:00:00');
       expect(
           TimeInstant.fromText('2018-04-12T13:34:42').round('century', 'ceil').text
       ).toEqual('2101-01-01T00:00:00');
       expect(
           TimeInstant.fromText('2018-04-12T13:34:42').round('millennium', 'ceil').text
       ).toEqual('3001-01-01T00:00:00');
   });
 });
