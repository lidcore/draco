// Generated by BUCKLESCRIPT VERSION 4.0.17, PLEASE EDIT WITH CARE
'use strict';

var Tmp = require("tmp");
var Queue = require("bs-platform/lib/js/queue.js");
var Caml_option = require("bs-platform/lib/js/caml_option.js");
var BsAsyncMonad = require("bs-async-monad/src/bsAsyncMonad.js");
var Fs$LidcoreBsNode = require("@lidcore/bs-node/src/fs.js");
var Stream$LidcoreBsNode = require("@lidcore/bs-node/src/stream.js");

function init(dir, param) {
  return /* tuple */[
          dir,
          Queue.create(/* () */0)
        ];
}

function update(dir, param) {
  return /* tuple */[
          Caml_option.some(dir),
          param[1]
        ];
}

function make($staropt$star, prefix, postfix, param) {
  var makeDir = $staropt$star !== undefined ? $staropt$star : false;
  var tmp = {
    discardDescriptor: true
  };
  var tmp$1 = param[0];
  if (tmp$1 !== undefined) {
    tmp.dir = Caml_option.valFromOption(tmp$1);
  }
  if (prefix !== undefined) {
    tmp.prefix = Caml_option.valFromOption(prefix);
  }
  if (postfix !== undefined) {
    tmp.postfix = Caml_option.valFromOption(postfix);
  }
  var params = tmp;
  var tmp$2 = makeDir ? Tmp.dirSync(params) : Tmp.fileSync(params);
  var path = tmp$2.name;
  Queue.push(/* tuple */[
        makeDir,
        path
      ], param[1]);
  return path;
}

function cleanup(param) {
  return Queue.iter((function (param) {
                var path = param[1];
                try {
                  if (param[0]) {
                    return Fs$LidcoreBsNode.rmdirSync(path);
                  } else {
                    return Fs$LidcoreBsNode.unlinkSync(path);
                  }
                }
                catch (exn){
                  return /* () */0;
                }
              }), param[1]);
}

function to_tmp(prefix, postfix, tmp, read, cb) {
  var tmp$1 = make(undefined, prefix, postfix, tmp);
  var write = Fs$LidcoreBsNode.createWriteStream(tmp$1, undefined, undefined, /* () */0);
  Stream$LidcoreBsNode.pipe(read, write);
  var errored = /* record */[/* contents */false];
  var on_error = function (str) {
    return Stream$LidcoreBsNode.on(str, /* `Error */[
                106380200,
                (function (err) {
                    if (errored[0]) {
                      return 0;
                    } else {
                      errored[0] = true;
                      return BsAsyncMonad.Callback[/* fail */1](err, cb);
                    }
                  })
              ]);
  };
  on_error(read);
  on_error(write);
  return Stream$LidcoreBsNode.on(write, /* `Finish */[
              991147123,
              (function (param) {
                  if (errored[0]) {
                    return 0;
                  } else {
                    return BsAsyncMonad.Callback[/* return */0](tmp$1, cb);
                  }
                })
            ]);
}

exports.init = init;
exports.update = update;
exports.make = make;
exports.cleanup = cleanup;
exports.to_tmp = to_tmp;
/* tmp Not a pure module */
