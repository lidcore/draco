// Generated by BUCKLESCRIPT VERSION 4.0.6, PLEASE EDIT WITH CARE
'use strict';

var Dotenv = require("dotenv");
var Js_primitive = require("bs-platform/lib/js/js_primitive.js");

function config(path, encoding, _) {
  var tmp = { };
  if (path !== undefined) {
    tmp.path = Js_primitive.valFromOption(path);
  }
  if (encoding !== undefined) {
    tmp.encoding = Js_primitive.valFromOption(encoding);
  }
  var options = tmp;
  Dotenv.config(options);
  return /* () */0;
}

exports.config = config;
/* dotenv Not a pure module */
