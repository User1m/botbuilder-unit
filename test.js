require('colors')
var jsdiff = require('diff');

var one = `beep boop`;
var other = `beep boop  `;

var diff = jsdiff.diffWordsWithSpace(one, other);

diff.forEach(function (part) {
    // green for additions, red for deletions
    // grey for common parts
    var color = part.added ? 'green' :
        part.removed ? 'red' : 'grey';
    process.stderr.write(part.value[color]);
});

console.log();