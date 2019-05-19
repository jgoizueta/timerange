# TimeRange

A class to represent time ranges (interval of time between to instants).

```javascript
const { TimeRange } = require('@jgoizueta/timerange');

const t = TimeRange.fromText('2018-03');
console.log(t.next().text);
console.log(t.startValue, t.endValue);
```

Output:
```
2018-04
1519862400000 1522540800000
```

```javascript
for (let t = TimeRange.fromText('2018-Q2'); t.precedes(TimeRange.fromText('2019-Q2')); t = t.next()) {
    console.log(t.text);
}
```

Output:
```
2018-Q2
2018-Q3
2018-Q4
2019-Q1
```
