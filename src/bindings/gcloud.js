// Generated by BUCKLESCRIPT VERSION 4.0.6, PLEASE EDIT WITH CARE
'use strict';

var $$Array = require("bs-platform/lib/js/array.js");
var Curry = require("bs-platform/lib/js/curry.js");
var Js_exn = require("bs-platform/lib/js/js_exn.js");
var BsAsyncMonad = require("bs-async-monad/src/bsAsyncMonad.js");
var Js_primitive = require("bs-platform/lib/js/js_primitive.js");
var Caml_exceptions = require("bs-platform/lib/js/caml_exceptions.js");
var Js_null_undefined = require("bs-platform/lib/js/js_null_undefined.js");
var Utils$LidcoreDraco = require("../lib/utils.js");
var Pubsub = require("@google-cloud/pubsub");
var Buffer$LidcoreBsNode = require("@lidcore/bs-node/src/buffer.js");
var Compute = require("@google-cloud/compute");
var Storage = require("@google-cloud/storage");
var Firestore = require("@google-cloud/firestore");
var DracoCommon$LidcoreDraco = require("../private/bin/dracoCommon.js");

var project = DracoCommon$LidcoreDraco.config(/* () */0).projectId;

var zone = DracoCommon$LidcoreDraco.config(/* () */0).zone;

var default_config = {
  projectId: project
};

function init($staropt$star, _) {
  return new Pubsub($staropt$star !== undefined ? Js_primitive.valFromOption($staropt$star) : default_config);
}

function topic(pubsub, name) {
  var t = pubsub.topic(name);
  return BsAsyncMonad.Callback[/* >> */3]((function (param) {
                t.exists(param);
                return /* () */0;
              }), (function (b) {
                var tmp;
                if (b) {
                  var partial_arg = BsAsyncMonad.Callback[/* return */0];
                  tmp = (function (param) {
                      return partial_arg(/* () */0, param);
                    });
                } else {
                  tmp = (function (param) {
                      t.create(param);
                      return /* () */0;
                    });
                }
                return BsAsyncMonad.Callback[/* >| */7](tmp, (function () {
                              return t;
                            }));
              }));
}

function subscription(config, topic, name) {
  var subscription$1 = topic.subscription(name, config);
  return BsAsyncMonad.Callback[/* >> */3]((function (param) {
                subscription$1.exists(param);
                return /* () */0;
              }), (function (ret) {
                var tmp;
                if (ret) {
                  var partial_arg = BsAsyncMonad.Callback[/* return */0];
                  tmp = (function (param) {
                      return partial_arg(/* () */0, param);
                    });
                } else {
                  tmp = (function (param) {
                      subscription$1.create(param);
                      return /* () */0;
                    });
                }
                return BsAsyncMonad.Callback[/* >> */3](tmp, (function () {
                              var partial_arg = BsAsyncMonad.Callback[/* return */0];
                              return (function (param) {
                                  return partial_arg(subscription$1, param);
                                });
                            }));
              }));
}

function subscribe(subscription, handler) {
  subscription.on("message", handler);
  return /* () */0;
}

function publish(topic, data) {
  var data$1 = Buffer$LidcoreBsNode.from(undefined, data);
  var publisher = topic.publisher();
  return (function (param) {
      publisher.publish(data$1, param);
      return /* () */0;
    });
}

function publishBatch(projectId, topic, messages) {
  var client = new (Pubsub.v1.PublisherClient)();
  var request_topic = client.topicPath(projectId, topic);
  var messages$1 = $$Array.map((function (msg) {
          return {
                  data: Buffer$LidcoreBsNode.from(undefined, msg)
                };
        }), messages);
  var request = {
    topic: request_topic,
    messages: messages$1
  };
  return (function (param) {
      client.publish(request, param);
      return /* () */0;
    });
}

function init$1($staropt$star, _) {
  return new Compute($staropt$star !== undefined ? Js_primitive.valFromOption($staropt$star) : default_config);
}

function pushInterceptor(c, x) {
  c.interceptors.push(x);
  return /* () */0;
}

