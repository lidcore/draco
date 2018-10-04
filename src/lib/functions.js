// Generated by BUCKLESCRIPT VERSION 4.0.5, PLEASE EDIT WITH CARE
'use strict';

var Curry = require("bs-platform/lib/js/curry.js");
var Js_exn = require("bs-platform/lib/js/js_exn.js");
var Hashtbl = require("bs-platform/lib/js/hashtbl.js");
var Caml_obj = require("bs-platform/lib/js/caml_obj.js");
var Printexc = require("bs-platform/lib/js/printexc.js");
var Caml_array = require("bs-platform/lib/js/caml_array.js");
var BsAsyncMonad = require("bs-async-monad/src/bsAsyncMonad.js");
var Js_primitive = require("bs-platform/lib/js/js_primitive.js");
var Caml_exceptions = require("bs-platform/lib/js/caml_exceptions.js");
var Env$LidcoreDraco = require("./env.js");
var Common$LidcoreDraco = require("./common.js");
var Config$LidcoreDraco = require("../config.js");
var Logger$LidcoreDraco = require("./logger.js");
var JsError$LidcoreDraco = require("../bindings/jsError.js");
var Firebase$LidcoreDraco = require("../bindings/firebase.js");
var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions.js");
var Express$LidcoreBsExpress = require("@lidcore/bs-express/src/express.js");

var running = Firebase$LidcoreDraco.Functions[/* running */0];

function wrap(error, cb) {
  return (function (err, ret) {
      if (err == null) {
        return cb(err, ret);
      } else if (err[0] === Js_exn.$$Error) {
        Curry._1(Config$LidcoreDraco.error_handler[0], err[1]);
        return Curry._1(error, cb);
      } else {
        var e;
        try {
          e = JsError$LidcoreDraco.make(Printexc.to_string(err));
        }
        catch (exn){
          e = err;
        }
        Curry._1(Config$LidcoreDraco.error_handler[0], e);
        return Curry._1(error, cb);
      }
    });
}

var partial_arg = true;

function init(param) {
  return Express$LidcoreBsExpress.init(partial_arg, param);
}

function param(req, lbl) {
  return Js_primitive.undefined_to_opt(Express$LidcoreBsExpress.params(req)[lbl]);
}

var params = Express$LidcoreBsExpress.params;

var body = Express$LidcoreBsExpress.body;

function query(req) {
  var partial_arg = Express$LidcoreBsExpress.query(req);
  return (function (param) {
      return Js_primitive.undefined_to_opt(partial_arg[param]);
    });
}

var $$Error = Caml_exceptions.create("Functions-LidcoreDraco.Http.Error");

function make_error(statusCode, body) {
  return [
          $$Error,
          {
            statusCode: statusCode,
            headers: null,
            body: body
          }
        ];
}

function error(code, msg) {
  var partial_arg = make_error(code, msg);
  var partial_arg$1 = BsAsyncMonad.Callback[/* fail */1];
  return (function (param) {
      return partial_arg$1(partial_arg, param);
    });
}

function response($staropt$star, headers, msg) {
  var code = $staropt$star !== undefined ? $staropt$star : 200;
  var headers$1;
  if (headers !== undefined) {
    var headers$2 = { };
    Hashtbl.iter((function (param, param$1) {
            headers$2[param] = param$1;
            return /* () */0;
          }), Js_primitive.valFromOption(headers));
    headers$1 = headers$2;
  } else {
    headers$1 = null;
  }
  var match = JSON.stringify(msg);
  if (match !== undefined) {
    var partial_arg = {
      statusCode: code,
      headers: headers$1,
      body: match
    };
    var partial_arg$1 = BsAsyncMonad.Callback[/* return */0];
    return (function (param) {
        return partial_arg$1(partial_arg, param);
      });
  } else {
    var partial_arg_001 = {
      statusCode: 500,
      headers: null,
      body: "Invalid message!"
    };
    var partial_arg$2 = [
      $$Error,
      partial_arg_001
    ];
    var partial_arg$3 = BsAsyncMonad.Callback[/* fail */1];
    return (function (param) {
        return partial_arg$3(partial_arg$2, param);
      });
  }
}

