# Colleqtor

*Seize the directory.*

## What?

Colleqtor is a simple little Node utility that uses `fs` to list the contents of a directory-- with or without filenames, and import the UTF-8 contents of those files into an array-- associative by filename (with or without extension), or sequential.

## Where?

Get it on **NPM**:
```bash
npm install colleqtor --save
```

Or clone this repo:
```bash
git clone https://github.com/austinbillings/Colleqtor
```

## How?



### Example

Imagine we have a subdirectory called "documents" that contains 5 `.txt` files and 2 `.log` files. Here's an example:
```js
const colleqtor = require('colleqtor');

let docDir = __dirname + '/documents';

colleqtor.listFiles(docDir);
/* something like:
[
  "./test/fifth.txt",
  "./test/first.txt",
  "./test/fourth.txt",
  "./test/megaLog.log",
  "./test/second.txt",
  "./test/third.txt",
  "./test/ultraLog.log"
]
*/

colleqtor.listFiles(docDir, 'log');
//  [ "./test/megaLog.log", "./test/ultraLog.log" ]

colleqtor.listFiles(docDir, 'log', true);
//  [ "megaLog.log", "ultraLog.log" ]

colleqtor.gatherFileNames(docDir, 'log', true);
//  [ "megaLog", "ultraLog" ]



```
