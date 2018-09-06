open LidcoreBsNode
open BsAsyncMonad

module Runtime : sig
  type subscription_instance = {
    topic:        string;
    subscription: string;
    handler:      unit -> Buffer.t -> unit Callback.t
  } [@@bs.deriving abstract]

  type t = [
    `Subscription of subscription_instance
  ]

  val register : string -> t -> unit
  val setup : unit -> unit Callback.t
  val run : unit -> unit
end

module Config : sig
  val initialize : projectId:string -> serviceAccount:string ->
                   zone:string ->
                   instanceTemplate:'a Js.t ->
                   autoscaler:'b Js.t -> string -> unit Callback.t
  val restart : projectId:string -> zone:string -> string -> unit Callback.t
  val destroy : projectId:string -> zone:string -> string -> unit Callback.t
end
