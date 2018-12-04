// Generated by BUCKLESCRIPT VERSION 4.0.6, PLEASE EDIT WITH CARE
'use strict';

var Curry = require("bs-platform/lib/js/curry.js");
var Caml_sys = require("bs-platform/lib/js/caml_sys.js");
var Logger$LidcoreDraco = require("./lib/logger.js");
var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions.js");

var offline;

try {
  offline = Caml_sys.caml_sys_getenv("OFFLINE_DEPLOY") === "true";
}
catch (exn){
  if (exn === Caml_builtin_exceptions.not_found) {
    offline = false;
  } else {
    throw exn;
  }
}

var error_handler = /* record */[/* contents */(function (exn) {
      return Logger$LidcoreDraco.error("Error: " + (String(exn) + ""));
    })];

function set_error_handler(fn) {
  error_handler[0] = (function (exn) {
      Logger$LidcoreDraco.error("Error: " + (String(exn) + ""));
      return Curry._1(fn, exn);
    });
  return /* () */0;
}

function error_handler$1(exn) {
  return Curry._1(error_handler[0], exn);
}

var maxMessageRetries = /* record */[/* contents */10];

exports.offline = offline;
exports.set_error_handler = set_error_handler;
exports.error_handler = error_handler$1;
exports.maxMessageRetries = maxMessageRetries;
/* offline Not a pure module */
