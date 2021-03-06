// Generated by BUCKLESCRIPT VERSION 4.0.17, PLEASE EDIT WITH CARE
'use strict';

var List = require("bs-platform/lib/js/list.js");
var Http = require("http");
var $$Array = require("bs-platform/lib/js/array.js");
var Https = require("https");
var SimpleGet = require("simple-get");
var Caml_option = require("bs-platform/lib/js/caml_option.js");
var BsAsyncMonad = require("bs-async-monad/src/bsAsyncMonad.js");
var Stream$LidcoreBsNode = require("@lidcore/bs-node/src/stream.js");

var http_agent = new Http.Agent({
      keepAlive: true
    });

var https_agent = new Https.Agent({
      keepAlive: true
    });

function make_headers(l) {
  var headers = { };
  var add_header = (function(obj,lbl,value) {
      obj[lbl] = value;
    });
  var add_header$1 = function (param) {
    return add_header(headers, param[0], param[1]);
  };
  List.iter(add_header$1, l);
  return headers;
}

function make_opts(body, headers, url) {
  var match = $$Array.to_list(url.split(":"));
  var agent;
  if (match) {
    switch (match[0]) {
      case "http" : 
          agent = Caml_option.some(http_agent);
          break;
      case "https" : 
          agent = Caml_option.some(https_agent);
          break;
      default:
        agent = undefined;
    }
  } else {
    agent = undefined;
  }
  var tmp = {
    url: url
  };
  if (body !== undefined) {
    tmp.body = Caml_option.valFromOption(body);
  }
  if (headers !== undefined) {
    tmp.headers = Caml_option.valFromOption(headers);
  }
  if (agent !== undefined) {
    tmp.agent = Caml_option.valFromOption(agent);
  }
  return tmp;
}

function is_failed(code) {
  if (code < 200) {
    return true;
  } else {
    return code > 299;
  }
}

function make_resp($staropt$star, stream) {
  var failOnClientError = $staropt$star !== undefined ? $staropt$star : true;
  var resp = {
    statusCode: stream.statusCode,
    data: stream
  };
  if (failOnClientError && is_failed(resp.statusCode)) {
    var resp$1 = resp;
    var code = resp$1.statusCode;
    var partial_arg = resp$1.data;
    return BsAsyncMonad.Callback[/* >> */3]((function (param) {
                  return Stream$LidcoreBsNode.read(partial_arg, param);
                }), (function (data) {
                  var partial_arg = new Error("Error while processing request: " + (String(code) + (" - " + (String(data) + ""))));
                  var partial_arg$1 = BsAsyncMonad.Callback[/* fail */1];
                  return (function (param) {
                      return partial_arg$1(partial_arg, param);
                    });
                }));
  } else {
    var partial_arg$1 = BsAsyncMonad.Callback[/* return */0];
    return (function (param) {
        return partial_arg$1(resp, param);
      });
  }
}

function stream(failOnClientError, headers, url) {
  return BsAsyncMonad.Callback[/* >> */3]((function (param) {
                var headers$1 = headers;
                var url$1 = url;
                var cb = param;
                var headers$2 = headers$1 !== undefined ? Caml_option.some(make_headers(headers$1)) : undefined;
                SimpleGet.get(make_opts(undefined, headers$2, url$1), cb);
                return /* () */0;
              }), (function (param) {
                return make_resp(failOnClientError, param);
              }));
}

function data(failOnClientError, headers, url) {
  return BsAsyncMonad.Callback[/* >> */3](stream(failOnClientError, headers, url), (function (resp) {
                var partial_arg = resp.data;
                return BsAsyncMonad.Callback[/* >> */3]((function (param) {
                              return Stream$LidcoreBsNode.read(partial_arg, param);
                            }), (function (data) {
                              var partial_arg = {
                                statusCode: resp.statusCode,
                                data: data
                              };
                              var partial_arg$1 = BsAsyncMonad.Callback[/* return */0];
                              return (function (param) {
                                  return partial_arg$1(partial_arg, param);
                                });
                            }));
              }));
}

function post($staropt$star, body, url) {
  var headers = $staropt$star !== undefined ? $staropt$star : /* [] */0;
  var json_opts = function (body) {
    var match = JSON.stringify(body);
    if (match !== undefined) {
      var headers$1 = make_headers(/* :: */[
            /* tuple */[
              "Content-Type",
              "application/json"
            ],
            headers
          ]);
      var partial_arg = make_opts(match, Caml_option.some(headers$1), url);
      var partial_arg$1 = BsAsyncMonad.Callback[/* return */0];
      return (function (param) {
          return partial_arg$1(partial_arg, param);
        });
    } else {
      var partial_arg$2 = new Error("Invalid body!");
      var partial_arg$3 = BsAsyncMonad.Callback[/* fail */1];
      return (function (param) {
          return partial_arg$3(partial_arg$2, param);
        });
    }
  };
  var tmp;
  if (body !== undefined) {
    tmp = json_opts(Caml_option.valFromOption(body));
  } else {
    var partial_arg = make_opts(undefined, undefined, url);
    var partial_arg$1 = BsAsyncMonad.Callback[/* return */0];
    tmp = (function (param) {
        return partial_arg$1(partial_arg, param);
      });
  }
  return BsAsyncMonad.Callback[/* >> */3](tmp, (function (opts) {
                var partial_arg = SimpleGet;
                return (function (param) {
                    partial_arg.post(opts, param);
                    return /* () */0;
                  });
              }));
}

function post$1(failOnClientError, headers, body, url) {
  return BsAsyncMonad.Callback[/* >> */3](post(headers, body, url), (function (param) {
                return make_resp(failOnClientError, param);
              }));
}

exports.stream = stream;
exports.data = data;
exports.post = post$1;
/* http_agent Not a pure module */
