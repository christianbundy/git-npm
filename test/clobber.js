var mkdirp = require('../').mkdirp;
var path = require('path');
var fs = require('fs');
var test = require('tap').test;

var ps = [ '', 'tmp' ];

for (var i = 0; i < 25; i++) {
    var dir = Math.floor(Math.random() * Math.pow(16,4)).toString(16);
    ps.push(dir);
}

var file = ps.join('/');

// a file in the way
var itw = ps.slice(0, 3).join('/');


test('clobber-pre', function (t) {
    console.error("about to write to "+itw)
    fs.writeFileSync(itw, 'I AM IN THE WAY, THE TRUTH, AND THE LIGHT.');

    fs.stat(itw, function (er, stat) {
        t.ifError(er)
        t.ok(stat && stat.isFile(), 'should be file')
        t.end()
    })
})

test('clobber', function (t) {
    mkdirp(file, 0755, function (err) {
        console.error("mkdir result", file, err)
        if (err) t.fail(err);
        else fs.stat(file, function (ex, stat) {
            if (ex) t.fail('file not created')
            else {
                t.equal(stat.mode & 0777, 0755);
                t.ok(stat.isDirectory(), 'target not a directory');
                fs.stat(itw, function (er, stat) {
                    if (er) t.fail('in the way file not there?!?')
                    else {
                        t.equal(stat.mode & 0777, 0755)
                        t.ok(stat.isDirectory(), 'should be directory');
                        t.end();
                    }
                });
            }
        });
    });
});
