// Generated by BUCKLESCRIPT VERSION 4.0.17, PLEASE EDIT WITH CARE
'use strict';

var List = require("bs-platform/lib/js/list.js");
var $$Array = require("bs-platform/lib/js/array.js");
var Curry = require("bs-platform/lib/js/curry.js");
var Queue = require("bs-platform/lib/js/queue.js");
var Hashtbl = require("bs-platform/lib/js/hashtbl.js");
var Caml_option = require("bs-platform/lib/js/caml_option.js");
var BsAsyncMonad = require("bs-async-monad/src/bsAsyncMonad.js");
var Env$LidcoreDraco = require("./env.js");
var Os$LidcoreBsNode = require("@lidcore/bs-node/src/os.js");
var Caml_js_exceptions = require("bs-platform/lib/js/caml_js_exceptions.js");
var Redis$LidcoreDraco = require("../bindings/redis.js");
var Utils$LidcoreDraco = require("./utils.js");
var Common$LidcoreDraco = require("../private/common.js");
var Config$LidcoreDraco = require("../config.js");
var Gcloud$LidcoreDraco = require("../bindings/gcloud.js");
var Logger$LidcoreDraco = require("./logger.js");
var Process$LidcoreBsNode = require("@lidcore/bs-node/src/process.js");
var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions.js");

var exceptionHandler = Config$LidcoreDraco.error_handler;

var instances = Hashtbl.create(undefined, 10);

var initializers = Queue.create(/* () */0);

function run(param) {
  var instance = Curry._2(Gcloud$LidcoreDraco.Compute[/* Zone */5][/* vm */7], Gcloud$LidcoreDraco.Compute[/* zone */6](Gcloud$LidcoreDraco.Compute[/* init */0](undefined, /* () */0), Gcloud$LidcoreDraco.zone), Os$LidcoreBsNode.hostname(/* () */0));
  return BsAsyncMonad.Callback[/* finish */29](exceptionHandler, BsAsyncMonad.Callback[/* >> */3](Curry._1(Gcloud$LidcoreDraco.Compute[/* Zone */5][/* VM */6][/* getMetadata */0], instance), (function (meta) {
                    var items = $$Array.to_list(meta.metadata.items);
                    var data = List.find((function (el) {
                            return el.key === "draco_instance_type";
                          }), items);
                    var label = data.value;
                    Logger$LidcoreDraco.info("Starting instance " + (String(label) + ""));
                    try {
                      var handler = Hashtbl.find(instances, label);
                      return Curry._1(handler, /* () */0);
                    }
                    catch (exn){
                      if (exn === Caml_builtin_exceptions.not_found) {
                        Logger$LidcoreDraco.error("Could not find handler for instance " + (String(label) + "!"));
                        var partial_arg = BsAsyncMonad.Callback[/* return */0];
                        return (function (param) {
                            return partial_arg(/* () */0, param);
                          });
                      } else {
                        throw exn;
                      }
                    }
                  })));
}

var stopping = /* record */[/* contents */false];

Process$LidcoreBsNode.on(/* `SIGTERM */[
      -995060003,
      (function (param) {
          stopping[0] = true;
          return /* () */0;
        })
    ]);

var msg_check_expire = 60 * 24 * 2;

function msg_check_key(id) {
  return "msg_check_" + (String(id) + "");
}

var redis_client = /* record */[/* contents */undefined];

var has_redis = Env$LidcoreDraco.get_some(undefined, "REDIS_URL") !== undefined;

function get_redis(param) {
  var match = redis_client[0];
  if (match !== undefined) {
    return Caml_option.valFromOption(match);
  } else {
    var client = Redis$LidcoreDraco.createClient(Env$LidcoreDraco.get("redis://localhost:6379", "REDIS_URL"));
    redis_client[0] = Caml_option.some(client);
    return client;
  }
}

function is_duplicate(id) {
  if (has_redis) {
    var redis = get_redis(/* () */0);
    var key = msg_check_key(id);
    return BsAsyncMonad.Callback[/* >> */3]((function (param) {
                  return Redis$LidcoreDraco.setnx(redis, key, "foo", param);
                }), (function (n) {
                  if (n === 0) {
                    var partial_arg = BsAsyncMonad.Callback[/* return */0];
                    return (function (param) {
                        return partial_arg(true, param);
                      });
                  } else {
                    return BsAsyncMonad.Callback[/* >| */7]((function (param) {
                                  return Redis$LidcoreDraco.expire(redis, key, msg_check_expire, param);
                                }), (function (param) {
                                  return false;
                                }));
                  }
                }));
  } else {
    var partial_arg = BsAsyncMonad.Callback[/* return */0];
    return (function (param) {
        return partial_arg(false, param);
      });
  }
}

