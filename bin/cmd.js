#!/usr/bin/env node

var mkdirp = require('../');
var minimist = require('minimist');
var argv = minimist(process.argv.slice(2), {
    alias: { m: 'mode' },
    string: [ 'mode' ]
});
var paths = argv._.slice();
var mode = argv.mode ? parseInt(argv.mode, 8) : undefined;

(function next () {
    if (paths.length === 0) return;
    var p = paths.shift();
    
    if (mode === undefined) mkdirp(p, cb)
    else mkdirp(p, mode, cb)
    
    function cb (err) {
        if (err) {
            console.error(err.message);
            process.exit(1);
        }
        else next();
    }
})();
