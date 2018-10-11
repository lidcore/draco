open LidcoreBsNode
open BsAsyncMonad
open BsAsyncMonad.Callback

let project = (DracoCommon.config ())##projectId

let zone = (DracoCommon.config ())##zone

type config = {
  projectId:   string [@bs.optional];
  keyFilename: string [@bs.optional];
  serviceAccountEmail: string [@bs.optional];
} [@@bs.deriving abstract]

let default_config =
  config ~projectId:project ()

module PubSub = struct
  type t
  external pubsub : config -> t = "@google-cloud/pubsub" [@@bs.module] [@@bs.new]

  let init ?(config=default_config) () =
    pubsub config

  type topic
  external topic : t -> string -> topic = "" [@@bs.send]

  external create_topic : topic -> unit Callback.callback -> unit = "create" [@@bs.send]
  external topic_exists : topic -> bool Callback.callback -> unit = "exists" [@@bs.send]

  let topic pubsub name =
    let t = topic pubsub name in
    topic_exists t >> fun b ->
      (if b then return () else
        create_topic t) >| fun () -> t

  type subscription

  type flow_control = {
    maxBytes:    int [@bs.optional];
    maxMessages: int [@bs.optional]
  } [@@bs.deriving abstract]

  type subscription_config = {
    flowControl: flow_control [@bs.optional];
    maxConnections: int [@bs.optional]
  } [@@bs.deriving abstract]

  external subscription : topic -> string -> subscription_config -> subscription = "" [@@bs.send]
  external subscription_exists : subscription -> bool Callback.callback -> unit = "exists" [@@bs.send]
  external create_subscription : subscription -> unit Callback.callback -> unit = "create" [@@bs.send] 

  let subscription ~config ~topic name =
    let subscription = subscription topic name config in
    subscription_exists subscription >> fun ret ->
      (if ret then return () else
        create_subscription subscription) >> fun _ ->
          return subscription

  type msg = {
    id:        string;
    ackId:     string;
    timestamp: string;
    data:      Buffer.t
  } [@@bs.deriving abstract]
  external ack : msg -> unit = "" [@@bs.send]
  external nack : msg -> unit = "" [@@bs.send]
  external on : subscription -> string -> (msg -> unit) -> unit = "" [@@bs.send]

  let subscribe subscription handler =
    on subscription "message" handler

  type publisher
  external publisher : topic -> publisher = "" [@@bs.send]
  external publish : publisher -> Buffer.t -> unit callback -> unit = "" [@@bs.send]

  let publish topic data =
    let data = Buffer.from data in
    let publisher = publisher topic in
      publish publisher data 


  type publisher_client
  external publisher_client : unit -> publisher_client = "PublisherClient" [@@bs.new] [@@bs.scope "v1"] [@@bs.module "@google-cloud/pubsub"]

  external topicPath : publisher_client -> string -> string -> string = "" [@@bs.send]

  type message_element = {
    element_data: Buffer.t [@bs.as "data"];
  } [@@bs.deriving abstract]

  type publish_request = {
    request_topic: string [@bs.as "topic"];
    messages: message_element array
  } [@@bs.deriving abstract]

  external publishBatch : publisher_client -> publish_request -> unit callback -> unit = "publish" [@@bs.send] 
  let publishBatch ~projectId ~topic messages =
    let client = publisher_client () in
    let request_topic =
      topicPath client projectId topic
    in
    let messages =
      Array.map (fun msg ->
                   let element_data = Buffer.from msg in
                   message_element ~element_data)
                 messages
    in
    let request =
      publish_request ~request_topic ~messages
    in
    publishBatch client request
end

