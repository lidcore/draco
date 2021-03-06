// Generated by BUCKLESCRIPT VERSION 4.0.17, PLEASE EDIT WITH CARE
'use strict';

var $$Array = require("bs-platform/lib/js/array.js");
var Caml_array = require("bs-platform/lib/js/caml_array.js");
var BsAsyncMonad = require("bs-async-monad/src/bsAsyncMonad.js");
var Fs$LidcoreBsNode = require("@lidcore/bs-node/src/fs.js");
var Tmp$LidcoreDraco = require("../../bindings/tmp.js");
var Shell$LidcoreDraco = require("../../bindings/shell.js");
var Utils$LidcoreDraco = require("../../lib/utils.js");
var Logger$LidcoreDraco = require("../../lib/logger.js");
var Deepmerge$LidcoreDraco = require("../../bindings/deepmerge.js");
var DracoCommon$LidcoreDraco = require("./dracoCommon.js");

DracoCommon$LidcoreDraco.usage(undefined, "functions deploy");

function deploy(param) {
  var tmp = Tmp$LidcoreDraco.init(undefined, /* () */0);
  var config = DracoCommon$LidcoreDraco.config(/* () */0);
  var project = config.projectId;
  var tmpDir = Tmp$LidcoreDraco.make(true, undefined, undefined, tmp);
  Logger$LidcoreDraco.info("Copying required files, this can take a minute..");
  Shell$LidcoreDraco.cp("-rf", "" + (String(DracoCommon$LidcoreDraco.baseDir) + "/node_modules"), "" + (String(tmpDir) + "/node_modules"));
  $$Array.iter((function (file) {
          if (typeof(file) === "string") {
            return Shell$LidcoreDraco.cp("-rf", file, tmpDir);
          } else {
            var src = file.source;
            var dst = file.destination;
            return Shell$LidcoreDraco.cp("-rf", src, "" + (String(tmpDir) + ("/" + (String(dst) + ""))));
          }
        }), config.functions.files);
  var bsPlatformJson = config.functions["bs-platform.json"];
  var bsVersion = Utils$LidcoreDraco.Json[/* parse_buf */1](Fs$LidcoreBsNode.readFileSync("" + (String(DracoCommon$LidcoreDraco.baseDir) + "/node_modules/bs-platform/package.json"))).version;
  bsPlatformJson["version"] = bsVersion;
  Shell$LidcoreDraco.mkdir("-p", "" + (String(tmpDir) + "/bs-platform/lib/js"));
  Fs$LidcoreBsNode.writeFileSync("" + (String(tmpDir) + "/bs-platform/package.json"), Utils$LidcoreDraco.Json[/* stringify */2](bsPlatformJson));
  Shell$LidcoreDraco.cp("-rf", "" + (String(DracoCommon$LidcoreDraco.baseDir) + "/node_modules/bs-platform/lib/js/*.js"), "" + (String(tmpDir) + "/bs-platform/lib/js"));
  var packageJson = Deepmerge$LidcoreDraco.merge(Utils$LidcoreDraco.Json[/* parse_buf */1](Fs$LidcoreBsNode.readFileSync("" + (String(DracoCommon$LidcoreDraco.baseDir) + "/package.json"))), config.functions["package.json"]);
  packageJson.dependencies["bs-platform"] = "./bs-platform";
  Fs$LidcoreBsNode.writeFileSync("" + (String(tmpDir) + "/package.json"), Utils$LidcoreDraco.Json[/* stringify */2](packageJson));
  Shell$LidcoreDraco.cp(undefined, "" + (String(DracoCommon$LidcoreDraco.baseDir) + "/package-lock.json"), "" + (String(tmpDir) + "/package-lock.json"));
  Logger$LidcoreDraco.info("Running npm install");
  Shell$LidcoreDraco.exec("cd " + (String(tmpDir) + " && npm install"));
  Shell$LidcoreDraco.exec("echo \'DRACO_FIREBASE=\"true\"\' >> " + (String(tmpDir) + "/.env"));
  var firebase = "" + (String(DracoCommon$LidcoreDraco.baseDir) + "/node_modules/.bin/firebase");
  Logger$LidcoreDraco.info("Deploying..");
  var group = config.functions.group;
  var cmd = "cd " + (String(tmpDir) + (" && " + (String(firebase) + (" deploy --only functions:" + (String(group) + (" --project " + (String(project) + "")))))));
  var partial_arg = BsAsyncMonad.Callback[/* |&> */11];
  return BsAsyncMonad.Callback[/* finish */31](undefined, (function (param) {
                return partial_arg((function (param) {
                              return Utils$LidcoreDraco.replace_process(cmd, param);
                            }), (function (param) {
                              return Tmp$LidcoreDraco.cleanup(tmp);
                            }), param);
              }));
}

if (DracoCommon$LidcoreDraco.argc < 3) {
  DracoCommon$LidcoreDraco.die(undefined, /* () */0);
}

if (Caml_array.caml_array_get(DracoCommon$LidcoreDraco.argv, 2) !== "deploy") {
  DracoCommon$LidcoreDraco.die(undefined, /* () */0);
}

deploy(/* () */0);

/*  Not a pure module */