function createInstanceGroupManager(targetSize, instanceTemplate, t, name) {
  var options = {
    instanceTemplate: instanceTemplate,
    targetSize: targetSize
  };
  return (function (param) {
      t.createInstanceGroupManager(name, options, param);
      return /* () */0;
    });
}

function init$2($staropt$star, _) {
  return new Firestore($staropt$star !== undefined ? Js_primitive.valFromOption($staropt$star) : default_config);
}

var Not_saved = Caml_exceptions.create("Gcloud-LidcoreDraco.Firestore.Document.Not_saved");

function is_saved(param) {
  return param[1] !== undefined;
}

function saved(doc) {
  if (doc[1] === undefined) {
    throw Not_saved;
  }
  return doc;
}

function process_snapshot(ref, snapshot) {
  if (snapshot.exists) {
    var partial_arg_001 = Js_primitive.some(snapshot.data());
    var partial_arg = /* tuple */[
      ref,
      partial_arg_001
    ];
    var partial_arg$1 = BsAsyncMonad.Callback[/* return */0];
    return (function (param) {
        return partial_arg$1(partial_arg, param);
      });
  } else {
    var partial_arg$2 = /* tuple */[
      ref,
      undefined
    ];
    var partial_arg$3 = BsAsyncMonad.Callback[/* return */0];
    return (function (param) {
        return partial_arg$3(partial_arg$2, param);
      });
  }
}

function save(param, data) {
  var ref = param[0];
  data.timestamp = Date.now();
  var partial_arg = param[1] === undefined ? ref.create(data) : ref.update(data);
  return BsAsyncMonad.Callback[/* >> */3]((function (param) {
                return BsAsyncMonad.from_promise(partial_arg, param);
              }), (function () {
                var partial_arg_001 = Js_primitive.some(data);
                var partial_arg = /* tuple */[
                  ref,
                  partial_arg_001
                ];
                var partial_arg$1 = BsAsyncMonad.Callback[/* return */0];
                return (function (param) {
                    return partial_arg$1(partial_arg, param);
                  });
              }));
}

function get(param, key) {
  var data = param[1];
  if (data !== undefined) {
    return Js_null_undefined.fromOption(Js_primitive.undefined_to_opt(Js_primitive.valFromOption(data)[key]));
  } else {
    return null;
  }
}

function path(param) {
  return param[0].path;
}

function $$delete(param) {
  var ref = param[0];
  var partial_arg = ref.delete();
  return BsAsyncMonad.Callback[/* >| */7]((function (param) {
                return BsAsyncMonad.from_promise(partial_arg, param);
              }), (function () {
                return /* tuple */[
                        ref,
                        undefined
                      ];
              }));
}

function $$document(firestore, name) {
  var ref = firestore.doc(name);
  var partial_arg = ref.get();
  return BsAsyncMonad.Callback[/* >> */3]((function (param) {
                return BsAsyncMonad.from_promise(partial_arg, param);
              }), (function (param) {
                return process_snapshot(ref, param);
              }));
}

function docs(q) {
  return $$Array.map((function (d) {
                return /* tuple */[
                        d.ref,
                        Js_primitive.some(d.data())
                      ];
              }), q.docs);
}

var QuerySnapshot = /* module */[/* docs */docs];

function get$1(c) {
  var partial_arg = c.get();
  return (function (param) {
      return BsAsyncMonad.from_promise(partial_arg, param);
    });
}

function collections(db) {
  var partial_arg = db.getCollections();
  return (function (param) {
      return BsAsyncMonad.from_promise(partial_arg, param);
    });
}

function get$2(param, name) {
  var ref = param[1].doc(name);
  var partial_arg = param[0].get(ref);
  return BsAsyncMonad.Callback[/* >> */3]((function (param) {
                return BsAsyncMonad.from_promise(partial_arg, param);
              }), (function (param) {
                return process_snapshot(ref, param);
              }));
}

function write(tr) {
  return tr;
}

