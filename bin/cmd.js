#!/usr/bin/env node

var inliner = require('../');
var fs = require('fs');
var path = require('path');
var minimist = require('minimist');
var request = require('request');

var argv = minimist(process.argv.slice(2), {
    alias: { i: 'infile', o: 'outfile', b: 'basedir', h: 'help',
             ignoreImages: 'ignore-images',
             ignoreScripts: 'ignore-scripts',
             ignoreStyles: 'ignore-styles' },
    default: { outfile: '-' }
});

if (argv.help) return usage(0);

var infile = argv.infile || argv._[0];

if (isURL(infile) && !argv.basedir) {
    argv.basedir = infile;
}

if (!argv.basedir && infile) {
    argv.basedir = path.resolve(path.dirname(infile));
}

var inline = inliner(argv);
var input = infile === '-' || !infile
    ? process.stdin
    : getStream(infile) 
;
var output = argv.outfile === '-'
    ? process.stdout
    : fs.createWriteStream(argv.outfile)
;
input.pipe(inline).pipe(output);

function usage (code) {
    var r = fs.createReadStream(__dirname +'/usage.txt');
    r.pipe(process.stdout);
    r.on('end', function () {
        if (code) process.exit(code);
    });
}

function isURL(p) {
    return p.indexOf('http') === 0;
}

function getStream(file) {
    if (isURL(file)) {
        return request(infile);
    } else {
        return fs.createReadStream(infile);
    }
}