function authenticate(req) {
  var token = Config$LidcoreDraco.offline ? "blabla" : Env$LidcoreDraco.get(undefined, "AUTHENTICATION_TOKEN");
  var error$1 = error(401, "Unauthorized");
  var match = Express$LidcoreBsExpress.headers(req)["authorization"];
  if (match !== undefined) {
    var re = (/Token token=(.+)/);
    var match$1 = re.exec(match);
    if (match$1 !== null && Caml_obj.caml_equal(Caml_array.caml_array_get(match$1, 1), token)) {
      var partial_arg = BsAsyncMonad.Callback[/* return */0];
      return (function (param) {
          return partial_arg(/* () */0, param);
        });
    } else {
      return error$1;
    }
  } else {
    return error$1;
  }
}

var send_response = (function (code, headers, body, resp) {
    var key;
    headers = headers || {};
    for (key in headers)
      resp.append(key, headers[key]);
    resp.status(code).send(body);
  });

function add_route(meth, $staropt$star, app, route, handler) {
  var auth = $staropt$star !== undefined ? $staropt$star : false;
  var match = meth !== 4004527 ? (
      meth >= 892711040 ? /* tuple */[
          "POST",
          Express$LidcoreBsExpress.post
        ] : /* tuple */[
          "GET",
          Express$LidcoreBsExpress.get
        ]
    ) : /* tuple */[
      "PUT",
      Express$LidcoreBsExpress.put
    ];
  var meth$1 = match[0];
  var handler$1 = function (req) {
    var tmp;
    if (auth) {
      tmp = authenticate(req);
    } else {
      var partial_arg = BsAsyncMonad.Callback[/* return */0];
      tmp = (function (param) {
          return partial_arg(/* () */0, param);
        });
    }
    return BsAsyncMonad.Callback[/* >> */3](tmp, (function () {
                  return Curry._1(handler, req);
                }));
  };
  return Curry._3(match[1], app, route, (function (req, resp) {
                var url = Express$LidcoreBsExpress.originalUrl(req);
                Logger$LidcoreDraco.info("Serving " + (String(meth$1) + (" " + (String(url) + ""))));
                var partial_arg = handler$1(req);
                return (function (param) {
                            var handler = partial_arg;
                            var cb = param;
                            var partial_arg$1 = {
                              statusCode: 500,
                              headers: null,
                              body: "Internal server error"
                            };
                            var partial_arg$2 = BsAsyncMonad.Callback[/* return */0];
                            var error = function (param) {
                              return partial_arg$2(partial_arg$1, param);
                            };
                            var cb$1 = wrap(error, cb);
                            return Curry._1(handler, (function (err, ret) {
                                          if (!(err == null) && err[0] === $$Error) {
                                            return cb$1(null, err[1]);
                                          } else {
                                            return cb$1(err, ret);
                                          }
                                        }));
                          })((function (err, ret) {
                              if (err == null) {
                                return Curry._4(send_response, ret.statusCode, ret.headers, ret.body, resp);
                              } else {
                                throw [
                                      Caml_builtin_exceptions.assert_failure,
                                      /* tuple */[
                                        "functions.ml",
                                        137,
                                        22
                                      ]
                                    ];
                              }
                            }));
              }));
}

function get(param, param$1, param$2, param$3) {
  return add_route(/* Get */3553398, param, param$1, param$2, param$3);
}

function post(param, param$1, param$2, param$3) {
  return add_route(/* Post */892711040, param, param$1, param$2, param$3);
}

function put(param, param$1, param$2, param$3) {
  return add_route(/* Put */4004527, param, param$1, param$2, param$3);
}

function $$export(app) {
  return Curry._1(Firebase$LidcoreDraco.Functions[/* Https */1][/* from_express */0], app);
}

function subscribe(topic, fn) {
  return Curry._2(Firebase$LidcoreDraco.Functions[/* PubSub */2][/* on_publish */0], topic, (function (message, _) {
                var json = Curry._1(Firebase$LidcoreDraco.Functions[/* PubSub */2][/* json */1], message);
                return BsAsyncMonad.to_promise(BsAsyncMonad.Callback[/* ||> */5](Curry._1(fn, json), (function (exn) {
                                  return BsAsyncMonad.Callback[/* >> */3](Common$LidcoreDraco.requeue(json, topic), (function () {
                                                var partial_arg = BsAsyncMonad.Callback[/* fail */1];
                                                return (function (param) {
                                                    return partial_arg(exn, param);
                                                  });
                                              }));
                                })));
              }));
}

var Event = /* module */[/* subscribe */subscribe];

var Http = [
  body,
  param,
  params,
  query,
  response,
  error,
  init,
  get,
  post,
  put,
  $$export
];

exports.running = running;
exports.Http = Http;
exports.Event = Event;
/* send_response Not a pure module */
