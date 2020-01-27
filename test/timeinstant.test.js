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

        expect(TimeInstant.fromComponents(0).year).toEqual(0);
        expect(TimeInstant.fromComponents(0).value).toEqual(time(0));

        expect(TimeInstant.fromComponents(1).year).toEqual(1);
        expect(TimeInstant.fromComponents(1).value).toEqual(time(1));

        expect(TimeInstant.fromComponents(-1).year).toEqual(-1);
        expect(TimeInstant.fromComponents(-1).value).toEqual(time(-1));
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

     test('fromTextLessThan100', () => {
        const c = [1,3,4,5,6,7];
        const v = time(...c);
        const txt = '0001-03-04T05:06:07';
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
        expect(
            TimeInstant.fromText('2018-04-12T13:34:42').roundDown('minute').text
        ).toEqual(TimeInstant.fromText('2018-04-12T13:34:42').round('minute').text);
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
       expect(
        TimeInstant.fromText('2018-04-12T13:34:42').roundUp('minute').text
       ).toEqual(TimeInstant.fromText('2018-04-12T13:34:42').round('minute', 'ceil').text);
   });
   test('from Date', () => {
        expect(
            TimeInstant.fromUTCDate(new Date(time(2019, 3, 4, 5, 6))).text
        ).toEqual('2019-03-04T05:06:00');
        expect(
            TimeInstant.fromLocalDate(new Date(2019, 2, 4, 5, 6)).text
        ).toEqual('2019-03-04T05:06:00');
    });
    test('now UTC', () => {
        const tbefore = Math.floor(Date.now()/1000)*1000;
        const t = TimeInstant.nowUTC().value;
        const tafter = Math.floor(Date.now()/1000)*1000;
        expect(t).toBeGreaterThanOrEqual(tbefore);
        expect(t).toBeLessThanOrEqual(tafter);Node
    });
    test('now Local', () => {
        const d1 = new Date();
        const t = TimeInstant.nowLocal().value;
        const d2 = new Date();
        const tbefore = time(d1.getFullYear(), d1.getMonth() + 1, d1.getDate(), d1.getHours(), d1.getMinutes(), d1.getSeconds());
        const tafter = time(d2.getFullYear(), d2.getMonth() + 1, d2.getDate(), d2.getHours(), d2.getMinutes(), d2.getSeconds() + 1);
        expect(t).toBeGreaterThanOrEqual(tbefore);
        expect(t).toBeLessThanOrEqual(tafter);
    });
 });
