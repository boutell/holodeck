/* jshint node:true */
var argv = require('yargs').argv;
var args = argv._;
var fs = require('fs');
var async = require('async');
var request = require('request');
var clf = require('clf-parser');
var http = require('http');

var parallel = argv['max-sockets'] || 200;
var timeout = argv['timeout'] || 60000;

http.globalAgent.maxSockets = parallel;

if (args.length !== 2) {
  console.error('Usage: holodeck http://example.com clf-log-file.log [--max-sockets=200] [--ignore-extensions=gif,jpg,png,js,css] [--timeout=60000] [--verbose] [--speed=1]');
  process.exit(1);
}

if (argv['ignore-static']) {
  argv['ignore-extensions'] = 'gif,jpg,png,js,xlx,pptx,docx,css,ico,pdf';
}

var input = fs.readFileSync(args[1], 'utf8');
var lines = input.split(/\n/);
var infos = [];

lines.forEach(function(line) {
  var info = parse(line);
  if (!info) {
    return;
  }
  infos.push(info);
});

infos.sort(function(a, b) {
  if (a.time_local < b.time_local) {
    return -1;
  }
  if (a.time_local > b.time_local) {
    return 1;
  }
  return 0;
});

var offset;
var statuses = {};
var totalTime = 0;
var ignore;
if (argv['ignore-extensions']) {
  ignore = new RegExp('\\.(' + argv['ignore-extensions'].replace(/,/g, '|') + ')$');
}

var valid = 0;

var speed = 1;
if (argv.speed) {
  speed = parseFloat(argv.speed);
}

return async.eachLimit(infos, parallel, function(info, callback) {
  if (info.method !== 'GET') {
    return setImmediate(callback);
  }
  if (ignore) {
    if (info.path.match(ignore)) {
      return setImmediate(callback);
    }
  }
  var now = Date.now();
  if (!offset) {
    offset = now - info.time_local.getTime();
  }
  var wait = ((info.time_local.getTime() + offset) - now) / speed;
  // if (wait < 0) {
  //   console.log('BEHIND: ' + (-wait) + 'ms');
  // }
  valid++;
  return setTimeout(function() {
    var now = Date.now();
    if (argv.verbose) {
      console.log('GETTING ' + info.path);
    }
    return request({
      url: args[0] + info.path,
      timeout: timeout
    }, function(err, response, body) {
      var after = Date.now();
      var elapsed = after - now;
      if (err) {
        if (err.code === 'ETIMEDOUT') {
          response = { statusCode: 'ETIMEDOUT' };
          body = '';
        } else {
          return callback(err);
        }
      }
      console.log(info.method + ' ' + info.path + ': ' + response.statusCode + ', ' + body.length + ' bytes (' + elapsed + 'ms)');
      totalTime += elapsed;
      if (!statuses[response.statusCode]) {
        statuses[response.statusCode] = 0;
      }
      statuses[response.statusCode]++;
      return callback(null);
    });
  }, (wait > 0) ? wait : 0);
}, function(err) {
  if (err) {
    throw err;
  }
  console.log('\n\nDone.');
  console.log('Requests made: ' + valid);
  console.log('Average response time: ' + twoPlaces(totalTime / valid) + 'ms');
  var keys = Object.keys(statuses);
  keys.sort();
  console.log('Final status codes:');
  keys.forEach(function(status) {
    console.log(status + ': ' + statuses[status] + ' (' + twoPlaces(statuses[status] / valid * 100) + '%' + ')');
  });
  process.exit(0);
});

function parse(line) {
  return clf(line);
}

function twoPlaces(n) {
  return Math.round(Math.floor(n * 100)) / 100;
}