function log(msg) {
  return Logger$LidcoreDraco.info("" + (String(msg) + ""));
}

function register(label, param) {
  if (param[0] >= -32289987) {
    var label$1 = label;
    var instance = param[1];
    var topic = instance.topic;
    var subscription = instance.subscription;
    var handler = instance.handler;
    var maxMessages = Os$LidcoreBsNode.cpus(/* () */0).length;
    var handler$1 = function (param) {
      var handler$2 = Curry._1(handler, /* () */0);
      var maxMessages$1 = maxMessages;
      var topic$1 = topic;
      var subscription$1 = subscription;
      var handler$3 = handler$2;
      var pubsub = Gcloud$LidcoreDraco.PubSub[/* init */0](undefined, /* () */0);
      var flowControl = {
        maxMessages: maxMessages$1
      };
      var config = {
        flowControl: flowControl
      };
      var requeue = function (msg) {
        var msg$1 = Utils$LidcoreDraco.Json[/* parse_buf */1](msg.data);
        return Common$LidcoreDraco.requeue(msg$1, topic$1);
      };
      var requeue$1 = function (msg) {
        return BsAsyncMonad.Callback[/* ||> */5](requeue(msg), (function (exn) {
                      Config$LidcoreDraco.error_handler(exn);
                      var partial_arg = BsAsyncMonad.Callback[/* return */0];
                      return (function (param) {
                          return partial_arg(/* () */0, param);
                        });
                    }));
      };
      return BsAsyncMonad.Callback[/* >> */3](Gcloud$LidcoreDraco.PubSub[/* topic */1](pubsub, topic$1), (function (topic) {
                    return BsAsyncMonad.Callback[/* >| */7](Gcloud$LidcoreDraco.PubSub[/* subscription */4](config, topic, subscription$1), (function (s) {
                                  return Gcloud$LidcoreDraco.PubSub[/* subscribe */7](s, (function (msg) {
                                                if (stopping[0]) {
                                                  return Gcloud$LidcoreDraco.PubSub[/* nack */6](msg);
                                                } else {
                                                  var handler$4 = function (param) {
                                                    try {
                                                      return BsAsyncMonad.Callback[/* >| */7](Curry._1(handler$3, msg.data), (function (param) {
                                                                    return Gcloud$LidcoreDraco.PubSub[/* ack */5](msg);
                                                                  }));
                                                    }
                                                    catch (raw_exn){
                                                      var partial_arg = Caml_js_exceptions.internalToOCamlException(raw_exn);
                                                      var partial_arg$1 = BsAsyncMonad.Callback[/* fail */1];
                                                      return (function (param) {
                                                          return partial_arg$1(partial_arg, param);
                                                        });
                                                    }
                                                  };
                                                  var id = msg.id;
                                                  var handler$5 = BsAsyncMonad.Callback[/* >> */3](is_duplicate(id), (function (ret) {
                                                          if (ret) {
                                                            log("Found duplicate message with id: " + (String(id) + ""));
                                                            Gcloud$LidcoreDraco.PubSub[/* ack */5](msg);
                                                            var partial_arg = BsAsyncMonad.Callback[/* return */0];
                                                            return (function (param) {
                                                                return partial_arg(/* () */0, param);
                                                              });
                                                          } else {
                                                            return BsAsyncMonad.Callback[/* ||> */5](handler$4(/* () */0), (function (exn) {
                                                                          Gcloud$LidcoreDraco.PubSub[/* ack */5](msg);
                                                                          return BsAsyncMonad.Callback[/* >> */3](requeue$1(msg), (function (param) {
                                                                                        var partial_arg = BsAsyncMonad.Callback[/* fail */1];
                                                                                        return (function (param) {
                                                                                            return partial_arg(exn, param);
                                                                                          });
                                                                                      }));
                                                                        }));
                                                          }
                                                        }));
                                                  return BsAsyncMonad.Callback[/* finish */29](exceptionHandler, handler$5);
                                                }
                                              }));
                                }));
                  }));
    };
    var pubsub = Gcloud$LidcoreDraco.PubSub[/* init */0](undefined, /* () */0);
    var flowControl = {
      maxMessages: maxMessages
    };
    var config = {
      flowControl: flowControl
    };
    Hashtbl.add(instances, label$1, handler$1);
    var partial_arg = BsAsyncMonad.Callback[/* return */0];
    var cb = BsAsyncMonad.Callback[/* >> */3]((function (param) {
            return partial_arg(/* () */0, param);
          }), (function (param) {
            Logger$LidcoreDraco.info("Setting up topic " + (String(topic) + ""));
            return BsAsyncMonad.Callback[/* >> */3](Gcloud$LidcoreDraco.PubSub[/* topic */1](pubsub, topic), (function (topic$1) {
                          Logger$LidcoreDraco.info("Setting up subcription " + (String(subscription) + (" on " + (String(topic) + ""))));
                          var partial_arg = Gcloud$LidcoreDraco.PubSub[/* subscription */4](config, topic$1, subscription);
                          var partial_arg$1 = BsAsyncMonad.Callback[/* discard */12];
                          return (function (param) {
                              return partial_arg$1(partial_arg, param);
                            });
                        }));
          }));
    return Queue.push(cb, initializers);
  } else {
    return Hashtbl.add(instances, label, param[1]);
  }
}

