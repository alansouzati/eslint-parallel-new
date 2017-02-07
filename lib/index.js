'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Linter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * NPM dependencies
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     **/


var _eslint = require('eslint');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Linter = exports.Linter = function () {
  function Linter(options) {
    _classCallCheck(this, Linter);

    this._options = options;
    this._engine = new _eslint.CLIEngine(options);
  }

  _createClass(Linter, [{
    key: 'execute',
    value: function execute(files) {
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
  }]);

  return Linter;
}();

process.on('message', function (options, files) {
  process.send(new Linter(options).execute(files));
});

exports.default = { Linter: Linter };