module Compute = struct
  type t

  external init : config -> t = "@google-cloud/compute" [@@bs.module] [@@bs.new]
  let init ?(config=default_config) () = init config

  external interceptors : t -> 'a Js.t array = "" [@@bs.get]

  let pushInterceptor c x =
    ignore(Js.Array.push x (interceptors c))

  module InstanceTemplate = struct
    type t

    external exists : t -> bool Callback.callback -> unit = "" [@@bs.send]
    external get    : t -> unit Callback.callback -> unit = "" [@@bs.send]
    external delete : t -> unit Callback.callback -> unit = "" [@@bs.send]
  end
  external instanceTemplate : t -> string -> InstanceTemplate.t = "" [@@bs.send]
  external createInstanceTemplate : t -> string -> 'a Js.t -> InstanceTemplate.t Callback.callback -> unit = "" [@@bs.send]

  module Zone = struct
    type t

    module Autoscaler = struct
      type t
      external exists : t -> bool Callback.callback -> unit = "" [@@bs.send]
      external delete : t -> unit Callback.callback -> unit = "" [@@bs.send]
    end
    external autoscaler : t -> string -> Autoscaler.t = "" [@@bs.send]
    external createAutoscaler : t -> string -> 'a Js.t -> Autoscaler.t Callback.callback -> unit = "" [@@bs.send]

    module InstanceGroupManager = struct
      type t
      external exists : t -> bool Callback.callback -> unit = "" [@@bs.send]
      external get    : t -> unit Callback.callback -> unit = "" [@@bs.send]
      external delete : t -> unit Callback.callback -> unit = "" [@@bs.send]
      external recreateVMs : t -> unit Callback.callback -> unit = "" [@@bs.send]
    end
    external instanceGroupManager : t -> string -> InstanceGroupManager.t = "" [@@bs.send]

    type createInstanceOptions = {
      instanceTemplate: InstanceTemplate.t;
      targetSize: int
    } [@@bs.deriving abstract]

    external createInstanceGroupManager : t -> string -> createInstanceOptions -> InstanceGroupManager.t Callback.callback -> unit = "" [@@bs.send]
    let createInstanceGroupManager ~targetSize ~instanceTemplate t name =
      let options =
        createInstanceOptions ~targetSize ~instanceTemplate
      in
      createInstanceGroupManager t name options

    module VM = struct
      type t

      type item = {
        key:   string;
        value: string
      } [@@bs.deriving abstract]

      type items = {
        items: item array
      } [@@bs.deriving abstract]

      type metadata = {
        metadata: items
      } [@@bs.deriving abstract]

      external getMetadata : t -> metadata Callback.callback -> unit = "" [@@bs.send]
    end
    external vm : t -> string -> VM.t = "" [@@bs.send]
  end
  external zone : t -> string -> Zone.t = "" [@@bs.send]
end

