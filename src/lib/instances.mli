(** Abstract API to build Gcloud instances. *)

open LidcoreBsNode
open BsAsyncMonad

(** Module to register new instances. *)
module Runtime : sig
  (** Configuration for an intance whose callback is
    * executed when receiving a message. *) 
  type subscription_instance = {
    topic:        string;
    subscription: string;
    handler:      unit -> Buffer.t -> unit Callback.t
  } [@@bs.deriving abstract]

  (** Instances can be triggered either by running a simple callback
    * or by receiving a [pubsub] message. *)
  type t = [
    | `Callback of unit -> unit Callback.t
    | `Subscription of subscription_instance
  ]

  (** Register a new instance. Must be called at runtime to have 
    * this instance available. *) 
  val register : string -> t -> unit

  (** Setup all instances. Used internally to register all required
    * [pubsub] topics and subscriptions. *) 
  val setup : unit -> unit Callback.t

  (** Run instance. Used internally at runtime. *)
  val run : unit -> unit
end

(** Module used internally to configure instance groups. *)
module Config : sig
  val initialize : projectId:string -> serviceAccount:string ->
                   zone:string ->
                   instanceTemplate:'a Js.t ->
                   autoscaler:'b Js.t -> string -> unit Callback.t
  val restart : projectId:string -> zone:string -> string -> unit Callback.t
  val destroy : projectId:string -> zone:string -> string -> unit Callback.t
end
