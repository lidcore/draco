open BsAsyncMonad
open LidcoreBsNode

val project : string
val zone    : string

type config = {
  projectId:   string [@bs.optional];
  keyFilename: string [@bs.optional];
  serviceAccountEmail: string [@bs.optional];
} [@@bs.deriving abstract]

val default_config : config

module PubSub : sig
  type t

  val init : ?config:config -> unit -> t

  type topic

  val topic : t -> string -> topic Callback.t

  val publish : topic -> string -> unit Callback.t

  val publishBatch : projectId:string -> topic:string -> string array -> unit Callback.t

  type subscription

  type flow_control = {
    maxBytes:    int [@bs.optional];
    maxMessages: int [@bs.optional]
  } [@@bs.deriving abstract]

  type subscription_config = {
    flowControl: flow_control [@bs.optional];
    maxConnections: int [@bs.optional]
  } [@@bs.deriving abstract]

  val subscription : config:subscription_config -> topic:topic -> string -> subscription Callback.t 

  type msg = {
    id:        string;
    ackId:     string;
    timestamp: string;
    data:      Buffer.t
  } [@@bs.deriving abstract]

  val ack  : msg -> unit
  val nack : msg -> unit
  val subscribe : subscription -> (msg -> unit) -> unit 
end

module Compute : sig
  type t

  val init : ?config:config -> unit -> t

  val pushInterceptor : t -> 'a Js.t -> unit 

  module InstanceTemplate : sig
    type t

    val exists : t -> bool Callback.t
    val get    : t -> unit Callback.t
    val delete : t -> unit Callback.t
  end
  val instanceTemplate : t -> string -> InstanceTemplate.t
  val createInstanceTemplate : t -> string -> 'a Js.t -> InstanceTemplate.t Callback.t

  module Zone : sig
    type t

    module Autoscaler : sig
      type t

      val exists : t -> bool Callback.t
      val delete : t -> unit Callback.t
    end
    val autoscaler : t -> string -> Autoscaler.t
    val createAutoscaler : t -> string -> 'a Js.t -> Autoscaler.t Callback.t

    module InstanceGroupManager : sig
      type t

      val exists      : t -> bool Callback.t
      val get         : t -> unit Callback.t
      val delete      : t -> unit Callback.t
      val recreateVMs : t -> unit Callback.t
    end
    val instanceGroupManager : t -> string -> InstanceGroupManager.t
    val createInstanceGroupManager : ?options:'a Js.t -> targetSize:int ->
                                     instanceTemplate:InstanceTemplate.t ->
                                     t -> string -> InstanceGroupManager.t Callback.t 

    module VM : sig
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

      val getMetadata : t -> metadata Callback.t
    end
    val vm : t -> string -> VM.t
  end
  val zone : t -> string -> Zone.t
end

module Firestore : sig
  type t

  val init : ?config:config -> unit -> t

  module Document : sig
    type 'a t
    exception Not_saved
    val is_saved : [`Saved|`Unsaved] t -> bool
    val saved    : [`Saved|`Unsaved] t -> [`Saved] t
    val save     : [`Saved|`Unsaved] t -> 'a Js.t -> [`Saved] t Callback.t
    val get      : [`Saved] t -> string -> 'a
    val path     : [`Saved|`Unsaved] t -> string
    val delete   : [`Saved] t -> [`Unsaved] t Callback.t
  end
  val document : t -> string -> [`Saved|`Unsaved] Document.t Callback.t

  module QuerySnapshot : sig
    type t
    val docs : t -> [`Saved] Document.t array
  end

  module Collection : sig
    type t
    val id : t -> string
    val get : t -> QuerySnapshot.t Callback.t
  end
  val collection : t -> string -> Collection.t
  val collections: t -> Collection.t array Callback.t

  module Transaction : sig
    type 'a t

    val get    : [`Read] t -> string -> [`Saved|`Unsaved] Document.t Callback.t
    val write  : [`Read] t -> [`Write] t
    val save   : [`Write] t -> [`Saved|`Unsaved] Document.t -> 'a Js.t -> [`Saved] Document.t
    val delete : [`Write] t -> [`Saved] Document.t -> [`Unsaved] Document.t
  end

  type transaction_options = {
    maxAttempts: int
  } [@@bs.deriving abstract]

  val runTransaction : ?options:transaction_options -> t -> ([`Read] Transaction.t -> 'a Callback.t) -> 'a Callback.t

  module Counter : sig
    type t
    val incr : t -> int Callback.t
    val delete : t -> unit Callback.t
  end
  val counter : t -> string -> Counter.t

  val latest_cleanup : t -> float option Callback.t
  val cleanup_collection : t -> Collection.t -> unit Callback.t
end

module Storage : sig
  type t
  type bucket
  type file

  type url_config = {
    action:  string;
    expires: float;
    responseDisposition: string [@bs.optional]
  } [@@bs.deriving abstract]

  val init : ?config:config -> unit -> t
  val bucket : t -> string -> bucket
  val file : bucket -> string -> file
  val exists : file -> bool Callback.t
  val createReadStream : file -> Stream.readable
  val createWriteStream : file -> Stream.writable
  val getSignedUrl : config:url_config -> file -> string Callback.t
end
