// Generated by BUCKLESCRIPT VERSION 4.0.5, PLEASE EDIT WITH CARE
'use strict';

var Caml_sys = require("bs-platform/lib/js/caml_sys.js");
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

var error_handler = /* record */[/* contents */(function () {
      return /* () */0;
    })];

var maxMessageRetries = /* record */[/* contents */10];

exports.offline = offline;
exports.error_handler = error_handler;
exports.maxMessageRetries = maxMessageRetries;
/* offline Not a pure module */
