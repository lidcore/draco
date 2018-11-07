// Generated by BUCKLESCRIPT VERSION 4.0.6, PLEASE EDIT WITH CARE
'use strict';

var Arg = require("bs-platform/lib/js/arg.js");
var $$Array = require("bs-platform/lib/js/array.js");
var Block = require("bs-platform/lib/js/block.js");
var $$String = require("bs-platform/lib/js/string.js");
var Caml_array = require("bs-platform/lib/js/caml_array.js");
var Fs$LidcoreBsNode = require("@lidcore/bs-node/src/fs.js");
var Shell$LidcoreDraco = require("../../bindings/shell.js");
var Logger$LidcoreDraco = require("../../lib/logger.js");
var DracoCommon$LidcoreDraco = require("./dracoCommon.js");

DracoCommon$LidcoreDraco.usage(false, "import [-prefix ModulePrefix] Module");

var prefix = /* record */[/* contents */"LidcoreDraco"];

var m = /* record */[/* contents */""];

var opts_000 = /* tuple */[
  "-prefix",
  /* Set_string */Block.__(5, [prefix]),
  "Set prefix"
];

var opts = /* :: */[
  opts_000,
  /* [] */0
];

if (DracoCommon$LidcoreDraco.argc < 3) {
  DracoCommon$LidcoreDraco.die(undefined, /* () */0);
}

if (Caml_array.caml_array_get(DracoCommon$LidcoreDraco.argv, 1) !== "import") {
  DracoCommon$LidcoreDraco.die(undefined, /* () */0);
}

var args = $$Array.sub(DracoCommon$LidcoreDraco.argv, 2, DracoCommon$LidcoreDraco.argc - 2 | 0);

args.unshift("draco");

try {
  Arg.parse_argv(/* record */[/* contents */0], args, opts, (function (s) {
          m[0] = s;
          return /* () */0;
        }), DracoCommon$LidcoreDraco.usageMsg[0]);
}
catch (exn){
  DracoCommon$LidcoreDraco.die(undefined, /* () */0);
}

if (m[0] === "") {
  DracoCommon$LidcoreDraco.die("No module specified!", /* () */0);
}

var dir = "src/imports";

var mfile = $$String.uncapitalize(m[0]);

var m$1 = m[0];

var prefix$1 = prefix[0];

var m$2 = prefix$1 !== "" ? "" + (String(prefix$1) + ("." + (String(m$1) + ""))) : m$1;

var ml = "include " + (String(m$2) + "\n");

var mli = "include module type of " + (String(m$2) + "\n");

Shell$LidcoreDraco.mkdir("-p", dir);

Logger$LidcoreDraco.info("Writting " + (String(dir) + ("/" + (String(mfile) + ".ml.."))));

Fs$LidcoreBsNode.writeFileSync("" + (String(dir) + ("/" + (String(mfile) + ".ml"))), ml);

Logger$LidcoreDraco.info("Writting " + (String(dir) + ("/" + (String(mfile) + ".mli.."))));

Fs$LidcoreBsNode.writeFileSync("" + (String(dir) + ("/" + (String(mfile) + ".mli"))), mli);

/*  Not a pure module */