function save$1(param, param$1, data) {
  var ref = param$1[0];
  var tr = param[0];
  data.timestamp = Date.now();
  if (param$1[1] === undefined) {
    tr.create(ref, data);
  } else {
    tr.update(ref, data);
  }
  return /* tuple */[
          ref,
          Js_primitive.some(data)
        ];
}

function $$delete$1(param, param$1) {
  var ref = param$1[0];
  param[0].delete(ref);
  return /* tuple */[
          ref,
          undefined
        ];
}

var Transaction = /* module */[
  /* get */get$2,
  /* write */write,
  /* save */save$1,
  /* delete */$$delete$1
];

function runTransaction(options, firestore, fn) {
  var options$1 = Js_null_undefined.fromOption(options);
  var run = function (tr) {
    try {
      return BsAsyncMonad.to_promise(Curry._1(fn, /* tuple */[
                      tr,
                      firestore
                    ]));
    }
    catch (raw_exn){
      return Promise.reject(Js_exn.internalToOCamlException(raw_exn));
    }
  };
  var partial_arg = firestore.runTransaction(run, options$1);
  return (function (param) {
      return BsAsyncMonad.from_promise(partial_arg, param);
    });
}

var options = {
  maxAttempts: 10
};

function incr(param) {
  var path = param[1];
  return runTransaction(Js_primitive.some(options), param[0], (function (tr) {
                return BsAsyncMonad.Callback[/* >> */3](get$2(tr, path), (function (doc) {
                              var match = get(doc, "counter");
                              var v = (match == null) ? 1 : match + 1 | 0;
                              save$1(tr, doc, {
                                    counter: v
                                  });
                              var partial_arg = BsAsyncMonad.Callback[/* return */0];
                              return (function (param) {
                                  return partial_arg(v, param);
                                });
                            }));
              }));
}

function $$delete$2(param) {
  return BsAsyncMonad.Callback[/* >> */3]($$document(param[0], param[1]), (function (doc) {
                return BsAsyncMonad.Callback[/* >| */7]($$delete(doc), (function () {
                              return /* () */0;
                            }));
              }));
}

function counter(firestore, name) {
  return /* tuple */[
          firestore,
          name
        ];
}

function latest_cleanup(db) {
  return BsAsyncMonad.Callback[/* >| */7]($$document(db, "admin/latest_cleanup"), (function (doc) {
                try {
                  var doc$1 = saved(doc);
                  return Js_primitive.some(get(doc$1, "timestamp"));
                }
                catch (exn){
                  if (exn === Not_saved) {
                    return undefined;
                  } else {
                    throw exn;
                  }
                }
              }));
}

var cleanup_after = 5 * 24 * 60 * 60 * 1000;

function cleanup_collection(db, c) {
  var now = Date.now();
  var cleanup = function (docs) {
    return runTransaction(undefined, db, (function (tr) {
                  $$Array.iter((function (doc) {
                          $$delete$1(tr, doc);
                          return /* () */0;
                        }), docs);
                  var partial_arg = BsAsyncMonad.Callback[/* return */0];
                  return (function (param) {
                      return partial_arg(/* () */0, param);
                    });
                }));
  };
  var c$1 = c.where("timestamp", "<=", now - cleanup_after);
  var partial_arg = c$1.get();
  return BsAsyncMonad.Callback[/* >> */3]((function (param) {
                return BsAsyncMonad.from_promise(partial_arg, param);
              }), (function (query) {
                var docs$1 = docs(query);
                var partial_arg = Utils$LidcoreDraco.partition(500, docs$1);
                var partial_arg$1 = BsAsyncMonad.Callback[/* itera */20];
                return (function (param) {
                    return partial_arg$1(undefined, cleanup, partial_arg, param);
                  });
              }));
}

function init$3($staropt$star, _) {
  var config = $staropt$star !== undefined ? Js_primitive.valFromOption($staropt$star) : default_config;
  var gcs = Storage(config);
  var request = function (ops) {
    ops.forever = false;
    return ops;
  };
  var interceptor = {
    request: request
  };
  gcs.interceptors.push(interceptor);
  return gcs;
}