function setup(param) {
  var initializers$1 = Queue.fold((function (cur, el) {
          return /* :: */[
                  el,
                  cur
                ];
        }), /* [] */0, initializers);
  return BsAsyncMonad.Callback[/* seq */27](undefined, initializers$1);
}

function components(projectId, zone, name) {
  var compute = Gcloud$LidcoreDraco.Compute[/* init */0]({
        projectId: projectId
      }, /* () */0);
  Gcloud$LidcoreDraco.Compute[/* pushInterceptor */1](compute, {
        request: (function (reqOps) {
            reqOps.uri = reqOps.uri.replace("/v1/", "/beta/");
            return reqOps;
          })
      });
  var instanceTemplate = Gcloud$LidcoreDraco.Compute[/* instanceTemplate */3](compute, name);
  var zone$1 = Gcloud$LidcoreDraco.Compute[/* zone */6](compute, zone);
  var instanceGroupManager = Curry._2(Gcloud$LidcoreDraco.Compute[/* Zone */5][/* instanceGroupManager */4], zone$1, name);
  var autoscaler = Curry._2(Gcloud$LidcoreDraco.Compute[/* Zone */5][/* autoscaler */1], zone$1, name);
  return /* record */[
          /* compute */compute,
          /* zone */zone$1,
          /* instanceTemplate */instanceTemplate,
          /* instanceGroupManager */instanceGroupManager,
          /* autoscaler */autoscaler
        ];
}

function initialize(projectId, serviceAccount, zone, instanceTemplate, autoscaler, name) {
  instanceTemplate.properties.metadata = {
    items: /* array */[{
        key: "draco_instance_type",
        value: name
      }]
  };
  instanceTemplate.properties.serviceAccounts = /* array */[{
      email: serviceAccount,
      scopes: /* array */["https://www.googleapis.com/auth/cloud-platform"]
    }];
  autoscaler.target = name;
  autoscaler.name = name;
  autoscaler.zone = zone;
  var match = components(projectId, zone, name);
  var autoscaler$1 = match[/* autoscaler */4];
  var instanceGroupManager = match[/* instanceGroupManager */3];
  var instanceTemplate$1 = match[/* instanceTemplate */2];
  var zone$1 = match[/* zone */1];
  var compute = match[/* compute */0];
  var createInstanceTemplate = function (param) {
    var partial_arg = Curry._1(Gcloud$LidcoreDraco.Compute[/* InstanceTemplate */2][/* exists */0], instanceTemplate$1);
    var partial_arg$1 = BsAsyncMonad.Callback[/* async_unless */16];
    return (function (param) {
        return partial_arg$1(partial_arg, (function (param) {
                      var partial_arg = Gcloud$LidcoreDraco.Compute[/* createInstanceTemplate */4];
                      return BsAsyncMonad.Callback[/* >> */3]((function (param) {
                                    return partial_arg(compute, name, instanceTemplate, param);
                                  }), Gcloud$LidcoreDraco.Compute[/* InstanceTemplate */2][/* get */1]);
                    }), param);
      });
  };
  var createGroup = function (param) {
    var partial_arg = Curry._1(Gcloud$LidcoreDraco.Compute[/* Zone */5][/* InstanceGroupManager */3][/* exists */0], instanceGroupManager);
    var partial_arg$1 = BsAsyncMonad.Callback[/* async_unless */16];
    return (function (param) {
        return partial_arg$1(partial_arg, (function (param) {
                      return BsAsyncMonad.Callback[/* >> */3](Curry._4(Gcloud$LidcoreDraco.Compute[/* Zone */5][/* createInstanceGroupManager */5], 0, instanceTemplate$1, zone$1, name), Gcloud$LidcoreDraco.Compute[/* Zone */5][/* InstanceGroupManager */3][/* get */1]);
                    }), param);
      });
  };
  var createAutoscaler = function (param) {
    var partial_arg = Curry._1(Gcloud$LidcoreDraco.Compute[/* Zone */5][/* Autoscaler */0][/* exists */0], autoscaler$1);
    var partial_arg$1 = BsAsyncMonad.Callback[/* async_unless */16];
    return (function (param) {
        return partial_arg$1(partial_arg, (function (param) {
                      var partial_arg = Curry._3(Gcloud$LidcoreDraco.Compute[/* Zone */5][/* createAutoscaler */2], zone$1, name, autoscaler);
                      var partial_arg$1 = BsAsyncMonad.Callback[/* discard */12];
                      return (function (param) {
                          return partial_arg$1(partial_arg, param);
                        });
                    }), param);
      });
  };
  return BsAsyncMonad.Callback[/* >> */3](BsAsyncMonad.Callback[/* >> */3](createInstanceTemplate(/* () */0), createGroup), createAutoscaler);
}

