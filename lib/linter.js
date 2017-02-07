'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Node dependencies
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     **/


/**
* NPM dependencies
**/


/**
* Local dependencies
**/


var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path2 = require('path');

var _path3 = _interopRequireDefault(_path2);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _child_process = require('child_process');

var _eslint = require('eslint');

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _formatter = require('./formatter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cpuCount = _os2.default.cpus().length;

function getIgnorePatterns(options) {
  var ignorePath = _path3.default.join(options.cwd || process.cwd(), '.eslintignore');
  try {
    var ignore = _fs2.default.readFileSync(ignorePath, 'utf8').trim().split('\n');

    if (options.ignorePattern) {
      ignore.push(options.ignorePattern);
    }
    return ignore;
  } catch (e) {
    return [];
  }
}

function hasEslintCache(options) {
  var cacheLocation = options.cacheFile || options.cacheLocation || _path3.default.join(options.cwd || process.cwd(), '.eslintcache');
  try {
    _fs2.default.accessSync(_path3.default.resolve(cacheLocation), _fs2.default.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

function getFilesByPatterns(patterns, options) {
  var ignore = getIgnorePatterns(options);
  var files = [];

  patterns.forEach(function (pattern) {
    var isFile = false;
    var isFolder = false;
    try {
      var stats = _fs2.default.lstatSync(pattern);
      isFile = stats.isFile();
      isFolder = stats.isDirectory();
    } catch (e) {
      //no-op
    }

    if (isFile) {
      files.push(pattern);
    } else {
      var _path = isFolder ? pattern.replace(/\'|\"|\/$/g, '') + '/**' : pattern.replace(/\'|\"|\/$/g, '');
      var newFiles = _glob2.default.sync(_path, { cwd: options.cwd || process.cwd(), nodir: true, ignore: ignore });
      files = files.concat(newFiles);
    }
  });

  return files;
}

function eslintFork(options, files) {
  return new Promise(function (resolve, reject) {
    var eslintChild = (0, _child_process.fork)(_path3.default.resolve(__dirname, 'linter'));
    eslintChild.on('message', function (report) {
      if (report.errorCount || report.warningCount) {
        console.log((0, _formatter.formatResults)(report.results));
      }
      resolve(report);
    });
    eslintChild.on('exit', function (code) {
      if (code !== 0) {
        reject('Linting failed');
      }
    });
    eslintChild.send({ options: options, files: files });
  });
}

var Linter = function () {
  function Linter(options) {
    _classCallCheck(this, Linter);

    this._options = options;
    this._engine = new _eslint.CLIEngine(options);
  }

  _createClass(Linter, [{
    key: 'run',
    value: function run(files) {
      var _this = this;

      return new Promise(function (resolve) {
        var report = _this._engine.executeOnFiles(files);
        if (_this._options.fix) {
          _this._engine.outputFixes(report);
        }

        if (_this._options.quiet) {
          report.results = _this._engine.getErrorResults(report.results);
        }
        resolve(report);
      });
    }
  }, {
    key: 'execute',
    value: function execute(patterns) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var files = getFilesByPatterns(patterns, _this2._options);

        var hasCache = hasEslintCache(_this2._options);

        if (!hasCache && files.length > 50 && cpuCount >= 2) {
          (function () {
            // too many items, need to spawn process (if machine has multi-core)
            var totalCount = {
              errorCount: 0,
              warningCount: 0
            };
            var chunckedPromises = [];
            var chunkSize = Math.ceil(files.length / cpuCount);
            for (var i = 0; i < files.length; i += chunkSize) {
              var chunkedPaths = files.slice(i, i + chunkSize);
              var chunckedPromise = eslintFork(_this2._options, chunkedPaths);
              chunckedPromise.then(function (report) {
                totalCount.errorCount += report.errorCount;
                totalCount.warningCount += report.warningCount;
              });
              chunckedPromises.push(chunckedPromise);
            }
            Promise.all(chunckedPromises).then(function () {
              resolve(totalCount);
            });
          })();
        } else {
          _this2.run(files).then(function (report) {
            if (report.errorCount || report.warningCount) {
              console.log((0, _formatter.formatResults)(report.results));
            }
            resolve(report);
          }, reject);
        }
      });
    }
  }]);

  return Linter;
}();

exports.default = Linter;


process.on('message', function (_ref) {
  var options = _ref.options,
      files = _ref.files;

  // make sure to ignore message to other nested processes
  if (files) {
    new Linter(options).run(files).then(function (report) {
      process.send(report);
    }, function (err) {
      console.log(err);
      process.exit(1);
    });
  }
});