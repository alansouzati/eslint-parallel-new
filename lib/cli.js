#!/usr/bin/env node
'use strict';

var _options = require('eslint/lib/options');

var _options2 = _interopRequireDefault(_options);

var _linter = require('./linter');

var _linter2 = _interopRequireDefault(_linter);

var _formatter = require('./formatter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('babel-register');

/**
* NPM dependencies
**/


/**
* Local dependencies
**/


function translateOptions(cliOptions) {
  return {
    envs: cliOptions.env,
    extensions: cliOptions.ext,
    rules: cliOptions.rule,
    plugins: cliOptions.plugin,
    globals: cliOptions.global,
    ignore: cliOptions.ignore,
    ignorePath: cliOptions.ignorePath,
    ignorePattern: cliOptions.ignorePattern,
    configFile: cliOptions.config,
    rulePaths: cliOptions.rulesdir,
    useEslintrc: cliOptions.eslintrc,
    parser: cliOptions.parser,
    parserOptions: cliOptions.parserOptions,
    cache: cliOptions.cache,
    cacheFile: cliOptions.cacheFile,
    cacheLocation: cliOptions.cacheLocation,
    fix: cliOptions.fix,
    allowInlineConfig: cliOptions.inlineConfig
  };
}

var cliOptions = _options2.default.parse(process.argv);

if (cliOptions.version) {
  console.log('v' + require("../package.json").version);
} else if (cliOptions.help) {
  console.log(_options2.default.generateHelp());
} else {
  new _linter2.default(translateOptions(cliOptions)).execute(cliOptions._).then(function (result) {
    var failed = result.errorCount > 1 || result.warningCount > 1;

    if (failed) {
      console.log((0, _formatter.formatTotal)(result));
      process.exit(1);
    } else {
      process.exit(0);
    }
  }, function (err) {
    console.log(err);
    process.exit(1);
  });
}