function restart(projectId, zone, name) {
  var match = components(projectId, zone, name);
  return Curry._1(Gcloud$LidcoreDraco.Compute[/* Zone */5][/* InstanceGroupManager */3][/* recreateVMs */3], match[/* instanceGroupManager */3]);
}

function destroy(projectId, zone, name) {
  var match = components(projectId, zone, name);
  var autoscaler = match[/* autoscaler */4];
  var instanceGroupManager = match[/* instanceGroupManager */3];
  var instanceTemplate = match[/* instanceTemplate */2];
  var partial_arg = Curry._1(Gcloud$LidcoreDraco.Compute[/* Zone */5][/* Autoscaler */0][/* exists */0], autoscaler);
  var partial_arg$1 = BsAsyncMonad.Callback[/* async_if */15];
  var deleteAutoscaler = function (param) {
    return partial_arg$1(partial_arg, (function (param) {
                  return BsAsyncMonad.Callback[/* >> */3](Curry._1(Gcloud$LidcoreDraco.Compute[/* Zone */5][/* Autoscaler */0][/* delete */1], autoscaler), (function (param) {
                                var partial_arg = BsAsyncMonad.Callback[/* return */0];
                                var partial_arg$1 = BsAsyncMonad.Callback[/* repeat */13];
                                return (function (param) {
                                    return partial_arg$1((function (param) {
                                                  return Curry._1(Gcloud$LidcoreDraco.Compute[/* Zone */5][/* Autoscaler */0][/* exists */0], autoscaler);
                                                }), partial_arg, param);
                                  });
                              }));
                }), param);
  };
  var deleteGroup = function (param) {
    var partial_arg = Curry._1(Gcloud$LidcoreDraco.Compute[/* Zone */5][/* InstanceGroupManager */3][/* exists */0], instanceGroupManager);
    var partial_arg$1 = BsAsyncMonad.Callback[/* async_if */15];
    return (function (param) {
        return partial_arg$1(partial_arg, (function (param) {
                      return BsAsyncMonad.Callback[/* >> */3](Curry._1(Gcloud$LidcoreDraco.Compute[/* Zone */5][/* InstanceGroupManager */3][/* delete */2], instanceGroupManager), (function (param) {
                                    var partial_arg = BsAsyncMonad.Callback[/* return */0];
                                    var partial_arg$1 = BsAsyncMonad.Callback[/* repeat */13];
                                    return (function (param) {
                                        return partial_arg$1((function (param) {
                                                      return Curry._1(Gcloud$LidcoreDraco.Compute[/* Zone */5][/* InstanceGroupManager */3][/* exists */0], instanceGroupManager);
                                                    }), partial_arg, param);
                                      });
                                  }));
                    }), param);
      });
  };
  var deleteInstanceTemplate = function (param) {
    var partial_arg = Curry._1(Gcloud$LidcoreDraco.Compute[/* InstanceTemplate */2][/* exists */0], instanceTemplate);
    var partial_arg$1 = BsAsyncMonad.Callback[/* async_if */15];
    return (function (param) {
        return partial_arg$1(partial_arg, (function (param) {
                      return BsAsyncMonad.Callback[/* >> */3](Curry._1(Gcloud$LidcoreDraco.Compute[/* InstanceTemplate */2][/* delete */2], instanceTemplate), (function (param) {
                                    var partial_arg = BsAsyncMonad.Callback[/* return */0];
                                    var partial_arg$1 = BsAsyncMonad.Callback[/* repeat */13];
                                    return (function (param) {
                                        return partial_arg$1((function (param) {
                                                      return Curry._1(Gcloud$LidcoreDraco.Compute[/* InstanceTemplate */2][/* exists */0], instanceTemplate);
                                                    }), partial_arg, param);
                                      });
                                  }));
                    }), param);
      });
  };
  return BsAsyncMonad.Callback[/* >> */3](BsAsyncMonad.Callback[/* >> */3](deleteAutoscaler, deleteGroup), deleteInstanceTemplate);
}

var Runtime = [
  register,
  setup,
  run
];

var Config = [
  initialize,
  restart,
  destroy
];

exports.Runtime = Runtime;
exports.Config = Config;
/* instances Not a pure module */
