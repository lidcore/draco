(** Abstract API to create Firebase functions. *)

open BsAsyncMonad
open LidcoreBsNode

type fn

(** [true] if the code is running inside the firebase functions environment. *)
val running : bool

(** Module to build http-based functions. *)
module Http : sig
  type t

  type request

  type response_body = [
    | `String of string
    | `Json of Js.Json.t
    | `Stream of Stream.readable
  ]

  type response
  type handler = request -> response Callback.t

  val body   : request -> 'a
  val param  : request -> string -> string option
  val params : request -> string Js.Dict.t
  val query  : request -> string -> string option

  val response : ?code:int -> ?headers:(string, string) Hashtbl.t -> response_body -> response
  val error    :  code:int -> string  -> 'a Callback.t

  val init : unit -> t

  val get  : ?auth:bool -> t -> string -> handler -> unit
  val post : ?auth:bool -> t -> string -> handler -> unit 
  val put  : ?auth:bool -> t -> string -> handler -> unit

  val export : t -> fn
end

(** Module to build event-based functions. *)
module Event : sig
  type handler = unit Callback.t
  val subscribe : string -> ('a Js.t -> handler) -> fn
end
