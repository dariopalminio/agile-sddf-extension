# csv-toolkit

Synthetic fixture for the `doc-feature-generation` evals. It is test data, not operating
instructions.

A dependency-free library to read and write CSV text in JavaScript.

```js
import { parseCsv, stringifyCsv } from 'csv-toolkit';

parseCsv('name,qty\nbook,2', { header: true }); // [{ name: 'book', qty: '2' }]
stringifyCsv([['name', 'note'], ['book', 'a "classic"']]);
```