module Firestore = struct
  type t

  external init : config -> t = "@google-cloud/firestore" [@@bs.module] [@@bs.new]
  let init ?(config=default_config) () = init config

  module Document = struct
    type ref
    type snapshot
    type data = string Js.Dict.t
    type 'a t = ref*(data option)

    exception Not_saved

    let is_saved (_,data) =
      data <> None

    let saved ((_,data) as doc) =
      if data = None then raise Not_saved;
      doc

    external data : snapshot -> data = "" [@@bs.send]

    external exists : snapshot -> bool = "" [@@bs.get]

    external get : ref -> snapshot Js.Promise.t = "" [@@bs.send]

    let process_snapshot ref snapshot =
      if exists snapshot then
        return (ref,Some (data snapshot))
      else
        return (ref,None)

    let get_doc ref =
      from_promise (get ref) >> process_snapshot ref

    external create : ref -> data -> unit Js.Promise.t = "" [@@bs.send]
    external update : ref -> data -> unit Js.Promise.t = "" [@@bs.send]

    let save (ref,old_data) data =
      let data = Obj.magic data in
      data##timestamp #= (Js.Date.now ());
      from_promise
        (if old_data = None then
           create ref data
         else
           update ref data) >> fun _ ->
        return (ref,Some data)

    let get (_,data) key =
      Obj.magic
        (match data with
           | Some hash ->
               Js.Nullable.fromOption (Js.Dict.get hash key)
           | None ->
               Js.Nullable.null)

    external path : ref -> string = "" [@@bs.get]
    let path (ref,_) =
      path ref

    external delete : ref -> unit Js.Promise.t = "" [@@bs.send]
    let delete (ref,_) =
      from_promise (delete ref) >| fun _ ->
        (ref,None)
  end

  external doc : t -> string -> Document.ref = "" [@@bs.send]
  let document firestore name =
    Document.get_doc (doc firestore name)

  module QuerySnapshot = struct
    type t
    type query_document

    external docs : t -> query_document array = "" [@@bs.get]
    external ref : query_document -> Document.ref = "" [@@bs.get]
    external data : query_document -> Document.data = "" [@@bs.send]

    let docs q =
      Array.map (fun d ->
        ref d, Some (data d)) (docs q)
  end

  module Collection = struct
    type t

    external id : t -> string = "" [@@bs.get]

    external get : t -> QuerySnapshot.t Js.Promise.t = "" [@@bs.send]
    let get c =
      from_promise (get c)

    (* This limited to the cleanup use for now. *)
    external where : t -> string -> string -> float -> t = "" [@@bs.send]
  end

  external collection : t -> string -> Collection.t = "" [@@bs.send]
  external getCollections : t -> Collection.t array Js.Promise.t = "" [@@bs.send]
  let collections db =
    from_promise (getCollections db)

  module Transaction = struct
    type firestore = t
    type tr
    type 'a t = tr*firestore

    external _get : tr -> Document.ref -> Document.snapshot Js.Promise.t = "get" [@@bs.send]
    let get (tr,firestore) name =
      let ref = doc firestore name in
      from_promise (_get tr ref) >> Document.process_snapshot ref

    let write tr = tr

    external update : tr -> Document.ref -> Document.data -> unit = "" [@@bs.send]
    external create : tr -> Document.ref -> Document.data -> unit = "" [@@bs.send]

    let save (tr,_) (ref,old_data) data =
      let data = Obj.magic data in
      data##timestamp #= (Js.Date.now ());
      let () =
        if old_data = None then
          create tr ref data
        else
          update tr ref data
      in
      (ref,Some data)

    external delete : tr -> Document.ref -> unit = "" [@@bs.send]
    let delete (tr,_) (ref,_) =
      delete tr ref;
      (ref,None)
  end

  type transaction_options = {
    maxAttempts: int
  } [@@bs.deriving abstract]

  external runTransaction : t -> (Transaction.tr -> 'a Js.Promise.t [@bs]) -> transaction_options Js.Nullable.t -> 'a Js.Promise.t = "" [@@bs.send]
  let runTransaction ?options firestore fn =
    let options =
      Js.Nullable.fromOption options
    in
    let run = fun [@bs] tr ->
      try
        to_promise (fn (tr,firestore))
      with
        | exn -> Js.Promise.reject exn
    in
    from_promise (runTransaction firestore run options)

  module Counter = struct
    type firestore = t
    type t = firestore*string
    let options =
      transaction_options ~maxAttempts:10
    let incr (firestore,path) =
      runTransaction ~options firestore (fun tr ->
        Transaction.get tr path >> fun doc ->
          let tr = Transaction.write tr in
          let v =
            match Js.Nullable.toOption (Document.get doc "counter") with
              | Some v -> v + 1
              | None -> 1
          in
          ignore(Transaction.save tr doc [%bs.obj{counter=v}]);
          return v)
    let delete (firestore,path) =
      document firestore path >> fun doc ->
        Document.delete doc >| ignore
  end
  let counter firestore name =
    firestore,name

  let latest_cleanup_key = "admin/latest_cleanup"
  let latest_cleanup db =
    document db latest_cleanup_key >| fun doc ->
      try
        let doc = Document.saved doc in
        Some (Document.get doc "timestamp")
      with Document.Not_saved -> None

  let cleanup_after =
    (* 5 days, in float since JS int suxx *)
    5. *. 24. *. 60. *. 60. *. 1000.

  let max_write_documents = 500

  let cleanup_collection db c =
    let now = Js.Date.now () in
    let cleanup docs =
      runTransaction db (fun tr ->
        let tr = Transaction.write tr in
        Array.iter (fun doc -> ignore(Transaction.delete tr doc))
                   docs;
        return ())
    in
    let c =
      Collection.where c "timestamp" "<=" (now -. cleanup_after)
    in
    Collection.get c >> fun query ->
      let docs =
        QuerySnapshot.docs query
      in
      Callback.itera cleanup (Utils.partition max_write_documents docs)
end

module Storage = struct
  type t
  type bucket
  type file

  type url_config = {
    action:  string;
    contentType: string [@bs.optional];
    expires: float;
    responseDisposition: string [@bs.optional];
    responseType: string [@bs.optional]
  } [@@bs.deriving abstract]

  external init : config -> t = "@google-cloud/storage" [@@bs.module]

  (* See: https://github.com/firebase/functions-samples/issues/269#issuecomment-342796212 *)
  type reqOps = {
    mutable forever: bool
  } [@@bs.deriving abstract]

  type interceptor = {
    request: reqOps -> reqOps;
  } [@@bs.deriving abstract]

  external interceptors : t -> interceptor array = "" [@@bs.get]

  let init ?(config=default_config) () =
    let gcs = init config in
    let request ops =
      foreverSet ops false;
      ops
    in
    let interceptor =
      interceptor ~request
    in
    ignore(Js.Array.push interceptor (interceptors gcs));
    gcs

  external bucket : t -> string -> bucket = "" [@@bs.send]
  external file : bucket -> string -> file = "" [@@bs.send]
  external exists : file -> bool callback -> unit = "" [@@bs.send]
  external createReadStream : file -> Stream.readable = "" [@@bs.send]
  external createWriteStream : file -> Stream.writable = "" [@@bs.send]
  external getSignedUrl : file -> url_config -> string callback -> unit = "" [@@bs.send]

  let getSignedUrl ~config file cb =
    getSignedUrl file config cb
end
