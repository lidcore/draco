// Generated by BUCKLESCRIPT VERSION 4.0.17, PLEASE EDIT WITH CARE
'use strict';

var Curry = require("bs-platform/lib/js/curry.js");
var Js_dict = require("bs-platform/lib/js/js_dict.js");
var Caml_option = require("bs-platform/lib/js/caml_option.js");
var Env$LidcoreDraco = require("./env.js");
var Winston$LidcoreDraco = require("../private/winston.js");
var Process$LidcoreBsNode = require("@lidcore/bs-node/src/process.js");

var handlers = { };

function on_info(fn) {
  handlers["info"] = fn;
  return /* () */0;
}

function on_error(fn) {
  handlers["error"] = fn;
  return /* () */0;
}

function info(s) {
  console.log(s);
  Winston$LidcoreDraco.info(s);
  var match = Js_dict.get(handlers, "info");
  if (match !== undefined) {
    return Curry._1(Caml_option.valFromOption(match), s);
  } else {
    return /* () */0;
  }
}

function error_log (m){console.error(m);};

function error(s) {
  error_log(s);
  Winston$LidcoreDraco.error(s);
  var match = Js_dict.get(handlers, "error");
  if (match !== undefined) {
    return Curry._1(Caml_option.valFromOption(match), s);
  } else {
    return /* () */0;
  }
}

if (Env$LidcoreDraco.stage === "production") {
  Process$LidcoreBsNode.on(/* `UncaughtException */[
        791088858,
        (function (exn) {
            error(exn);
            throw exn;
          })
      ]);
}

exports.on_info = on_info;
exports.info = info;
exports.on_error = on_error;
exports.error = error;
/*  Not a pure module */
