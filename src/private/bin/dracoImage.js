// Generated by BUCKLESCRIPT VERSION 4.0.17, PLEASE EDIT WITH CARE
'use strict';

var List = require("bs-platform/lib/js/list.js");
var $$Array = require("bs-platform/lib/js/array.js");
var $$String = require("bs-platform/lib/js/string.js");
var Js_dict = require("bs-platform/lib/js/js_dict.js");
var Caml_obj = require("bs-platform/lib/js/caml_obj.js");
var Caml_array = require("bs-platform/lib/js/caml_array.js");
var Caml_option = require("bs-platform/lib/js/caml_option.js");
var BsAsyncMonad = require("bs-async-monad/src/bsAsyncMonad.js");
var Fs$LidcoreBsNode = require("@lidcore/bs-node/src/fs.js");
var Tmp$LidcoreDraco = require("../../bindings/tmp.js");
var Cuid$LidcoreDraco = require("../../bindings/cuid.js");
var Caml_js_exceptions = require("bs-platform/lib/js/caml_js_exceptions.js");
var Utils$LidcoreDraco = require("../../lib/utils.js");
var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions.js");
var DracoCommon$LidcoreDraco = require("./dracoCommon.js");

DracoCommon$LidcoreDraco.usage(undefined, "image build [base|app|world]");

function getConfig(config, mode, name) {
  var match = config.image;
  if (match == null) {
    throw Caml_builtin_exceptions.not_found;
  } else {
    var match$1 = Js_dict.get(match, mode);
    if (match$1 !== undefined) {
      var match$2 = Js_dict.get(Caml_option.valFromOption(match$1), name);
      if (match$2 !== undefined) {
        return Caml_option.valFromOption(match$2);
      } else {
        throw Caml_builtin_exceptions.not_found;
      }
    } else {
      throw Caml_builtin_exceptions.not_found;
    }
  }
}

function provisioners(config, mode) {
  var get = function (mode) {
    var ret = getConfig(config, mode, "provisioners");
    $$Array.sort((function (x, y) {
            return -Caml_obj.caml_compare(x.priority, y.priority) | 0;
          }), ret);
    $$Array.iter((function (param) {
            return Utils$LidcoreDraco.$$delete("priority", param);
          }), ret);
    return ret;
  };
  if (mode === "world") {
    return get("base").concat(get("app"));
  } else {
    return get(mode);
  }
}

function buildConfig(config, mode) {
  var provisioners$1 = provisioners(config, mode);
  var mode$1 = mode === "world" ? "base" : mode;
  var id = Cuid$LidcoreDraco.get(/* () */0);
  var instance_name = "draco-build-" + (String(id) + "");
  var image_name;
  switch (mode$1) {
    case "app" : 
    case "world" : 
        image_name = config.image.app.name;
        break;
    default:
      image_name = config.image.base.name;
  }
  var builder = getConfig(config, mode$1, "builder");
  var condSet = function (lbl, value) {
    var match = Js_dict.get(builder, lbl);
    if (match !== undefined) {
      return /* () */0;
    } else {
      builder[lbl] = value;
      return /* () */0;
    }
  };
  condSet("project_id", config.projectId);
  condSet("zone", config.zone);
  condSet("instance_name", instance_name);
  condSet("image_name", image_name);
  if (mode$1 === "app") {
    condSet("source_image", config.image.base.name);
  }
  return {
          provisioners: provisioners$1,
          builders: /* array */[builder]
        };
}

function getConfig$1(tmp, config, mode) {
  var packerConfig = buildConfig(config, mode);
  var path = Tmp$LidcoreDraco.make(undefined, undefined, ".json", tmp);
  Fs$LidcoreBsNode.writeFileSync(path, Utils$LidcoreDraco.Json[/* stringify */2](packerConfig));
  return path;
}

function packer(args, config, mode) {
  var tmp = Tmp$LidcoreDraco.init(undefined, /* () */0);
  var config$1 = Utils$LidcoreDraco.$$escape(getConfig$1(tmp, config, mode));
  var args$1 = List.map((function (param) {
          var opt = Utils$LidcoreDraco.$$escape("" + (String(param[0]) + ("=" + (String(param[1]) + ""))));
          return "-var " + (String(opt) + "");
        }), args);
  var args$2 = $$String.concat(" ", args$1);
  var cmd = "packer build -force " + (String(args$2) + (" " + (String(config$1) + "")));
  var partial_arg = BsAsyncMonad.Callback[/* >> */3](DracoCommon$LidcoreDraco.rebuild, (function (param) {
          return (function (param) {
              return Utils$LidcoreDraco.replace_process(cmd, param);
            });
        }));
  var partial_arg$1 = BsAsyncMonad.Callback[/* |&> */11];
  return BsAsyncMonad.Callback[/* finish */31](undefined, (function (param) {
                return partial_arg$1(partial_arg, (function (param) {
                              return Tmp$LidcoreDraco.cleanup(tmp);
                            }), param);
              }));
}

if (DracoCommon$LidcoreDraco.argc < 3) {
  DracoCommon$LidcoreDraco.die(undefined, /* () */0);
}

if (Caml_array.caml_array_get(DracoCommon$LidcoreDraco.argv, 2) !== "build") {
  DracoCommon$LidcoreDraco.die(undefined, /* () */0);
}

var mode;

try {
  var mode$1 = Caml_array.caml_array_get(DracoCommon$LidcoreDraco.argv, 3);
  if (!List.mem(mode$1, /* :: */[
          "base",
          /* :: */[
            "app",
            /* :: */[
              "world",
              /* [] */0
            ]
          ]
        ])) {
    DracoCommon$LidcoreDraco.die("Invalid mode: " + (String(mode$1) + ""), /* () */0);
  }
  mode = mode$1;
}
catch (raw_exn){
  var exn = Caml_js_exceptions.internalToOCamlException(raw_exn);
  if (exn[0] === Caml_builtin_exceptions.invalid_argument) {
    if (exn[1] === "index out of bounds") {
      mode = "world";
    } else {
      throw exn;
    }
  } else {
    throw exn;
  }
}

var config = DracoCommon$LidcoreDraco.config(/* () */0);

var args_000 = /* tuple */[
  "project",
  config.projectId
];

var args_001 = /* :: */[
  /* tuple */[
    "zone",
    config.zone
  ],
  /* [] */0
];

var args = /* :: */[
  args_000,
  args_001
];

packer(args, config, mode);

/*  Not a pure module */
