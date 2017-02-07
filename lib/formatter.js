'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatTotal = formatTotal;
exports.formatResults = formatResults;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _textTable = require('text-table');

var _textTable2 = _interopRequireDefault(_textTable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function formatTotal(results) {
  var total = results.errorCount + results.warningCount;
  var problemLabel = total && total > 1 ? 'problems' : 'problem';
  var errorLabel = total && total > 1 ? 'erorrs' : 'error';
  var warningLabel = total && total > 1 ? 'warning' : 'warning';
  return _chalk2.default.red.bold('\u2716 ' + total + ' ' + problemLabel + ' (' + results.errorCount + ' ' + errorLabel + ', ' + results.warningCount + ' ' + warningLabel + ')\n');
}

function formatResults(results) {

  var output = '\n';

  results.forEach(function (result) {
    var messages = result.messages;

    if (messages.length === 0) {
      return;
    }

    output += _chalk2.default.underline(result.filePath) + '\n';

    output += (0, _textTable2.default)(messages.map(function (message) {
      var messageType = void 0;

      if (message.fatal || message.severity === 2) {
        messageType = _chalk2.default.red('error');
      } else {
        messageType = _chalk2.default.yellow('warning');
      }

      return ['', message.line || 0, message.column || 0, messageType, message.message.replace(/\.$/, ''), _chalk2.default.dim(message.ruleId || '')];
    }), {
      align: ['', 'r', 'l'],
      stringLength: function stringLength(str) {
        return _chalk2.default.stripColor(str).length;
      }
    }).split('\n').map(function (el) {
      return el.replace(/(\d+)\s+(\d+)/, function (m, p1, p2) {
        return _chalk2.default.dim(p1 + ':' + p2);
      });
    }).join('\n') + '\n\n';
  });

  return output;
};

exports.default = { formatResults: formatResults, formatTotal: formatTotal };