function getSignedUrl(config, file, cb) {
  file.getSignedUrl(config, cb);
  return /* () */0;
}

function PubSub_005(prim) {
  prim.ack();
  return /* () */0;
}

function PubSub_006(prim) {
  prim.nack();
  return /* () */0;
}

var PubSub = [
  init,
  topic,
  publish,
  publishBatch,
  subscription,
  PubSub_005,
  PubSub_006,
  subscribe
];

var Compute_002 = [
  (function (prim, prim$1) {
      prim.exists(prim$1);
      return /* () */0;
    }),
  (function (prim, prim$1) {
      prim.get(prim$1);
      return /* () */0;
    }),
  (function (prim, prim$1) {
      prim.delete(prim$1);
      return /* () */0;
    })
];

function Compute_003(prim, prim$1) {
  return prim.instanceTemplate(prim$1);
}

function Compute_004(prim, prim$1, prim$2, prim$3) {
  prim.createInstanceTemplate(prim$1, prim$2, prim$3);
  return /* () */0;
}

var Compute_005 = [
  [
    (function (prim, prim$1) {
        prim.exists(prim$1);
        return /* () */0;
      }),
    (function (prim, prim$1) {
        prim.delete(prim$1);
        return /* () */0;
      })
  ],
  (function (prim, prim$1) {
      return prim.autoscaler(prim$1);
    }),
  (function (prim, prim$1, prim$2, prim$3) {
      prim.createAutoscaler(prim$1, prim$2, prim$3);
      return /* () */0;
    }),
  [
    (function (prim, prim$1) {
        prim.exists(prim$1);
        return /* () */0;
      }),
    (function (prim, prim$1) {
        prim.get(prim$1);
        return /* () */0;
      }),
    (function (prim, prim$1) {
        prim.delete(prim$1);
        return /* () */0;
      }),
    (function (prim, prim$1) {
        prim.recreateVMs(prim$1);
        return /* () */0;
      })
  ],
  (function (prim, prim$1) {
      return prim.instanceGroupManager(prim$1);
    }),
  createInstanceGroupManager,
  [(function (prim, prim$1) {
        prim.getMetadata(prim$1);
        return /* () */0;
      })],
  (function (prim, prim$1) {
      return prim.vm(prim$1);
    })
];

function Compute_006(prim, prim$1) {
  return prim.zone(prim$1);
}

var Compute$1 = [
  init$1,
  pushInterceptor,
  Compute_002,
  Compute_003,
  Compute_004,
  Compute_005,
  Compute_006
];

var Firestore_001 = [
  Not_saved,
  is_saved,
  saved,
  save,
  get,
  path,
  $$delete
];

var Firestore_004 = [
  (function (prim) {
      return prim.id;
    }),
  get$1
];

function Firestore_005(prim, prim$1) {
  return prim.collection(prim$1);
}

var Firestore_009 = [
  incr,
  $$delete$2
];

var Firestore$1 = [
  init$2,
  Firestore_001,
  $$document,
  QuerySnapshot,
  Firestore_004,
  Firestore_005,
  collections,
  Transaction,
  runTransaction,
  Firestore_009,
  counter,
  latest_cleanup,
  cleanup_collection
];

function Storage_001(prim, prim$1) {
  return prim.bucket(prim$1);
}

function Storage_002(prim, prim$1) {
  return prim.file(prim$1);
}

function Storage_003(prim, prim$1) {
  prim.exists(prim$1);
  return /* () */0;
}

function Storage_004(prim) {
  return prim.createReadStream();
}

function Storage_005(prim) {
  return prim.createWriteStream();
}

var Storage$1 = [
  init$3,
  Storage_001,
  Storage_002,
  Storage_003,
  Storage_004,
  Storage_005,
  getSignedUrl
];

exports.project = project;
exports.zone = zone;
exports.default_config = default_config;
exports.PubSub = PubSub;
exports.Compute = Compute$1;
exports.Firestore = Firestore$1;
exports.Storage = Storage$1;
/* project Not a pure module */
